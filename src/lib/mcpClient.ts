/**
 * MCP HTTP client used by every command.
 *
 * Speaks JSON-RPC 2.0 over POST /mcp on the BuzzBit X server using the
 * Streamable HTTP transport. We do NOT pull in @modelcontextprotocol/sdk
 * (a Node SDK exists but it's a heavy dep for what we need — a plain
 * fetch is enough since the server is stateless and we don't keep a
 * session open).
 *
 * Every CLI command becomes:
 *   const result = await callTool('list_customers', { limit: 20 });
 *   formatter.print(result);
 *
 * The server returns CallToolResult with `content: [{ type: 'text', text: '...' }]`.
 * Tool handlers JSON-stringify their payload into that text block — we parse
 * it back to a plain object here so commands work with structured data.
 *
 * Supports both plain JSON and SSE responses (the Streamable HTTP transport
 * may use either depending on server config).
 */

import { resolveAuth } from './config.js';
import { AuthError, McpError, TransportError } from './errors.js';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: JsonRpcError;
}

interface ToolContentText {
  type: 'text';
  text: string;
}

interface CallToolResult {
  content: ToolContentText[];
  isError?: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  return isPlainObject(value) && value.jsonrpc === '2.0' && 'id' in value;
}

function isCallToolResult(value: unknown): value is CallToolResult {
  if (!isPlainObject(value)) return false;
  if (!Array.isArray(value.content)) return false;
  return value.content.every(
    (c) => isPlainObject(c) && c.type === 'text' && typeof c.text === 'string',
  );
}

/**
 * Parse an SSE response body into the JSON-RPC envelope. The Streamable HTTP
 * transport may stream the response as `event: message\ndata: {...}\n\n`.
 */
function parseSseBody(body: string): JsonRpcResponse | null {
  for (const block of body.split('\n\n')) {
    const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
    if (!dataLine) continue;
    const json = dataLine.slice(5).trim();
    if (!json) continue;
    try {
      const parsed: unknown = JSON.parse(json);
      if (isJsonRpcResponse(parsed)) return parsed;
    } catch {
      // Try next block
    }
  }
  return null;
}

async function postJsonRpc(
  apiUrl: string,
  apiKey: string,
  payload: JsonRpcRequest,
): Promise<JsonRpcResponse> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/+$/, '')}/mcp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new TransportError(`Network error contacting ${apiUrl}: ${msg}`);
  }

  if (response.status === 401) {
    throw new AuthError(
      'API key rejected (401). Run: bbx auth login --key=bz_live_…',
    );
  }
  if (response.status === 429) {
    throw new McpError('Rate limit exceeded (429). Wait a moment and retry.', 'RATE_LIMITED');
  }

  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  let envelope: JsonRpcResponse | null = null;
  if (contentType.includes('text/event-stream')) {
    envelope = parseSseBody(text);
  } else if (contentType.includes('application/json') || text.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (isJsonRpcResponse(parsed)) envelope = parsed;
    } catch {
      envelope = null;
    }
  }

  if (!envelope) {
    throw new TransportError(
      `Unexpected response from ${apiUrl}/mcp (HTTP ${response.status}): ${text.slice(0, 200)}`,
    );
  }
  if (envelope.error) {
    throw new McpError(envelope.error.message, String(envelope.error.code));
  }
  return envelope;
}

let requestId = 0;

/**
 * Call an MCP tool by name and return the parsed JSON payload from the
 * first text content block. Tools always serialize their structured
 * output as JSON in the text block (see jsonResult helper in server).
 */
export async function callTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const { apiKey, apiUrl } = resolveAuth();
  if (!apiKey) {
    throw new AuthError(
      'Not authenticated. Run: bbx auth login --key=bz_live_…',
    );
  }

  requestId += 1;
  const payload: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  };

  const envelope = await postJsonRpc(apiUrl, apiKey, payload);
  const result = envelope.result;
  if (!isCallToolResult(result)) {
    throw new McpError(
      `Tool ${toolName} returned unexpected shape (no content[0].text).`,
    );
  }

  const firstText = result.content[0]?.text ?? '';
  if (result.isError) {
    // Tool reported an error inside CallToolResult; surface its JSON body.
    try {
      const errPayload: unknown = JSON.parse(firstText);
      if (
        isPlainObject(errPayload) &&
        isPlainObject(errPayload.error) &&
        typeof errPayload.error.message === 'string'
      ) {
        const code =
          typeof errPayload.error.code === 'string' ? errPayload.error.code : 'TOOL_ERROR';
        throw new McpError(errPayload.error.message, code);
      }
    } catch (err) {
      if (err instanceof McpError) throw err;
      // Fall through to generic error below
    }
    throw new McpError(`Tool ${toolName} failed: ${firstText}`);
  }

  try {
    return JSON.parse(firstText) as T;
  } catch {
    throw new McpError(`Tool ${toolName} returned non-JSON text: ${firstText.slice(0, 200)}`);
  }
}

/**
 * Call tools/list and return tool metadata. Used by `bbx tools list`.
 */
export interface ToolListEntry {
  name: string;
  description: string;
  inputSchema?: unknown;
}

export async function listAllTools(): Promise<ToolListEntry[]> {
  const { apiKey, apiUrl } = resolveAuth();
  if (!apiKey) {
    throw new AuthError('Not authenticated. Run: bbx auth login --key=bz_live_…');
  }
  requestId += 1;
  const envelope = await postJsonRpc(apiUrl, apiKey, {
    jsonrpc: '2.0',
    id: requestId,
    method: 'tools/list',
  });
  const result = envelope.result;
  if (
    !isPlainObject(result) ||
    !Array.isArray(result.tools) ||
    !result.tools.every(
      (t) =>
        isPlainObject(t) &&
        typeof t.name === 'string' &&
        typeof t.description === 'string',
    )
  ) {
    throw new McpError('tools/list returned unexpected shape');
  }
  return result.tools as ToolListEntry[];
}

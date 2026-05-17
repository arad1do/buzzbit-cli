/**
 * `bbx flows` — list, performance, activate, cancel.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';
import { FLOW_TRIGGER_VALUES } from '../lib/generated-enums.js';

const FLOW_TABLE_COLS = ['id', 'name', 'trigger', 'status', 'totalSent', 'updatedAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List email flows in the active workspace')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('-s, --status <status>', 'Filter by status (active, paused, draft)')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; status?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_flows', args);
      printResult(result, { format: parseFormat(opts.format), columns: FLOW_TABLE_COLS });
    });
}

function buildPerformanceCommand(): Command {
  return new Command('performance')
    .description('Get performance metrics for a flow')
    .argument('<id>', 'Flow id')
    .option('--period <period>', 'last_7_days | last_30_days | last_90_days', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { period?: string; format?: string }) => {
      if (!id) throw new ValidationError('Flow id required');
      const result = await callTool('get_flow_performance', {
        flowId: id,
        period: opts.period ?? 'last_30_days',
      });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildActivateCommand(): Command {
  return new Command('activate')
    .description('Activate a flow draft (moves DRAFT → ACTIVE)')
    .argument('<id>', 'Flow id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Flow id required');
      const result = await callTool('activate_flow', { flowId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildCancelCommand(): Command {
  return new Command('cancel')
    .description('Cancel a pending undo-queue action (campaign send / social publish)')
    .argument('<actionId>', 'Pending action id from McpUndoQueue')
    .option('--format <format>', 'table | json', 'table')
    .action(async (actionId: string, opts: { format?: string }) => {
      if (!actionId) throw new ValidationError('Action id required');
      const result = await callTool('cancel_pending_action', { actionId });
      printRecord(result, parseFormat(opts.format));
    });
}

// Pick a friendly sample of trigger names for --help text. The full list
// (49 values incl. deprecated aliases) lives in the generated-enums file
// and is the source of truth for runtime validation.
const COMMON_TRIGGERS = [
  'cart_abandoned',
  'browse_abandoned',
  'new_subscriber',
  'order_placed',
  'order_fulfilled',
  'customer_birthday',
  'product_back_in_stock',
  'product_price_drop',
] as const;

function buildCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a new email flow draft')
    .requiredOption('--name <name>', 'Internal flow name')
    .option(
      '--trigger <trigger>',
      `Event that fires the flow. Common: ${COMMON_TRIGGERS.join(' | ')}. ` +
        `Full list (${FLOW_TRIGGER_VALUES.length} values): see https://buzzbitx.com/docs/mcp#flows or 'bbx mcp flows create-flow-draft --help'.`,
    )
    .option('--description <text>', 'Optional description')
    .option(
      '--nodes-file <path>',
      'Path to a JSON file containing the ReactFlow graph ({ nodes: [], edges: [] }). Defaults to an empty canvas the merchant can design later in the UI.',
    )
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { name: string; trigger?: string; description?: string; nodesFile?: string; format?: string }) => {
      // Validate trigger against the canonical list resolved from the server source.
      if (opts.trigger !== undefined && !(FLOW_TRIGGER_VALUES as readonly string[]).includes(opts.trigger)) {
        throw new ValidationError(
          `Unknown trigger '${opts.trigger}'. Common values: ${COMMON_TRIGGERS.join(', ')}. ` +
            `Run 'bbx mcp flows create-flow-draft --help' for the full list.`,
        );
      }
      const args: Record<string, unknown> = { name: opts.name };
      if (opts.trigger) args.trigger = opts.trigger;
      if (opts.description) args.description = opts.description;
      if (opts.nodesFile) {
        const fs = await import('node:fs');
        try {
          const raw = fs.readFileSync(opts.nodesFile, 'utf8');
          args.nodes = JSON.parse(raw);
        } catch (err) {
          throw new ValidationError(
            `Failed to read --nodes-file '${opts.nodesFile}': ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      const result = await callTool('create_flow_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateDraftCommand(): Command {
  return new Command('update-draft')
    .description('Update an existing flow draft')
    .argument('<id>', 'Flow id')
    .option('--name <name>')
    .option('--description <text>')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { name?: string; description?: string; format?: string }) => {
      if (!id) throw new ValidationError('Flow id required');
      const args: Record<string, unknown> = { flowId: id };
      if (opts.name) args.name = opts.name;
      if (opts.description) args.description = opts.description;
      const result = await callTool('update_flow_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildChatCommand(): Command {
  return new Command('chat')
    .description('Conversation chat flows (WhatsApp / Instagram / Messenger chatbots)')
    .addCommand(
      new Command('list')
        .description('List chat flows')
        .option('-s, --status <status>', 'draft | active | paused')
        .option('-l, --limit <n>', 'Max rows', '20')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { status?: string; limit?: string; format?: string }) => {
          const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
          const args: Record<string, unknown> = { limit };
          if (opts.status) args.status = opts.status;
          const result = await callTool('list_chat_flows', args);
          printResult(result, {
            format: parseFormat(opts.format),
            columns: ['id', 'name', 'trigger', 'status', 'executionCount', 'updatedAt'],
          });
        }),
    )
    .addCommand(
      new Command('get')
        .description('Get one chat flow including its full node graph')
        .argument('<id>', 'Chat flow id')
        .option('--format <format>', 'table | json', 'json')
        .action(async (id: string, opts: { format?: string }) => {
          if (!id) throw new ValidationError('Chat flow id required');
          const result = await callTool('get_chat_flow', { flowId: id });
          printRecord(result, parseFormat(opts.format, 'json'));
        }),
    );
}

export function buildFlowsCommand(): Command {
  return new Command('flows')
    .description('Manage email flows + conversation chat flows')
    .addCommand(buildListCommand())
    .addCommand(buildPerformanceCommand())
    .addCommand(buildActivateCommand())
    .addCommand(buildCancelCommand())
    .addCommand(buildCreateDraftCommand())
    .addCommand(buildUpdateDraftCommand())
    .addCommand(buildChatCommand());
}

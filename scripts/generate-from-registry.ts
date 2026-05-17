#!/usr/bin/env node
/**
 * generate-from-registry.ts
 *
 * Walks ../buzzbitx1/server/src/mcp/tools/**\/*.ts, extracts each tool's
 * { name, description, scope, inputSchema, cli? } via a small regex+AST
 * pass, and emits one Commander.js command file per group at
 * src/commands/generated/<group>.ts.
 *
 * Re-run any time the MCP registry changes:
 *
 *   npm run generate:cli
 *
 * Manual wrappers under src/commands/ that exist for tools tagged
 * `cli: { skip: true }` are left alone. Manual wrappers that overlap
 * with generated commands take precedence at root program registration
 * (see src/commands/generated/index.ts header).
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, basename, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const MCP_TOOLS_DIR = join(REPO_ROOT, '..', 'buzzbitx1', 'server', 'src', 'mcp', 'tools');
const OUT_DIR = join(REPO_ROOT, 'src', 'commands', 'generated');
const ENUMS_OUT_FILE = join(REPO_ROOT, 'src', 'lib', 'generated-enums.ts');

// Enums resolved from `z.enum(IDENTIFIER)` references during this run.
// Emitted to ENUMS_OUT_FILE so manual wrappers can import the canonical
// list instead of hardcoding their own (which drifts).
const RESOLVED_ENUMS = new Map<string, string[]>();

// ----- types ----------------------------------------------------------------

interface ZodField {
  name: string;
  zodChain: string;
  description?: string;
  optional: boolean;
  kind: 'string' | 'number' | 'boolean' | 'string-array' | 'enum' | 'unknown' | 'object' | 'date';
  enumValues?: string[];
}

interface McpTool {
  filePath: string;
  name: string;
  description: string;
  scope: 'READ' | 'WRITE' | 'EXECUTE' | 'ADMIN';
  category: string;
  quotaCounter?: string;
  minPlan?: string;
  cli: { skip: boolean; group?: string; verb?: string };
  inputSchema: ZodField[];
}

// ----- discovery ------------------------------------------------------------

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith('.ts') && entry !== 'index.ts') {
      out.push(full);
    }
  }
  return out;
}

// ----- parsing --------------------------------------------------------------
// Each tool file follows a canonical shape (see Phase 0 discovery in the
// audit). We extract only the bits we need for CLI generation.

function pluck(source: string, re: RegExp): string | undefined {
  const m = source.match(re);
  return m ? m[1] : undefined;
}

function parseToolFile(filePath: string): McpTool | null {
  const src = readFileSync(filePath, 'utf8');

  const name = pluck(src, /name:\s*['"]([a-z_]+)['"]/);
  if (!name) return null;

  // Description may span multiple lines via + concatenation. Grab the first
  // string literal that follows `description:` and concatenate any followers.
  const descMatch = src.match(/description:\s*\n?\s*((?:['"`][^'"`]*['"`](?:\s*\+\s*)?\s*)+)/);
  let description = '';
  if (descMatch) {
    const stringPieces = descMatch[1].match(/['"`]([^'"`]*)['"`]/g) ?? [];
    description = stringPieces
      .map((s) => s.slice(1, -1))
      .join('')
      .trim();
  }

  const scopeRaw = pluck(src, /scope:\s*ApiKeyScope\.(READ|WRITE|EXECUTE|ADMIN)/);
  if (!scopeRaw) return null;
  const scope = scopeRaw as McpTool['scope'];

  const quotaCounter = pluck(src, /quotaCounter:\s*['"]([a-zA-Z_]+)['"]/);
  const category = pluck(src, /category:\s*['"]([a-zA-Z_-]+)['"]/) ?? deriveCategoryFromPath(filePath);
  const minPlan = pluck(src, /minPlan:\s*['"]([A-Z]+)['"]/);
  const cliSkip = /cli:\s*\{\s*[^}]*skip:\s*true/.test(src);
  const cliGroup = pluck(src, /cli:\s*\{[^}]*group:\s*['"]([a-zA-Z_-]+)['"]/);
  const cliVerb = pluck(src, /cli:\s*\{[^}]*verb:\s*['"]([a-zA-Z_-]+)['"]/);

  const inputSchema = parseInputSchema(src, filePath);

  return {
    filePath,
    name,
    description,
    scope,
    category,
    quotaCounter,
    minPlan,
    cli: { skip: cliSkip, group: cliGroup, verb: cliVerb },
    inputSchema,
  };
}

/**
 * Resolve `z.enum(IDENTIFIER)` references like `z.enum(FLOW_TRIGGER_VALUES)`.
 *
 * Walks the source file's imports to find where IDENTIFIER comes from,
 * then reads that file looking for `export const IDENTIFIER = [ ... ] as const`.
 * Returns the resolved string values, or null if anything fails.
 *
 * Caches results in RESOLVED_ENUMS so we can dump them to a shared constants
 * file for manual wrappers to import.
 */
function resolveEnumIdentifier(identifier: string, sourceFilePath: string): string[] | null {
  const cached = RESOLVED_ENUMS.get(identifier);
  if (cached) return cached;
  const src = readFileSync(sourceFilePath, 'utf8');
  // Find: import { ..., IDENTIFIER, ... } from '<path>';
  // Accept multi-line import blocks.
  const importRe = new RegExp(
    `import\\s*\\{[^}]*\\b${identifier}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    'm',
  );
  const m = src.match(importRe);
  if (!m) return null;
  let importPath = m[1];
  // Node ESM convention: imports use .js extension even when the source is .ts.
  if (importPath.endsWith('.js')) importPath = importPath.slice(0, -3) + '.ts';
  else if (!importPath.endsWith('.ts')) importPath = importPath + '.ts';
  const absolute = resolvePath(dirname(sourceFilePath), importPath);
  if (!existsSync(absolute)) return null;
  const targetSrc = readFileSync(absolute, 'utf8');
  // Find: export const IDENTIFIER = [ ... ] as const;   (multi-line, with comments)
  const constRe = new RegExp(
    `export\\s+const\\s+${identifier}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as\\s*const`,
    'm',
  );
  const cm = targetSrc.match(constRe);
  if (!cm) return null;
  // Strip line + block comments before extracting string literals
  const cleaned = cm[1]
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const stringPieces = cleaned.match(/['"`]([^'"`]+)['"`]/g) ?? [];
  const values = stringPieces
    .map((s) => s.slice(1, -1))
    .filter((s) => /^[\w.:-]+$/.test(s)); // skip anything weird
  if (values.length === 0) return null;
  RESOLVED_ENUMS.set(identifier, values);
  return values;
}

function deriveCategoryFromPath(filePath: string): string {
  // .../server/src/mcp/tools/<category>/file.ts
  const parts = filePath.split(/[/\\]/);
  const idx = parts.findIndex((p) => p === 'tools');
  return idx >= 0 && idx + 1 < parts.length ? parts[idx + 1] : 'misc';
}

// Parse a `const inputSchema = { ... };` block. We only handle the subset
// our actual tools use — anything weirder we mark `unknown` and emit a
// generic --<field> <value> flag, leaving the merchant to JSON-stringify.
function parseInputSchema(src: string, sourceFilePath: string): ZodField[] {
  // Explicit empty-schema short-circuit. Without this the greedy `[\s\S]*?\n\};`
  // fallback below matches up to the tool definition's closing `};`, which
  // makes the tool-def fields (description/scope/category/handler) leak into
  // the generated CLI as fake input flags.
  if (/const inputSchema\s*=\s*\{\s*\}\s*;/.test(src)) return [];

  const block = src.match(/const inputSchema\s*=\s*\{\n([\s\S]*?)\n\};/);
  if (!block) return [];
  const body = block[1];
  // Split top-level entries — naive but sufficient for our well-formed files.
  const entries: ZodField[] = [];
  const lines = body.split('\n');
  let buffer = '';
  let depth = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    buffer += ' ' + line;
    for (const ch of line) {
      if (ch === '(' || ch === '{' || ch === '[') depth += 1;
      else if (ch === ')' || ch === '}' || ch === ']') depth -= 1;
    }
    if (depth === 0 && buffer.trim().endsWith(',')) {
      const field = parseFieldEntry(buffer.trim().replace(/,$/, ''), sourceFilePath);
      if (field) entries.push(field);
      buffer = '';
    }
  }
  if (buffer.trim()) {
    const field = parseFieldEntry(buffer.trim(), sourceFilePath);
    if (field) entries.push(field);
  }
  return entries;
}

function parseFieldEntry(text: string, sourceFilePath: string): ZodField | null {
  const m = text.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([\s\S]+)$/);
  if (!m) return null;
  const name = m[1];
  const chain = m[2];
  const description = pluck(chain, /\.describe\(\s*['"`]([^'"`]+)['"`]/);
  const optional = /\.optional\(\)/.test(chain);
  let kind: ZodField['kind'] = 'unknown';
  let enumValues: string[] | undefined;

  if (/z\.string\(\)/.test(chain)) kind = 'string';
  else if (/z\.number\(\)/.test(chain)) kind = 'number';
  else if (/z\.boolean\(\)/.test(chain)) kind = 'boolean';
  else if (/z\.array\(z\.string\(\)/.test(chain)) kind = 'string-array';
  else if (/z\.enum\(/.test(chain)) {
    kind = 'enum';
    const inlineMatch = chain.match(/z\.enum\(\[([^\]]+)\]/);
    if (inlineMatch) {
      enumValues = inlineMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/^['"`]|['"`]$/g, ''))
        .filter(Boolean);
    } else {
      // z.enum(IDENTIFIER) — resolve through the source file's imports.
      const refMatch = chain.match(/z\.enum\(([A-Za-z_][A-Za-z0-9_]*)\)/);
      if (refMatch) {
        const resolved = resolveEnumIdentifier(refMatch[1], sourceFilePath);
        if (resolved && resolved.length > 0) enumValues = resolved;
      }
    }
  } else if (/z\.nativeEnum\(/.test(chain)) {
    kind = 'enum';
  } else if (/z\.record\(/.test(chain)) {
    kind = 'object';
  } else if (/z\.unknown\(\)/.test(chain)) {
    kind = 'unknown';
  } else if (/z\.string\(\)\.datetime\(\)/.test(chain) || /\.datetime\(\)/.test(chain)) {
    kind = 'date';
  } else if (/z\.string\(\)/.test(chain)) {
    kind = 'string';
  }

  return { name, zodChain: chain, description, optional, kind, enumValues };
}

// ----- naming ---------------------------------------------------------------

const VERB_PREFIXES = ['list_', 'get_', 'create_', 'update_', 'delete_', 'send_', 'publish_', 'activate_', 'cancel_', 'invite_', 'remove_', 'bulk_', 'search_', 'tag_', 'upload_', 'validate_'];

function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/_/g, '-');
}

function deriveGroupAndVerb(tool: McpTool): { group: string; verb: string } {
  if (tool.cli.group && tool.cli.verb) {
    return { group: tool.cli.group, verb: tool.cli.verb };
  }
  // Prefer category for group.
  let group = tool.cli.group ?? tool.category;
  // Fallback to first underscore segment of tool name.
  if (!group) {
    const head = tool.name.split('_')[0];
    group = head;
  }
  // Derive verb from tool name: strip the leading verb prefix if it matches the
  // overall action, then turn the rest into kebab. e.g. list_team_members →
  // list-members (because group is 'team'), get_subscription_status →
  // subscription-status (because group is 'billing').
  if (tool.cli.verb) return { group, verb: tool.cli.verb };

  const verbPrefix = VERB_PREFIXES.find((p) => tool.name.startsWith(p));
  const stripped = tool.name.replace(/_/g, ' ').trim();
  let rest = stripped;
  if (verbPrefix) {
    const remainder = tool.name.slice(verbPrefix.length);
    // If the remainder starts with the group name, drop it ("list_team_members" → "members" when group=team).
    const groupSnake = group.replace(/-/g, '_');
    if (remainder.startsWith(`${groupSnake}_`)) {
      rest = verbPrefix.slice(0, -1) + '_' + remainder.slice(groupSnake.length + 1);
    } else if (remainder === groupSnake) {
      rest = verbPrefix.slice(0, -1);
    } else {
      rest = tool.name;
    }
  }
  return { group: camelToKebab(group), verb: camelToKebab(rest) };
}

// ----- emit -----------------------------------------------------------------

function flagForField(f: ZodField): { decl: string; argExpr: string } {
  const flag = f.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const desc = f.description ?? '';
  const required = !f.optional;
  switch (f.kind) {
    case 'boolean':
      return {
        decl: `.option('--${flag}', ${JSON.stringify(desc)})`,
        argExpr: `opts['${f.name}']`,
      };
    case 'number':
      return {
        decl: `.option('--${flag} <number>', ${JSON.stringify(desc)}, (v) => Number(v))`,
        argExpr: `opts['${f.name}']`,
      };
    case 'string-array':
      return {
        decl: `.option('--${flag} <comma-separated>', ${JSON.stringify(desc + ' (comma-separated)')}, (v) => v.split(',').map((s) => s.trim()).filter(Boolean))`,
        argExpr: `opts['${f.name}']`,
      };
    case 'enum': {
      const choices = f.enumValues ? ` (one of: ${f.enumValues.join(', ')})` : '';
      return {
        decl: `.option('--${flag} <value>', ${JSON.stringify(desc + choices)})`,
        argExpr: `opts['${f.name}']`,
      };
    }
    case 'object':
    case 'unknown':
      return {
        decl: `.option('--${flag} <json>', ${JSON.stringify((desc || 'JSON value') + ' (JSON string, parsed before send)')}, (v) => JSON.parse(v))`,
        argExpr: `opts['${f.name}']`,
      };
    case 'date':
    case 'string':
    default:
      return {
        decl: `.option('--${flag} <value>', ${JSON.stringify(desc)})${required ? '' : ''}`,
        argExpr: `opts['${f.name}']`,
      };
  }
}

function emitToolCommand(tool: McpTool): string {
  const { verb } = deriveGroupAndVerb(tool);
  const lines: string[] = [];
  lines.push(`  group.command('${verb}')`);
  lines.push(`    .description(${JSON.stringify(tool.description || tool.name)})`);
  const argParts: string[] = [];
  for (const field of tool.inputSchema) {
    const { decl } = flagForField(field);
    lines.push(`    ${decl}`);
    argParts.push(`'${field.name}': opts['${field.name}']`);
  }
  lines.push(`    .option('--format <fmt>', 'table | json | csv', 'json')`);
  lines.push(`    .action(async (opts) => {`);
  lines.push(`      const args: Record<string, unknown> = {};`);
  for (const field of tool.inputSchema) {
    lines.push(`      if (opts['${field.name}'] !== undefined) args['${field.name}'] = opts['${field.name}'];`);
  }
  lines.push(`      const result = await callTool('${tool.name}', args);`);
  lines.push(`      printResult(result, { format: parseFormat(opts.format, 'json') });`);
  lines.push(`    });`);
  return lines.join('\n');
}

function emitGroupFile(group: string, tools: McpTool[]): string {
  const header = `// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run \`npm run generate:cli\` to regenerate.
// Source snapshot timestamp: ${new Date().toISOString()}

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('${group}')
    .description('Auto-generated ${group} commands. ${tools.length} subcommand${tools.length === 1 ? '' : 's'}.');
`;
  const body = tools.map(emitToolCommand).join('\n\n');
  const footer = `

  return group;
}
`;
  return header + '\n' + body + footer;
}

function emitGeneratedIndex(groups: string[]): string {
  const importLines = groups
    .map((g) => `import { buildGeneratedCommand as buildGenerated_${g.replace(/-/g, '_')} } from './${g}.js';`)
    .join('\n');
  const addLines = groups
    .map((g) => `  mcp.addCommand(buildGenerated_${g.replace(/-/g, '_')}());`)
    .join('\n');
  return `// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run \`npm run generate:cli\` to regenerate.
// Source snapshot timestamp: ${new Date().toISOString()}
//
// The auto-generated commands live under a single \`bbx mcp\` namespace so
// they don't collide with the hand-tuned commands at the top level. Use
// the manual wrappers (e.g. \`bbx customers list\`) for everyday work and
// the generated ones (\`bbx mcp customers list-customers\`) for direct
// MCP-tool calls or when a hand-tuned wrapper doesn't exist yet.

import { Command } from 'commander';
${importLines}

export function buildMcpCommand(): Command {
  const mcp = new Command('mcp')
    .description('Direct MCP-tool invocation. Auto-generated from the live MCP registry — every server-side tool is reachable here.');
${addLines}
  return mcp;
}
`;
}

// ----- main -----------------------------------------------------------------

function main(): void {
  if (!existsSync(MCP_TOOLS_DIR)) {
    throw new Error(`MCP tools dir not found at ${MCP_TOOLS_DIR}. Clone buzzbitx1 next to buzzbit-cli, or set MCP_TOOLS_DIR.`);
  }

  const files = walk(MCP_TOOLS_DIR);
  const tools: McpTool[] = [];
  let skipped = 0;
  for (const file of files) {
    const parsed = parseToolFile(file);
    if (!parsed) continue;
    if (parsed.cli.skip) {
      skipped += 1;
      continue;
    }
    tools.push(parsed);
  }

  // Group tools.
  const byGroup = new Map<string, McpTool[]>();
  for (const tool of tools) {
    const { group } = deriveGroupAndVerb(tool);
    const existing = byGroup.get(group) ?? [];
    existing.push(tool);
    byGroup.set(group, existing);
  }

  // Reset output dir.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const groupNames: string[] = [];
  for (const [group, groupTools] of byGroup) {
    groupNames.push(group);
    const outFile = join(OUT_DIR, `${group}.ts`);
    writeFileSync(outFile, emitGroupFile(group, groupTools), 'utf8');
  }
  groupNames.sort();
  writeFileSync(join(OUT_DIR, 'index.ts'), emitGeneratedIndex(groupNames), 'utf8');

  // Emit shared enums file for manual wrappers to import. Lets `src/commands/*.ts`
  // reference the canonical values resolved during this run instead of hardcoding
  // a list that drifts every time the server side adds/removes a trigger.
  if (RESOLVED_ENUMS.size > 0) {
    mkdirSync(dirname(ENUMS_OUT_FILE), { recursive: true });
    const enumLines: string[] = [
      '// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.',
      '// Run `npm run generate:cli` to regenerate.',
      `// Source snapshot timestamp: ${new Date().toISOString()}`,
      '//',
      '// Each export is the array of values from a `z.enum(IDENTIFIER)` reference',
      '// resolved by walking imports back to the server source file. Use these in',
      '// hand-tuned commands under src/commands/ to keep --help text in sync with',
      '// what the server actually accepts.',
      '',
    ];
    const sortedKeys = Array.from(RESOLVED_ENUMS.keys()).sort();
    for (const key of sortedKeys) {
      const values = RESOLVED_ENUMS.get(key)!;
      enumLines.push(`export const ${key} = ${JSON.stringify(values, null, 2)} as const;`);
      enumLines.push(`export type ${key.replace(/_VALUES$/, '')}Value = (typeof ${key})[number];`);
      enumLines.push('');
    }
    writeFileSync(ENUMS_OUT_FILE, enumLines.join('\n'), 'utf8');
  }

  process.stdout.write(
    `Generated ${tools.length} commands across ${groupNames.length} groups ` +
      `(${skipped} skipped via cli.skip). Files at ${relative(REPO_ROOT, OUT_DIR)}.\n`,
  );
  process.stdout.write('Groups: ' + groupNames.join(', ') + '\n');
  if (RESOLVED_ENUMS.size > 0) {
    process.stdout.write(
      `Resolved ${RESOLVED_ENUMS.size} z.enum(IDENTIFIER) reference(s): ` +
        Array.from(RESOLVED_ENUMS.keys()).sort().join(', ') +
        `\n  → emitted to ${relative(REPO_ROOT, ENUMS_OUT_FILE)}\n`,
    );
  }
  // Suppress unused-import warnings during dev.
  void basename;
}

main();

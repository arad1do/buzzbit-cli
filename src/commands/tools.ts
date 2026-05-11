/**
 * `bbx tools` — discover what your connected workspace exposes.
 *
 *   list           — every tool the MCP server registers, with descriptions
 *   describe <n>   — pretty-print one tool's inputSchema
 */

import { Command } from 'commander';
import { listAllTools } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildListCommand(): Command {
  return new Command('list')
    .description('List MCP tools registered for the active workspace')
    .option('--format <format>', 'table | json | csv', 'table')
    .option('-s, --search <text>', 'Filter by name substring')
    .action(async (opts: { format?: string; search?: string }) => {
      const tools = await listAllTools();
      const search = opts.search?.toLowerCase();
      const filtered = search
        ? tools.filter((t) => t.name.toLowerCase().includes(search) || t.description.toLowerCase().includes(search))
        : tools;
      const rows = filtered.map((t) => ({ name: t.name, description: t.description }));
      printResult({ tools: rows }, { format: parseFormat(opts.format), columns: ['name', 'description'] });
    });
}

function buildDescribeCommand(): Command {
  return new Command('describe')
    .description('Print one tool\'s input schema')
    .argument('<name>', 'Canonical tool name')
    .option('--format <format>', 'table | json', 'json')
    .action(async (name: string, opts: { format?: string }) => {
      if (!name) throw new ValidationError('Tool name required');
      const tools = await listAllTools();
      const match = tools.find((t) => t.name === name);
      if (!match) throw new ValidationError(`Tool "${name}" not found in this workspace`);
      printRecord(match, parseFormat(opts.format, 'json'));
    });
}

export function buildToolsCommand(): Command {
  return new Command('tools')
    .description('Discover MCP tools for the active workspace')
    .addCommand(buildListCommand())
    .addCommand(buildDescribeCommand());
}

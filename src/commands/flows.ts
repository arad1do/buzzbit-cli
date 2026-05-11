/**
 * `bbx flows` — list, performance, activate, cancel.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

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

export function buildFlowsCommand(): Command {
  return new Command('flows')
    .description('Manage email flows')
    .addCommand(buildListCommand())
    .addCommand(buildPerformanceCommand())
    .addCommand(buildActivateCommand())
    .addCommand(buildCancelCommand());
}

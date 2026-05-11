/**
 * `bbx campaigns` — list, metrics, send.
 *
 * `send` enqueues into the McpUndoQueue with a 30s undo window per the
 * server-side behavior. Use `bbx flows cancel <actionId>` within the
 * window to abort.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const CAMPAIGN_TABLE_COLS = ['id', 'name', 'status', 'recipientCount', 'sentAt', 'createdAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List email campaigns')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('-s, --status <status>', 'Filter by status (draft, scheduled, sent)')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; status?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_campaigns', args);
      printResult(result, { format: parseFormat(opts.format), columns: CAMPAIGN_TABLE_COLS });
    });
}

function buildMetricsCommand(): Command {
  return new Command('metrics')
    .description('Get open/click/revenue metrics for a campaign')
    .argument('<id>', 'Campaign id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Campaign id required');
      const result = await callTool('get_campaign_metrics', { campaignId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildSendCommand(): Command {
  return new Command('send')
    .description('Send a draft campaign (30s undo window after submission)')
    .argument('<id>', 'Campaign id (must be DRAFT)')
    .option('--confirm', 'Skip the interactive prompt (required for non-TTY)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { confirm?: boolean; format?: string }) => {
      if (!id) throw new ValidationError('Campaign id required');
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(
          `About to send campaign ${id}. Re-run with --confirm to proceed:\n` +
            `  bbx campaigns send ${id} --confirm\n`,
        );
        return;
      }
      const result = await callTool('send_campaign', { campaignId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildCampaignsCommand(): Command {
  return new Command('campaigns')
    .description('Manage and send email campaigns')
    .addCommand(buildListCommand())
    .addCommand(buildMetricsCommand())
    .addCommand(buildSendCommand());
}

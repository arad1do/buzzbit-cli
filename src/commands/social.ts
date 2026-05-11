/**
 * `bbx social` — list posts, performance, publish.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const POST_TABLE_COLS = ['id', 'platform', 'status', 'scheduledFor', 'publishedAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List social posts')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('--platform <platform>', 'Filter by platform (facebook, instagram, …)')
    .option('-s, --status <status>', 'Filter by status (draft, scheduled, published)')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; platform?: string; status?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.platform) args.platform = opts.platform;
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_social_posts', args);
      printResult(result, { format: parseFormat(opts.format), columns: POST_TABLE_COLS });
    });
}

function buildPerformanceCommand(): Command {
  return new Command('performance')
    .description('Aggregate engagement metrics across recent social posts')
    .option('--period <period>', 'last_7_days | last_30_days | last_90_days', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { period?: string; format?: string }) => {
      const result = await callTool('get_social_performance', {
        period: opts.period ?? 'last_30_days',
      });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildPublishCommand(): Command {
  return new Command('publish')
    .description('Publish a draft social post (30s undo window)')
    .argument('<id>', 'Social post id (must be DRAFT or SCHEDULED)')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { confirm?: boolean; format?: string }) => {
      if (!id) throw new ValidationError('Post id required');
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(
          `About to publish social post ${id}. Re-run with --confirm:\n` +
            `  bbx social publish ${id} --confirm\n`,
        );
        return;
      }
      const result = await callTool('publish_social_post', { postId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildSocialCommand(): Command {
  return new Command('social')
    .description('Manage and publish social posts')
    .addCommand(buildListCommand())
    .addCommand(buildPerformanceCommand())
    .addCommand(buildPublishCommand());
}

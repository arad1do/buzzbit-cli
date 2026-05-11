/**
 * `bbx social` — list posts, performance, publish.
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
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

function buildCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a single social post draft')
    .requiredOption('--platform <platform>', 'facebook | instagram | linkedin | tiktok | pinterest')
    .requiredOption('--caption <text>', 'Post caption / body')
    .option('--media <id>', 'Media id (from `bbx media upload`)')
    .option('--scheduled-for <iso>', 'ISO 8601 schedule time (omit to leave as DRAFT)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { platform: string; caption: string; media?: string; scheduledFor?: string; format?: string }) => {
      const args: Record<string, unknown> = { platform: opts.platform, caption: opts.caption };
      if (opts.media) args.mediaId = opts.media;
      if (opts.scheduledFor) args.scheduledFor = opts.scheduledFor;
      const result = await callTool('create_social_post_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateDraftCommand(): Command {
  return new Command('update-draft')
    .description('Update an existing social post draft')
    .argument('<id>', 'Social post id')
    .option('--caption <text>')
    .option('--scheduled-for <iso>')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { caption?: string; scheduledFor?: string; format?: string }) => {
      if (!id) throw new ValidationError('Post id required');
      const args: Record<string, unknown> = { postId: id };
      if (opts.caption) args.caption = opts.caption;
      if (opts.scheduledFor) args.scheduledFor = opts.scheduledFor;
      const result = await callTool('update_social_post_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildBulkCreateCommand(): Command {
  return new Command('bulk-create')
    .description('Create multiple social posts from a JSON file (array of post objects, max 50)')
    .requiredOption('--file <path>', 'JSON array of { platform, caption, mediaId?, scheduledFor? }')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { file: string; format?: string }) => {
      let raw: string;
      try {
        raw = readFileSync(opts.file, 'utf8');
      } catch (err) {
        throw new ValidationError(`Cannot read --file: ${err instanceof Error ? err.message : String(err)}`);
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        throw new ValidationError(`--file must be valid JSON: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (!Array.isArray(parsed)) throw new ValidationError('--file must contain a JSON array');
      if (parsed.length === 0) throw new ValidationError('Array is empty');
      if (parsed.length > 50) throw new ValidationError('Max 50 posts per bulk operation');
      const result = await callTool('bulk_create_social_posts', { posts: parsed });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildAutomationCommand(): Command {
  return new Command('automation')
    .description('Instagram automation rules (auto-DM on comment / story reply / follow)')
    .addCommand(
      new Command('list')
        .description('List IG automation rules')
        .option('--trigger <type>', 'COMMENT | STORY_REPLY | FOLLOW')
        .option('-l, --limit <n>', 'Max rows', '20')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { trigger?: string; limit?: string; format?: string }) => {
          const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
          const args: Record<string, unknown> = { limit };
          if (opts.trigger) args.triggerType = opts.trigger;
          const result = await callTool('list_instagram_automation_rules', args);
          printResult(result, { format: parseFormat(opts.format) });
        }),
    );
}

export function buildSocialCommand(): Command {
  return new Command('social')
    .description('Manage social posts + Instagram automation rules')
    .addCommand(buildListCommand())
    .addCommand(buildPerformanceCommand())
    .addCommand(buildPublishCommand())
    .addCommand(buildCreateDraftCommand())
    .addCommand(buildUpdateDraftCommand())
    .addCommand(buildBulkCreateCommand())
    .addCommand(buildAutomationCommand());
}

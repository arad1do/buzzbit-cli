// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.980Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('social')
    .description('Auto-generated social commands. 7 subcommands.');

  group.command('bulk-create-social-posts')
    .description("Create up to ${HARD_CAP} scheduled social posts in one call.")
    .option('--posts <json>', "Up to ${HARD_CAP} scheduled posts. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['posts'] !== undefined) args['posts'] = opts['posts'];
      const result = await callTool('bulk_create_social_posts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-post-draft')
    .description("Create a single scheduled social post (DRAFT status). Will publish at scheduledAt via the social worker.")
    .option('--content <value>', "")
    .option('--media-urls <value>', "")
    .option('--platforms <value>', "Target platforms. At least one required. (one of: FACEBOOK, INSTAGRAM, LINKEDIN, TIKTOK, PINTEREST)")
    .option('--account-ids <value>', "SocialAccount UUIDs to post from. At least one required.")
    .option('--scheduled-at <value>', "When to publish (ISO datetime).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['mediaUrls'] !== undefined) args['mediaUrls'] = opts['mediaUrls'];
      if (opts['platforms'] !== undefined) args['platforms'] = opts['platforms'];
      if (opts['accountIds'] !== undefined) args['accountIds'] = opts['accountIds'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('create_social_post_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-performance')
    .description("Get a social post\\")
    .option('--post-id <value>', "Social post UUID.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['postId'] !== undefined) args['postId'] = opts['postId'];
      const result = await callTool('get_social_performance', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-instagram-automation-rules')
    .description("List Instagram automation rules — auto-DM responses to comments / story replies / follows, with keyword targeting and per-post scoping.")
    .option('--trigger-type <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['triggerType'] !== undefined) args['triggerType'] = opts['triggerType'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_instagram_automation_rules', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-posts')
    .description("List social posts in the current workspace, optionally filtered by scheduledAt window.")
    .option('--start-date <value>', "ISO datetime — only posts scheduled on/after this time.")
    .option('--end-date <value>', "ISO datetime — only posts scheduled on/before this time.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['startDate'] !== undefined) args['startDate'] = opts['startDate'];
      if (opts['endDate'] !== undefined) args['endDate'] = opts['endDate'];
      const result = await callTool('list_social_posts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('publish-post')
    .description("Publish a draft social post immediately (after 30s undo window). Call cancel_pending_action to abort within the window.")
    .option('--post-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['postId'] !== undefined) args['postId'] = opts['postId'];
      const result = await callTool('publish_social_post', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-post-draft')
    .description("Update fields on an existing draft social post. Workspace-scoped.")
    .option('--post-id <value>', "")
    .option('--content <value>', "")
    .option('--media-urls <value>', "")
    .option('--platforms <value>', " (one of: FACEBOOK, INSTAGRAM, LINKEDIN, TIKTOK, PINTEREST)")
    .option('--account-ids <value>', "")
    .option('--scheduled-at <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['postId'] !== undefined) args['postId'] = opts['postId'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['mediaUrls'] !== undefined) args['mediaUrls'] = opts['mediaUrls'];
      if (opts['platforms'] !== undefined) args['platforms'] = opts['platforms'];
      if (opts['accountIds'] !== undefined) args['accountIds'] = opts['accountIds'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('update_social_post_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

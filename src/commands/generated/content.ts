// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-15T11:28:32.556Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('content')
    .description('Auto-generated content commands. 2 subcommands.');

  group.command('create-blog-post-draft')
    .description("Create a new blog post in DRAFT status. Slug must be unique per workspace.")
    .option('--title <value>', "")
    .option('--slug <value>', "URL slug (kebab-case). Must be unique per workspace.")
    .option('--content <value>', "")
    .option('--excerpt <value>', "")
    .option('--seo-title <value>', "")
    .option('--seo-description <value>', "")
    .option('--keywords <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['title'] !== undefined) args['title'] = opts['title'];
      if (opts['slug'] !== undefined) args['slug'] = opts['slug'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['excerpt'] !== undefined) args['excerpt'] = opts['excerpt'];
      if (opts['seoTitle'] !== undefined) args['seoTitle'] = opts['seoTitle'];
      if (opts['seoDescription'] !== undefined) args['seoDescription'] = opts['seoDescription'];
      if (opts['keywords'] !== undefined) args['keywords'] = opts['keywords'];
      const result = await callTool('create_blog_post_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-blog-posts')
    .description("List blog posts (draft / published / archived).")
    .option('--status <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_blog_posts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

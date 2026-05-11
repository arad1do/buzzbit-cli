/**
 * `bbx content` — blog posts + saved reports.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildBlogListCommand(): Command {
  return new Command('list')
    .description('List blog posts')
    .option('-s, --status <status>', 'DRAFT | PUBLISHED | ARCHIVED')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { status?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_blog_posts', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['id', 'title', 'slug', 'status', 'views', 'updatedAt'],
      });
    });
}

function buildBlogCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a blog post draft')
    .requiredOption('--title <title>')
    .requiredOption('--slug <slug>', 'URL slug (kebab-case)')
    .requiredOption('--content <text>', 'Body text (HTML or Markdown)')
    .option('--excerpt <text>')
    .option('--seo-title <text>')
    .option('--seo-description <text>')
    .option('--keywords <list>', 'Comma-separated keywords')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      seoTitle?: string;
      seoDescription?: string;
      keywords?: string;
      format?: string;
    }) => {
      const args: Record<string, unknown> = {
        title: opts.title,
        slug: opts.slug,
        content: opts.content,
      };
      if (opts.excerpt) args.excerpt = opts.excerpt;
      if (opts.seoTitle) args.seoTitle = opts.seoTitle;
      if (opts.seoDescription) args.seoDescription = opts.seoDescription;
      if (opts.keywords) {
        args.keywords = opts.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      }
      const result = await callTool('create_blog_post_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildBlogCommand(): Command {
  return new Command('blog')
    .description('Blog posts')
    .addCommand(buildBlogListCommand())
    .addCommand(buildBlogCreateDraftCommand());
}

function buildReportsCommand(): Command {
  return new Command('reports')
    .description('Saved custom reports')
    .addCommand(
      new Command('list')
        .description('List saved reports')
        .option('-l, --limit <n>', 'Max rows', '20')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { limit?: string; format?: string }) => {
          const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
          const result = await callTool('list_saved_reports', { limit });
          printResult(result, {
            format: parseFormat(opts.format),
            columns: ['id', 'name', 'dataSource', 'lastRunAt', 'updatedAt'],
          });
        }),
    );
}

export function buildContentCommand(): Command {
  return new Command('content')
    .description('Blog posts and saved reports')
    .addCommand(buildBlogCommand())
    .addCommand(buildReportsCommand());
}

void ValidationError;

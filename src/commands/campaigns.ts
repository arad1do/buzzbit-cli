/**
 * `bbx campaigns` — list, metrics, send.
 *
 * `send` enqueues into the McpUndoQueue with a 30s undo window per the
 * server-side behavior. Use `bbx flows cancel <actionId>` within the
 * window to abort.
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
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

function buildCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a new email campaign draft')
    .requiredOption('--name <name>', 'Internal campaign name')
    .requiredOption('--subject <text>', 'Subject line')
    .option('--preview <text>', 'Preview text (preheader)')
    .option('--body <text>', 'Plain body text')
    .option('--html-file <path>', 'Read HTML from file (passes through validate_email_html)')
    .option('--segment <id>', 'Target segment id')
    .option('--from-name <text>', 'From display name')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      name: string;
      subject: string;
      preview?: string;
      body?: string;
      htmlFile?: string;
      segment?: string;
      fromName?: string;
      format?: string;
    }) => {
      const args: Record<string, unknown> = {
        name: opts.name,
        subject: opts.subject,
      };
      if (opts.preview) args.previewText = opts.preview;
      if (opts.body) args.body = opts.body;
      if (opts.segment) args.segmentId = opts.segment;
      if (opts.fromName) args.fromName = opts.fromName;

      let tool = 'create_campaign_draft';
      if (opts.htmlFile) {
        try {
          args.html = readFileSync(opts.htmlFile, 'utf8');
        } catch (err) {
          throw new ValidationError(
            `Cannot read --html-file: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        tool = 'create_campaign_draft_with_html';
      }
      const result = await callTool(tool, args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateDraftCommand(): Command {
  return new Command('update-draft')
    .description('Update an existing campaign draft')
    .argument('<id>', 'Campaign id (must still be DRAFT)')
    .option('--name <name>')
    .option('--subject <text>')
    .option('--preview <text>')
    .option('--body <text>')
    .option('--segment <id>')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: {
      name?: string;
      subject?: string;
      preview?: string;
      body?: string;
      segment?: string;
      format?: string;
    }) => {
      if (!id) throw new ValidationError('Campaign id required');
      const args: Record<string, unknown> = { campaignId: id };
      if (opts.name) args.name = opts.name;
      if (opts.subject) args.subject = opts.subject;
      if (opts.preview) args.previewText = opts.preview;
      if (opts.body) args.body = opts.body;
      if (opts.segment) args.segmentId = opts.segment;
      const result = await callTool('update_campaign_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildValidateHtmlCommand(): Command {
  return new Command('validate-html')
    .description('Run the server\'s HTML sanitizer against a local file (no save)')
    .requiredOption('--file <path>', 'HTML file to validate')
    .option('--format <format>', 'table | json', 'json')
    .action(async (opts: { file: string; format?: string }) => {
      let html: string;
      try {
        html = readFileSync(opts.file, 'utf8');
      } catch (err) {
        throw new ValidationError(
          `Cannot read --file: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      const result = await callTool('validate_email_html', { html });
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

function buildTemplatesCommand(): Command {
  return new Command('templates')
    .description('Manage reusable email templates')
    .addCommand(
      new Command('list')
        .description('List email templates (workspace + global defaults)')
        .option('--category <cat>', 'Filter by category')
        .option('--no-global', 'Exclude built-in defaults')
        .option('-l, --limit <n>', 'Max rows', '20')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { category?: string; global?: boolean; limit?: string; format?: string }) => {
          const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
          const args: Record<string, unknown> = { limit, includeGlobal: opts.global !== false };
          if (opts.category) args.category = opts.category;
          const result = await callTool('list_email_templates', args);
          printResult(result, {
            format: parseFormat(opts.format),
            columns: ['id', 'name', 'category', 'subject', 'isDefault', 'updatedAt'],
          });
        }),
    )
    .addCommand(
      new Command('get')
        .description('Get one template with full HTML body')
        .argument('<id>', 'Template id')
        .option('--format <format>', 'table | json', 'json')
        .action(async (id: string, opts: { format?: string }) => {
          if (!id) throw new ValidationError('Template id required');
          const result = await callTool('get_email_template', { templateId: id });
          printRecord(result, parseFormat(opts.format, 'json'));
        }),
    )
    .addCommand(
      new Command('create')
        .description('Save a new reusable email template')
        .requiredOption('--name <name>')
        .requiredOption('--category <cat>', 'e.g. welcome, abandonment, promo, newsletter')
        .requiredOption('--subject <text>')
        .requiredOption('--html-file <path>', 'Path to HTML body')
        .option('--description <text>')
        .option('--preheader <text>')
        .option('--text-file <path>', 'Optional plain-text fallback')
        .option('--format <format>', 'table | json', 'table')
        .action(async (opts: {
          name: string;
          category: string;
          subject: string;
          htmlFile: string;
          description?: string;
          preheader?: string;
          textFile?: string;
          format?: string;
        }) => {
          let html: string;
          try {
            html = readFileSync(opts.htmlFile, 'utf8');
          } catch (err) {
            throw new ValidationError(`Cannot read --html-file: ${err instanceof Error ? err.message : String(err)}`);
          }
          const args: Record<string, unknown> = {
            name: opts.name,
            category: opts.category,
            subject: opts.subject,
            html,
          };
          if (opts.description) args.description = opts.description;
          if (opts.preheader) args.preheader = opts.preheader;
          if (opts.textFile) {
            try {
              args.text = readFileSync(opts.textFile, 'utf8');
            } catch (err) {
              throw new ValidationError(`Cannot read --text-file: ${err instanceof Error ? err.message : String(err)}`);
            }
          }
          const result = await callTool('create_email_template', args);
          printRecord(result, parseFormat(opts.format));
        }),
    );
}

export function buildCampaignsCommand(): Command {
  return new Command('campaigns')
    .description('Manage and send email campaigns + templates')
    .addCommand(buildListCommand())
    .addCommand(buildMetricsCommand())
    .addCommand(buildSendCommand())
    .addCommand(buildCreateDraftCommand())
    .addCommand(buildUpdateDraftCommand())
    .addCommand(buildValidateHtmlCommand())
    .addCommand(buildTemplatesCommand());
}

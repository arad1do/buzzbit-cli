// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.967Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('campaigns')
    .description('Auto-generated campaigns commands. 11 subcommands.');

  group.command('bulk-create-email-campaigns')
    .description("Create up to ${HARD_CAP} email campaign drafts in one call. Each item accepts \\")
    .option('--campaigns <json>', "Array of campaign drafts (max ${HARD_CAP}). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaigns'] !== undefined) args['campaigns'] = opts['campaigns'];
      const result = await callTool('bulk_create_email_campaigns', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-campaign-draft')
    .description("Create an email/SMS/WhatsApp campaign in DRAFT status with text content.")
    .option('--name <value>', "")
    .option('--type <value>', " (one of: email, sms, whatsapp)")
    .option('--subject <value>', "")
    .option('--content <value>', "Plain-text or markdown body. Use create_campaign_draft_with_html for HTML.")
    .option('--segment-id <value>', "")
    .option('--scheduled-at <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['subject'] !== undefined) args['subject'] = opts['subject'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('create_campaign_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-campaign-draft-with-html')
    .description("Create an email campaign DRAFT from raw HTML. HTML is sanitized + an unsubscribe footer is auto-injected if missing.")
    .option('--name <value>', "")
    .option('--subject <value>', "")
    .option('--html <value>', "")
    .option('--segment-id <value>', "")
    .option('--scheduled-at <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['subject'] !== undefined) args['subject'] = opts['subject'];
      if (opts['html'] !== undefined) args['html'] = opts['html'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('create_campaign_draft_with_html', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-campaign-metrics')
    .description("Get per-campaign metrics: sent, delivered, opened, clicked, converted, revenue, plus computed rates.")
    .option('--campaign-id <value>', "Campaign UUID.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      const result = await callTool('get_campaign_metrics', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List campaigns in the current workspace with metrics (sent/opened/clicked/converted/revenue).")
    .option('--status <value>', "Filter by campaign status (draft, scheduled, sent, etc.).")
    .option('--type <value>', " (one of: email, sms, whatsapp)")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_campaigns', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('send-campaign')
    .description("Send a draft campaign to its configured segment. 30-second undo window — call cancel_pending_action with the returned actionId to abort.")
    .option('--campaign-id <value>', "")
    .option('--test-mode', "If true, send to testEmails only (not the full segment).")
    .option('--test-emails <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      if (opts['testMode'] !== undefined) args['testMode'] = opts['testMode'];
      if (opts['testEmails'] !== undefined) args['testEmails'] = opts['testEmails'];
      const result = await callTool('send_campaign', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-campaign-draft')
    .description("Update a draft campaign\\")
    .option('--campaign-id <value>', "")
    .option('--name <value>', "")
    .option('--subject <value>', "")
    .option('--content <value>', "Plain-text body. Mutually exclusive with ")
    .option('--html <value>', "Raw HTML body. Auto-sanitized; mutually exclusive with ")
    .option('--segment-id <value>', "")
    .option('--scheduled-at <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['subject'] !== undefined) args['subject'] = opts['subject'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['html'] !== undefined) args['html'] = opts['html'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('update_campaign_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('validate-email-html')
    .description("Sanitize email HTML against the BuzzBit X whitelist. Returns sanitized HTML, warnings, detected variables, and image URLs.")
    .option('--html <value>', "Raw HTML to sanitize and validate. 500KB max.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['html'] !== undefined) args['html'] = opts['html'];
      const result = await callTool('validate_email_html', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-email-template')
    .description("Save a reusable email template for this workspace. HTML is sanitized against the same whitelist used by campaign drafts. Returns the new template id.")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--category <value>', "e.g. ")
    .option('--subject <value>', "")
    .option('--preheader <value>', "")
    .option('--html <value>', "")
    .option('--text <value>', "Optional plain-text fallback.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['subject'] !== undefined) args['subject'] = opts['subject'];
      if (opts['preheader'] !== undefined) args['preheader'] = opts['preheader'];
      if (opts['html'] !== undefined) args['html'] = opts['html'];
      if (opts['text'] !== undefined) args['text'] = opts['text'];
      const result = await callTool('create_email_template', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-email-template')
    .description("Fetch a single email template including its full HTML body, text fallback, subject, preheader, and variable definitions. Use this to clone-and-adapt into a new campaign via create_campaign_draft_with_html.")
    .option('--template-id <value>', "Template id from list_email_templates.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['templateId'] !== undefined) args['templateId'] = opts['templateId'];
      const result = await callTool('get_email_template', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-email-templates')
    .description("List reusable email templates available to this workspace. Includes workspace-specific templates and (optionally) the built-in default templates that ship with BuzzBit X.")
    .option('--limit <number>', "Max templates to return. Default 20, hard cap 100.", (v) => Number(v))
    .option('--category <value>', "Filter by category (e.g. ")
    .option('--include-global', "Include built-in default templates (default true).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['includeGlobal'] !== undefined) args['includeGlobal'] = opts['includeGlobal'];
      const result = await callTool('list_email_templates', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

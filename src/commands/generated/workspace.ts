// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.762Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('workspace')
    .description('Auto-generated workspace commands. 4 subcommands.');

  group.command('get-agent-settings')
    .description("Get the workspace\\")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_agent_settings', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-brand')
    .description("Get the workspace brand settings: colors, fonts, voice, logo, dark mode preference.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_workspace_brand', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-limits')
    .description("Get the workspace subscription tier and current MCP quota usage (API calls, drafts, campaigns sent, social posts published, DMs sent) with monthly limits and the period end date.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_workspace_limits', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-brand')
    .description("Update brand settings (colors, voice, fonts, logo, sender identity, email footer) for the active workspace. Only provided fields change. Returns the updated brand record.")
    .option('--primary-color <value>', "Hex color string (e.g. #7C3AED).")
    .option('--secondary-color <value>', "")
    .option('--accent-color <value>', "")
    .option('--font-family <value>', "")
    .option('--brand-voice <value>', "CASUAL | PROFESSIONAL | LUXURY | URGENT | FRIENDLY | FUNNY")
    .option('--logo-url <value>', "")
    .option('--favicon-url <value>', "")
    .option('--website-url <value>', "")
    .option('--company-name <value>', "")
    .option('--company-address <value>', "")
    .option('--sender-name <value>', "")
    .option('--reply-to-email <value>', "")
    .option('--footer-html <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['primaryColor'] !== undefined) args['primaryColor'] = opts['primaryColor'];
      if (opts['secondaryColor'] !== undefined) args['secondaryColor'] = opts['secondaryColor'];
      if (opts['accentColor'] !== undefined) args['accentColor'] = opts['accentColor'];
      if (opts['fontFamily'] !== undefined) args['fontFamily'] = opts['fontFamily'];
      if (opts['brandVoice'] !== undefined) args['brandVoice'] = opts['brandVoice'];
      if (opts['logoUrl'] !== undefined) args['logoUrl'] = opts['logoUrl'];
      if (opts['faviconUrl'] !== undefined) args['faviconUrl'] = opts['faviconUrl'];
      if (opts['websiteUrl'] !== undefined) args['websiteUrl'] = opts['websiteUrl'];
      if (opts['companyName'] !== undefined) args['companyName'] = opts['companyName'];
      if (opts['companyAddress'] !== undefined) args['companyAddress'] = opts['companyAddress'];
      if (opts['senderName'] !== undefined) args['senderName'] = opts['senderName'];
      if (opts['replyToEmail'] !== undefined) args['replyToEmail'] = opts['replyToEmail'];
      if (opts['footerHtml'] !== undefined) args['footerHtml'] = opts['footerHtml'];
      const result = await callTool('update_workspace_brand', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

/**
 * `bbx workspace` — workspace-level read tools.
 *
 *   brand   — get_workspace_brand
 *   limits  — get_workspace_limits (mirrored from `bbx metrics limits`)
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';

function buildBrandCommand(): Command {
  return new Command('brand')
    .description('Get brand settings (colors, voice, tone) for the active workspace')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_workspace_brand');
      printRecord(result, parseFormat(opts.format));
    });
}

function buildLimitsCommand(): Command {
  return new Command('limits')
    .description('Subscription tier + current quota usage')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_workspace_limits');
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateBrandCommand(): Command {
  return new Command('update-brand')
    .description('Update brand settings (colors, voice, footer, sender identity)')
    .option('--primary-color <hex>', '#RRGGBB')
    .option('--secondary-color <hex>', '#RRGGBB')
    .option('--accent-color <hex>', '#RRGGBB')
    .option('--font <family>')
    .option('--voice <voice>', 'CASUAL | PROFESSIONAL | LUXURY | URGENT | FRIENDLY | FUNNY')
    .option('--logo <url>')
    .option('--website <url>')
    .option('--company-name <name>')
    .option('--company-address <text>')
    .option('--sender-name <name>')
    .option('--reply-to <email>')
    .option('--footer-html-file <path>', 'Read footer HTML from file')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: Record<string, string | undefined>) => {
      const args: Record<string, unknown> = {};
      if (opts.primaryColor) args.primaryColor = opts.primaryColor;
      if (opts.secondaryColor) args.secondaryColor = opts.secondaryColor;
      if (opts.accentColor) args.accentColor = opts.accentColor;
      if (opts.font) args.fontFamily = opts.font;
      if (opts.voice) args.brandVoice = opts.voice;
      if (opts.logo) args.logoUrl = opts.logo;
      if (opts.website) args.websiteUrl = opts.website;
      if (opts.companyName) args.companyName = opts.companyName;
      if (opts.companyAddress) args.companyAddress = opts.companyAddress;
      if (opts.senderName) args.senderName = opts.senderName;
      if (opts.replyTo) args.replyToEmail = opts.replyTo;
      if (opts.footerHtmlFile) {
        const { readFileSync } = await import('node:fs');
        args.footerHtml = readFileSync(opts.footerHtmlFile, 'utf8');
      }
      const result = await callTool('update_workspace_brand', args);
      printRecord(result, parseFormat(opts.format ?? 'table'));
    });
}

function buildAgentSettingsCommand(): Command {
  return new Command('agent-settings')
    .description('Get the agent settings (store name, hours, policies, signature)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_agent_settings');
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildWorkspaceCommand(): Command {
  return new Command('workspace')
    .description('Workspace metadata — brand, limits, agent settings')
    .addCommand(buildBrandCommand())
    .addCommand(buildUpdateBrandCommand())
    .addCommand(buildLimitsCommand())
    .addCommand(buildAgentSettingsCommand());
}

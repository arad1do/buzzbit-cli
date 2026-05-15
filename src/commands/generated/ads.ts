// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-15T11:28:32.536Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('ads')
    .description('Auto-generated ads commands. 6 subcommands.');

  group.command('get-ad-campaign-details')
    .description("Get one ad campaign with creative count and recent attribution. Use to drill into a campaign that detect_hot_leads or list_ad_campaigns surfaced.")
    .option('--campaign-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      const result = await callTool('get_ad_campaign_details', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-ad-performance-summary')
    .description("Workspace-wide ad performance summary: total spend, impressions, clicks, conversions, revenue, derived ROAS / CTR / CPC / CVR. Defaults to a 30-day window. Mirrors the Business Hub Ads tab headline tiles.")
    .option('--since <value>', "Start of the window. Default: 30 days ago.")
    .option('--until <value>', "End of the window. Default: now.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      const result = await callTool('get_ad_performance_summary', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-ad-campaigns')
    .description("List paid-ad campaigns for the workspace. Each row carries spend, impressions, clicks, conversions, revenue, and date window. Filter by status or marketing channel.")
    .option('--status <value>', "Filter by ACTIVE | PAUSED | COMPLETED | DRAFT.")
    .option('--channel-id <value>', "Restrict to one marketing channel.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['channelId'] !== undefined) args['channelId'] = opts['channelId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_ad_campaigns', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-ad-creatives')
    .description("List AI-generated ad creatives. Each carries image / headline / CTA / primary text and per-creative performance metrics. Filter by campaign, platform, status, or favorites.")
    .option('--campaign-id <value>', "Restrict to one campaign.")
    .option('--platform <value>', "Filter by platform string (e.g. ")
    .option('--status <value>', "DRAFT / PUBLISHED / ARCHIVED.")
    .option('--favorites-only', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      if (opts['platform'] !== undefined) args['platform'] = opts['platform'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['favoritesOnly'] !== undefined) args['favoritesOnly'] = opts['favoritesOnly'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_ad_creatives', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-attributions')
    .description("List Attribution rows (order → campaign with attributed revenue). Use to answer")
    .option('--campaign-id <value>', "")
    .option('--order-id <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--cursor <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['campaignId'] !== undefined) args['campaignId'] = opts['campaignId'];
      if (opts['orderId'] !== undefined) args['orderId'] = opts['orderId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['cursor'] !== undefined) args['cursor'] = opts['cursor'];
      const result = await callTool('list_attributions', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-marketing-channels')
    .description("List configured marketing channels for the workspace (Facebook / Google / TikTok / Instagram / Influencer / Email / Organic) with campaign counts.")
    .option('--type <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      const result = await callTool('list_marketing_channels', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

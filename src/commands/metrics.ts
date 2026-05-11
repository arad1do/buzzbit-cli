/**
 * `bbx metrics` — high-level analytics shortcuts.
 *
 *   overview       → get_dashboard_overview
 *   revenue        → get_revenue_stats --period=…
 *   growth         → get_growth_metrics --period=…
 *   limits         → get_workspace_limits   (tier + quota usage)
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';

function buildOverviewCommand(): Command {
  return new Command('overview')
    .description('Dashboard headline numbers')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_dashboard_overview');
      printRecord(result, parseFormat(opts.format));
    });
}

function buildRevenueCommand(): Command {
  return new Command('revenue')
    .description('Revenue stats for a period')
    .option('--period <period>', 'today | yesterday | last_7_days | last_30_days | last_90_days | this_month', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { period?: string; format?: string }) => {
      const result = await callTool('get_revenue_stats', { period: opts.period ?? 'last_30_days' });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildGrowthCommand(): Command {
  return new Command('growth')
    .description('Customer / order growth metrics')
    .option('--period <period>', 'last_7_days | last_30_days | last_90_days', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { period?: string; format?: string }) => {
      const result = await callTool('get_growth_metrics', { period: opts.period ?? 'last_30_days' });
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

export function buildMetricsCommand(): Command {
  return new Command('metrics')
    .description('Analytics shortcuts (revenue, growth, dashboard)')
    .addCommand(buildOverviewCommand())
    .addCommand(buildRevenueCommand())
    .addCommand(buildGrowthCommand())
    .addCommand(buildLimitsCommand());
}

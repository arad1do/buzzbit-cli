// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.808Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('coo')
    .description('Auto-generated coo commands. 4 subcommands.');

  group.command('get-metrics-daily')
    .description("Daily aggregate COO metrics: tasks run, decisions approved / rejected, errors, time saved (minutes), ad spend optimized, revenue protected, credits used. Default window: last 30 days.")
    .option('--since <value>', "")
    .option('--until <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_coo_metrics_daily', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-connectors')
    .description("List COO connectors — bridges between integrations and the autonomous operations engine. Each row carries capability flags (canRead / canWrite / canAutomate) and sync timing. Useful for")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('list_coo_connectors', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-events')
    .description("List COO event log entries newest-first. Filter by event type, severity, rule, customer, or time window. Use to audit what the autonomous COO has been doing.")
    .option('--event-type <value>', "")
    .option('--severity <value>', " (one of: info, warning, error, critical)")
    .option('--rule-id <value>', "")
    .option('--customer-id <value>', "")
    .option('--since <value>', "")
    .option('--until <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['eventType'] !== undefined) args['eventType'] = opts['eventType'];
      if (opts['severity'] !== undefined) args['severity'] = opts['severity'];
      if (opts['ruleId'] !== undefined) args['ruleId'] = opts['ruleId'];
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_coo_events', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-rules')
    .description("List COO (autonomous operations) rules — trigger → actions reaction rules with execution flags (autoExecute / requiresApproval / confidenceThreshold). Use to inspect the AI COO\\")
    .option('--category <value>', "Filter by rule category (e.g. ")
    .option('--is-active', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['isActive'] !== undefined) args['isActive'] = opts['isActive'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_coo_rules', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

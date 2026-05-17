// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.817Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('integrations')
    .description('Auto-generated integrations commands. 3 subcommands.');

  group.command('get-connection-health')
    .description("Health summary across all integrations: connected count, token-expired count, oldest sync age. Does not perform live provider pings.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_connection_health', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-integration-status')
    .description("Get a single integration\\")
    .option('--integration-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['integrationId'] !== undefined) args['integrationId'] = opts['integrationId'];
      const result = await callTool('get_integration_status', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List integrations for the workspace with safe, non-credential fields only. Use to answer")
    .option('--platform <value>', "Filter by platform (shopify, meta, google, gmail, …).")
    .option('--status <value>', " (one of: connected, disconnected, error)")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['platform'] !== undefined) args['platform'] = opts['platform'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      const result = await callTool('list_integrations', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

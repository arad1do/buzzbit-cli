/**
 * `bbx integrations` — list, get, health.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';

function buildListCommand(): Command {
  return new Command('list')
    .description('List integrations (Shopify, Meta, Google, Gmail, …)')
    .option('--platform <name>')
    .option('-s, --status <status>', 'connected | disconnected | error')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { platform?: string; status?: string; format?: string }) => {
      const args: Record<string, unknown> = {};
      if (opts.platform) args.platform = opts.platform;
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_integrations', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['name', 'platform', 'status', 'updatedAt'],
      });
    });
}

function buildGetCommand(): Command {
  return new Command('get')
    .description('Get one integration\'s status (redacted)')
    .argument('<id>')
    .option('--format <format>', 'table | json', 'json')
    .action(async (id: string, opts: { format?: string }) => {
      const result = await callTool('get_integration_status', { integrationId: id });
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

function buildHealthCommand(): Command {
  return new Command('health')
    .description('Connection health summary across all integrations')
    .option('--format <format>', 'table | json', 'json')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_connection_health');
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

export function buildIntegrationsCommand(): Command {
  return new Command('integrations')
    .description('View integrations status + connection health')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand())
    .addCommand(buildHealthCommand());
}

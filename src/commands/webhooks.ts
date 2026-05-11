/**
 * `bbx webhooks` — list, create, update, delete.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildListCommand(): Command {
  return new Command('list')
    .description('List outbound webhook endpoints + recent delivery summary')
    .option('--active', 'Only active endpoints')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { active?: boolean; format?: string }) => {
      const args: Record<string, unknown> = {};
      if (opts.active) args.activeOnly = true;
      const result = await callTool('list_webhooks', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['url', 'events', 'isActive', 'updatedAt'],
      });
    });
}

function buildCreateCommand(): Command {
  return new Command('create')
    .description('Register a webhook endpoint (signing secret returned ONCE)')
    .requiredOption('--url <url>', 'HTTPS endpoint')
    .requiredOption('--events <list>', 'Comma-separated event names (e.g. order.created,customer.tagged)')
    .option('--secret <secret>', 'Custom signing secret (auto-generated if omitted)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { url: string; events: string; secret?: string; format?: string }) => {
      const events = opts.events.split(',').map((e) => e.trim()).filter(Boolean);
      if (events.length === 0) throw new ValidationError('--events requires at least one event name');
      const args: Record<string, unknown> = { url: opts.url, events };
      if (opts.secret) args.secret = opts.secret;
      const result = await callTool('create_webhook', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateCommand(): Command {
  return new Command('update')
    .description('Update a webhook endpoint')
    .argument('<id>')
    .option('--url <url>')
    .option('--events <list>')
    .option('--active <bool>', 'true | false')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { url?: string; events?: string; active?: string; format?: string }) => {
      const args: Record<string, unknown> = { endpointId: id };
      if (opts.url) args.url = opts.url;
      if (opts.events) args.events = opts.events.split(',').map((e) => e.trim()).filter(Boolean);
      if (opts.active !== undefined) args.isActive = opts.active === 'true';
      const result = await callTool('update_webhook', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a webhook endpoint (30s undo)')
    .argument('<id>')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { confirm?: boolean; format?: string }) => {
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(`About to delete webhook ${id}. Re-run with --confirm.\n`);
        return;
      }
      const result = await callTool('delete_webhook', { endpointId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildWebhooksCommand(): Command {
  return new Command('webhooks')
    .description('Outbound webhook endpoints')
    .addCommand(buildListCommand())
    .addCommand(buildCreateCommand())
    .addCommand(buildUpdateCommand())
    .addCommand(buildDeleteCommand());
}

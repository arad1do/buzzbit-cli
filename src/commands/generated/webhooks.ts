// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-15T11:28:32.576Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('webhooks')
    .description('Auto-generated webhooks commands. 4 subcommands.');

  group.command('create-webhook')
    .description("Register an outbound webhook endpoint. Returns the signing secret ONCE — copy it immediately; the server stores a one-way hash. Use the secret to validate the X-BuzzBit-Signature header on incoming requests.")
    .option('--url <value>', "HTTPS endpoint that will receive POST payloads.")
    .option('--events <value>', "Event names to subscribe (e.g. ")
    .option('--secret <value>', "Optional signing secret. If absent, one is generated and returned ONCE.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['url'] !== undefined) args['url'] = opts['url'];
      if (opts['events'] !== undefined) args['events'] = opts['events'];
      if (opts['secret'] !== undefined) args['secret'] = opts['secret'];
      const result = await callTool('create_webhook', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('delete-webhook')
    .description("Delete a webhook endpoint. 30-second undo window — call cancel_pending_action with the returned actionId to abort.")
    .option('--endpoint-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['endpointId'] !== undefined) args['endpointId'] = opts['endpointId'];
      const result = await callTool('delete_webhook', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List outbound webhook endpoints configured for the workspace with a recent delivery summary (last 5 attempts per endpoint, success/fail counts). Signing secret is never returned.")
    .option('--active-only', "Filter to active endpoints only.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['activeOnly'] !== undefined) args['activeOnly'] = opts['activeOnly'];
      const result = await callTool('list_webhooks', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-webhook')
    .description("Update a webhook endpoint\\")
    .option('--endpoint-id <value>', "")
    .option('--url <value>', "")
    .option('--events <value>', "")
    .option('--is-active', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['endpointId'] !== undefined) args['endpointId'] = opts['endpointId'];
      if (opts['url'] !== undefined) args['url'] = opts['url'];
      if (opts['events'] !== undefined) args['events'] = opts['events'];
      if (opts['isActive'] !== undefined) args['isActive'] = opts['isActive'];
      const result = await callTool('update_webhook', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

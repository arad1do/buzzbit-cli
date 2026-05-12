// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.750Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('broadcasts')
    .description('Auto-generated broadcasts commands. 2 subcommands.');

  group.command('create-broadcast-draft')
    .description("Create a broadcast (WhatsApp template, Messenger, or Instagram DM) in DRAFT. Use send_broadcast to dispatch (30s undo window applies).")
    .option('--name <value>', "")
    .option('--channel <value>', "")
    .option('--template-name <value>', "Required for WhatsApp — name of an approved Meta WA template.")
    .option('--message <value>', "Required for Messenger / Instagram — free-text body.")
    .option('--segment-id <value>', "Target segment. Omit to target every reachable customer.")
    .option('--scheduled-at <value>', "Optional schedule time (ISO 8601). Omit for immediate-on-approval.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['channel'] !== undefined) args['channel'] = opts['channel'];
      if (opts['templateName'] !== undefined) args['templateName'] = opts['templateName'];
      if (opts['message'] !== undefined) args['message'] = opts['message'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['scheduledAt'] !== undefined) args['scheduledAt'] = opts['scheduledAt'];
      const result = await callTool('create_broadcast_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List broadcast messaging campaigns (WhatsApp template sends, Messenger or Instagram mass DMs). Filterable by channel and status.")
    .option('--channel <value>', "WHATSAPP | MESSENGER | INSTAGRAM")
    .option('--status <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['channel'] !== undefined) args['channel'] = opts['channel'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_broadcasts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

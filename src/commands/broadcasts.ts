/**
 * `bbx broadcasts` — list, create-draft.
 *
 * Broadcasts go through the existing send pipeline server-side; no
 * CLI-side send tool yet (server doesn't expose send_broadcast as MCP).
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const TABLE_COLS = ['id', 'name', 'channel', 'status', 'recipientCount', 'sentCount', 'createdAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List broadcasts (WhatsApp / Messenger / Instagram)')
    .option('--channel <ch>', 'WHATSAPP | MESSENGER | INSTAGRAM')
    .option('-s, --status <status>', 'DRAFT | SCHEDULED | SENDING | COMPLETED | FAILED')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { channel?: string; status?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.channel) args.channel = opts.channel;
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_broadcasts', args);
      printResult(result, { format: parseFormat(opts.format), columns: TABLE_COLS });
    });
}

function buildCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a broadcast draft')
    .requiredOption('--name <name>')
    .requiredOption('--channel <ch>', 'WHATSAPP | MESSENGER | INSTAGRAM')
    .option('--template <name>', 'WhatsApp template name (required for WA)')
    .option('--message <text>', 'Free-text body (required for Messenger / Instagram)')
    .option('--segment <id>', 'Target segment id (omit for all reachable customers)')
    .option('--scheduled-at <iso>', 'Schedule time (ISO 8601)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      name: string;
      channel: string;
      template?: string;
      message?: string;
      segment?: string;
      scheduledAt?: string;
      format?: string;
    }) => {
      const args: Record<string, unknown> = { name: opts.name, channel: opts.channel };
      if (opts.template) args.templateName = opts.template;
      if (opts.message) args.message = opts.message;
      if (opts.segment) args.segmentId = opts.segment;
      if (opts.scheduledAt) args.scheduledAt = opts.scheduledAt;
      const result = await callTool('create_broadcast_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildBroadcastsCommand(): Command {
  return new Command('broadcasts')
    .description('Manage WhatsApp / Messenger / Instagram broadcasts')
    .addCommand(buildListCommand())
    .addCommand(buildCreateDraftCommand());
}

void ValidationError;

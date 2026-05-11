/**
 * `bbx inbox` — list conversations, view a thread, list DM templates.
 *
 * Reply / send-template are EXECUTE-scope writes and will land alongside
 * the v0.2 polish pass once we have the moderation flow nailed down.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const CONV_TABLE_COLS = ['id', 'channel', 'customerEmail', 'status', 'unread', 'updatedAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List recent conversations')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('--channel <channel>', 'Filter by channel (whatsapp, instagram, email)')
    .option('-s, --status <status>', 'Filter by status (open, closed)')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; channel?: string; status?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.channel) args.channel = opts.channel;
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_conversations', args);
      printResult(result, { format: parseFormat(opts.format), columns: CONV_TABLE_COLS });
    });
}

function buildShowCommand(): Command {
  return new Command('show')
    .description('Show messages in a conversation thread')
    .argument('<id>', 'Conversation id')
    .option('-l, --limit <n>', 'Max messages (1-200)', '50')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { limit?: string; format?: string }) => {
      if (!id) throw new ValidationError('Conversation id required');
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 200);
      const result = await callTool('get_conversation_messages', { conversationId: id, limit });
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildTemplatesCommand(): Command {
  return new Command('templates')
    .description('List DM templates available for sending')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('list_dm_templates');
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildSendTemplateCommand(): Command {
  return new Command('send-template')
    .description('Send a DM template to a customer (EXECUTE — 30s undo window)')
    .requiredOption('--customer <id>', 'Customer id')
    .requiredOption('--template <id>', 'Template id')
    .option('--channel <channel>', 'whatsapp | messenger | instagram', 'whatsapp')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { customer: string; template: string; channel?: string; confirm?: boolean; format?: string }) => {
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(
          `About to send template ${opts.template} to ${opts.customer}. Re-run with --confirm.\n`,
        );
        return;
      }
      const result = await callTool('send_dm_template', {
        customerId: opts.customer,
        templateId: opts.template,
        channel: opts.channel ?? 'whatsapp',
      });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildInboxCommand(): Command {
  return new Command('inbox')
    .description('View conversations and send DM templates')
    .addCommand(buildListCommand())
    .addCommand(buildShowCommand())
    .addCommand(buildTemplatesCommand())
    .addCommand(buildSendTemplateCommand());
}

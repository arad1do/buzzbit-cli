/**
 * `bbx support` — tickets + knowledge base.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildTicketsListCommand(): Command {
  return new Command('list')
    .description('List support tickets')
    .option('-s, --status <status>', 'OPEN | IN_PROGRESS | PENDING_APPROVAL | WAITING_ON_CUSTOMER | CLOSED')
    .option('-p, --priority <prio>', 'LOW | MEDIUM | HIGH | CRITICAL')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { status?: string; priority?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      if (opts.priority) args.priority = opts.priority;
      const result = await callTool('list_support_tickets', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['ticketNumber', 'subject', 'status', 'priority', 'customerEmail', 'updatedAt'],
      });
    });
}

function buildTicketGetCommand(): Command {
  return new Command('get')
    .description('Get one ticket with its full message thread')
    .argument('<id>', 'Ticket id')
    .option('--format <format>', 'table | json', 'json')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Ticket id required');
      const result = await callTool('get_support_ticket', { ticketId: id });
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

function buildTicketReplyCommand(): Command {
  return new Command('reply')
    .description('Append a message (internal note by default) to a ticket thread')
    .requiredOption('--ticket <id>', 'Ticket id')
    .requiredOption('--content <text>', 'Message body')
    .option('--public', 'Mark as customer-facing (default: internal note)')
    .option('--from <name>', 'Sender display name')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { ticket: string; content: string; public?: boolean; from?: string; format?: string }) => {
      const args: Record<string, unknown> = {
        ticketId: opts.ticket,
        content: opts.content,
        internal: !opts.public,
      };
      if (opts.from) args.senderName = opts.from;
      const result = await callTool('reply_support_ticket', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildTicketsCommand(): Command {
  return new Command('tickets')
    .description('Support tickets')
    .addCommand(buildTicketsListCommand())
    .addCommand(buildTicketGetCommand())
    .addCommand(buildTicketReplyCommand());
}

function buildKbCommand(): Command {
  return new Command('kb')
    .description('Knowledge base articles')
    .addCommand(
      new Command('list')
        .description('List / search KB articles')
        .option('-s, --search <text>', 'Substring match on title + body')
        .option('--type <type>', 'POLICY | FAQ | PRODUCT_GUIDE | SUPPORT | CUSTOM')
        .option('--status <status>', 'DRAFT | PUBLISHED | ARCHIVED')
        .option('-l, --limit <n>', 'Max rows', '20')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { search?: string; type?: string; status?: string; limit?: string; format?: string }) => {
          const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
          const args: Record<string, unknown> = { limit };
          if (opts.search) args.search = opts.search;
          if (opts.type) args.type = opts.type;
          if (opts.status) args.status = opts.status;
          const result = await callTool('list_kb_articles', args);
          printResult(result, {
            format: parseFormat(opts.format),
            columns: ['title', 'type', 'status', 'category', 'updatedAt'],
          });
        }),
    );
}

export function buildSupportCommand(): Command {
  return new Command('support')
    .description('Support tickets and knowledge base')
    .addCommand(buildTicketsCommand())
    .addCommand(buildKbCommand());
}

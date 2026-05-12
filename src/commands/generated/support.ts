// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T10:21:33.553Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('support')
    .description('Auto-generated support commands. 4 subcommands.');

  group.command('get-ticket')
    .description("Fetch one support ticket including its full message thread, AI draft, sentiment, and assignment metadata.")
    .option('--ticket-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['ticketId'] !== undefined) args['ticketId'] = opts['ticketId'];
      const result = await callTool('get_support_ticket', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-kb-articles')
    .description("List knowledge base articles. Use the search arg for substring matching across title + body. Use the type filter to narrow to POLICY / FAQ / etc.")
    .option('--status <value>', "")
    .option('--type <value>', "")
    .option('--search <value>', "Substring match on title + content.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['search'] !== undefined) args['search'] = opts['search'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_kb_articles', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-tickets')
    .description("List support tickets for this workspace.")
    .option('--status <value>', "")
    .option('--priority <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['priority'] !== undefined) args['priority'] = opts['priority'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_support_tickets', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('reply support ticket')
    .description("Append a message to a support ticket thread. Default is an internal note visible only to merchant staff. Set internal=false to mark a customer-facing reply.")
    .option('--ticket-id <value>', "")
    .option('--content <value>', "")
    .option('--internal', "Default true — message is internal note. Set false to mark as customer-facing.")
    .option('--sender-name <value>', "Display name. Defaults to ")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['ticketId'] !== undefined) args['ticketId'] = opts['ticketId'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['internal'] !== undefined) args['internal'] = opts['internal'];
      if (opts['senderName'] !== undefined) args['senderName'] = opts['senderName'];
      const result = await callTool('reply_support_ticket', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

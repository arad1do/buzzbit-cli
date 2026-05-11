/**
 * `bbx orders` — list, get.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const ORDER_TABLE_COLS = ['id', 'orderNumber', 'status', 'total', 'currency', 'createdAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List orders in the active workspace')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('-c, --cursor <id>', 'Pagination cursor (order id)')
    .option('-s, --status <status>', 'Filter by status (e.g. paid, pending)')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; cursor?: string; status?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.cursor) args.cursor = opts.cursor;
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_orders', args);
      printResult(result, { format: parseFormat(opts.format), columns: ORDER_TABLE_COLS });
    });
}

function buildGetCommand(): Command {
  return new Command('get')
    .description('Get order details (items, customer, shipping)')
    .argument('<id>', 'Order id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Order id required');
      const result = await callTool('get_order_details', { orderId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildOrdersCommand(): Command {
  return new Command('orders')
    .description('List and inspect orders')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand());
}

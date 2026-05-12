// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.975Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('orders')
    .description('Auto-generated orders commands. 3 subcommands.');

  group.command('get-order-details')
    .description("Get full order details including status, totals, addresses, and line items.")
    .option('--order-id <value>', "Order UUID.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['orderId'] !== undefined) args['orderId'] = opts['orderId'];
      const result = await callTool('get_order_details', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List orders in the current workspace with cursor-based pagination.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--cursor <value>', "")
    .option('--status <value>', "Filter by order status (e.g. pending, fulfilled, cancelled).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['cursor'] !== undefined) args['cursor'] = opts['cursor'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      const result = await callTool('list_orders', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-shipments')
    .description("List shipments. Filter by status (PENDING / SHIPPED / IN_TRANSIT / DELIVERED / EXCEPTION / CANCELLED) or by order id.")
    .option('--status <value>', "")
    .option('--order-id <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['orderId'] !== undefined) args['orderId'] = opts['orderId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_shipments', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

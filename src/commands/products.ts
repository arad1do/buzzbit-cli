/**
 * `bbx products` — list, get, performance.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const PRODUCT_TABLE_COLS = ['id', 'title', 'price', 'inventory', 'status', 'createdAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List products in the active workspace')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('-c, --cursor <id>', 'Pagination cursor (product id)')
    .option('-s, --search <text>', 'Title/SKU substring')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; cursor?: string; search?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.cursor) args.cursor = opts.cursor;
      if (opts.search) args.search = opts.search;
      const result = await callTool('list_products', args);
      printResult(result, { format: parseFormat(opts.format), columns: PRODUCT_TABLE_COLS });
    });
}

function buildGetCommand(): Command {
  return new Command('get')
    .description('Get product details')
    .argument('<id>', 'Product id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Product id required');
      const result = await callTool('get_product_details', { productId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildPerformanceCommand(): Command {
  return new Command('performance')
    .description('Get a product\'s revenue / order count for a date range')
    .argument('<id>', 'Product id')
    .option('--period <period>', 'last_7_days | last_30_days | last_90_days | this_month', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { period?: string; format?: string }) => {
      if (!id) throw new ValidationError('Product id required');
      const result = await callTool('get_product_performance', {
        productId: id,
        period: opts.period ?? 'last_30_days',
      });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildProductsCommand(): Command {
  return new Command('products')
    .description('List, inspect, and analyze products')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand())
    .addCommand(buildPerformanceCommand());
}

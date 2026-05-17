// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.821Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('products')
    .description('Auto-generated products commands. 3 subcommands.');

  group.command('get-product-details')
    .description("Get a product\\")
    .option('--product-id <value>', "Product UUID.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['productId'] !== undefined) args['productId'] = opts['productId'];
      const result = await callTool('get_product_details', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-product-performance')
    .description("Top products by revenue and units sold over the requested window.")
    .option('--days <number>', "Window for revenue aggregation. Default: 30.", (v) => Number(v))
    .option('--limit <number>', "Top N products. Default 10, hard cap 100.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['days'] !== undefined) args['days'] = opts['days'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_product_performance', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List products in the current workspace with optional status/category/search filters.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--cursor <value>', "")
    .option('--status <value>', " (one of: active, draft, archived)")
    .option('--category <value>', "")
    .option('--search <value>', "Substring match on name or SKU.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['cursor'] !== undefined) args['cursor'] = opts['cursor'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['search'] !== undefined) args['search'] = opts['search'];
      const result = await callTool('list_products', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

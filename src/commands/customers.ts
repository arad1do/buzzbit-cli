/**
 * `bbx customers` — list, get, search, tag.
 *
 * All commands map 1:1 to MCP tools:
 *   list   → list_customers
 *   get    → get_customer_details
 *   search → search_customers
 *   tag    → tag_customers (write — bulk-capable)
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

interface CustomerListResponse {
  customers: Array<Record<string, unknown>>;
  pagination?: { count: number; limit: number; nextCursor: string | null };
}

const CUSTOMER_TABLE_COLS = [
  'id',
  'email',
  'firstName',
  'lastName',
  'totalOrders',
  'totalSpent',
  'createdAt',
];

function buildListCommand(): Command {
  return new Command('list')
    .description('List customers in the active workspace')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('-c, --cursor <id>', 'Pagination cursor (customer id)')
    .option('-s, --search <text>', 'Email/name substring')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; cursor?: string; search?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.cursor) args.cursor = opts.cursor;
      if (opts.search) args.search = opts.search;
      const result = await callTool<CustomerListResponse>('list_customers', args);
      const footer = result.pagination?.nextCursor
        ? `next: bbx customers list --cursor=${result.pagination.nextCursor}`
        : undefined;
      printResult(result, {
        format: parseFormat(opts.format),
        columns: CUSTOMER_TABLE_COLS,
        footer,
      });
    });
}

function buildGetCommand(): Command {
  return new Command('get')
    .description('Get a customer deep profile')
    .argument('<id>', 'Customer id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Customer id required');
      const result = await callTool('get_customer_details', { customerId: id });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildSearchCommand(): Command {
  return new Command('search')
    .description('Search customers by email / name / phone')
    .argument('<query>', 'Search text')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (query: string, opts: { limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const result = await callTool('search_customers', { query, limit });
      printResult(result, { format: parseFormat(opts.format), columns: CUSTOMER_TABLE_COLS });
    });
}

function buildTagCommand(): Command {
  return new Command('tag')
    .description('Add tags to one or more customers')
    .argument('<ids...>', 'Customer ids (space-separated)')
    .requiredOption('-t, --tags <tags>', 'Comma-separated tag list')
    .option('--format <format>', 'table | json', 'table')
    .action(async (ids: string[], opts: { tags: string; format?: string }) => {
      const tags = opts.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tags.length === 0) throw new ValidationError('--tags must include at least one tag');
      if (ids.length === 0) throw new ValidationError('At least one customer id required');

      const tool = ids.length === 1 ? 'tag_customers' : 'bulk_tag_customers';
      const args = ids.length === 1 ? { customerId: ids[0], tags } : { customerIds: ids, tags };
      const result = await callTool(tool, args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildVipTiersCommand(): Command {
  return new Command('vip-tiers')
    .description('Manage VIP reward tiers')
    .addCommand(
      new Command('list')
        .description('List VIP tiers')
        .option('--active', 'Only active tiers')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { active?: boolean; format?: string }) => {
          const args: Record<string, unknown> = {};
          if (opts.active) args.active = true;
          const result = await callTool('list_vip_tiers', args);
          printResult(result, {
            format: parseFormat(opts.format),
            columns: ['name', 'spendThreshold', 'rewardType', 'rewardValue', 'isActive'],
          });
        }),
    )
    .addCommand(
      new Command('create')
        .description('Create a VIP reward tier')
        .requiredOption('--name <name>')
        .requiredOption('--spend <amount>', 'Lifetime spend threshold')
        .requiredOption('--reward-type <type>', 'DISCOUNT_CODE | FREE_SHIPPING | STORE_CREDIT')
        .requiredOption('--reward-value <value>', 'Reward value (percent or currency)')
        .option('--orders <n>', 'Optional minimum order count')
        .option('--format <format>', 'table | json', 'table')
        .action(async (opts: { name: string; spend: string; rewardType: string; rewardValue: string; orders?: string; format?: string }) => {
          const args: Record<string, unknown> = {
            name: opts.name,
            spendThreshold: parseFloat(opts.spend),
            rewardType: opts.rewardType,
            rewardValue: parseFloat(opts.rewardValue),
          };
          if (opts.orders) args.orderCountThreshold = parseInt(opts.orders, 10);
          const result = await callTool('create_vip_tier', args);
          printRecord(result, parseFormat(opts.format));
        }),
    );
}

function buildCartsCommand(): Command {
  return new Command('carts')
    .description('List abandoned / active carts')
    .option('-s, --status <status>', 'ACTIVE | ABANDONED | RECOVERED | CONVERTED', 'ABANDONED')
    .option('--customer <id>', 'Filter to one customer')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { status?: string; customer?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      if (opts.customer) args.customerId = opts.customer;
      const result = await callTool('list_carts', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['id', 'customerId', 'subtotal', 'status', 'abandonedAt', 'lastActivityAt'],
      });
    });
}

function buildEventsCommand(): Command {
  return new Command('events')
    .description('List customer behavior events')
    .option('--customer <id>', 'Filter to one customer')
    .option('--type <type>', 'Event type filter')
    .option('--since <iso>', 'Events after this datetime')
    .option('-l, --limit <n>', 'Max rows', '50')
    .option('--format <format>', 'table | json | csv', 'json')
    .action(async (opts: { customer?: string; type?: string; since?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 200);
      const args: Record<string, unknown> = { limit };
      if (opts.customer) args.customerId = opts.customer;
      if (opts.type) args.eventType = opts.type;
      if (opts.since) args.since = opts.since;
      const result = await callTool('list_customer_events', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });
}

function buildStockNotifyCommand(): Command {
  return new Command('stock-notify')
    .description('List back-in-stock notification subscribers')
    .option('--product <id>', 'Filter to one product')
    .option('--pending', 'Only subscribers who have not been notified yet')
    .option('-l, --limit <n>', 'Max rows', '50')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { product?: string; pending?: boolean; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 200);
      const args: Record<string, unknown> = { limit };
      if (opts.product) args.productId = opts.product;
      if (opts.pending) args.pending = true;
      const result = await callTool('list_stock_notify_subscribers', args);
      printResult(result, { format: parseFormat(opts.format) });
    });
}

export function buildCustomersCommand(): Command {
  return new Command('customers')
    .description('List, search, get, tag — plus VIP tiers, carts, events, stock-notify')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand())
    .addCommand(buildSearchCommand())
    .addCommand(buildTagCommand())
    .addCommand(buildVipTiersCommand())
    .addCommand(buildCartsCommand())
    .addCommand(buildEventsCommand())
    .addCommand(buildStockNotifyCommand());
}

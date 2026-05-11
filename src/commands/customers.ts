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

export function buildCustomersCommand(): Command {
  return new Command('customers')
    .description('List, search, get, and tag customers')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand())
    .addCommand(buildSearchCommand())
    .addCommand(buildTagCommand());
}

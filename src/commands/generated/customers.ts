// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.755Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('customers')
    .description('Auto-generated customers commands. 11 subcommands.');

  group.command('bulk-tag-customers')
    .description("Bulk add/remove tags across up to ${HARD_CAP} customers in one call. Workspace-isolated — only customers belonging to your workspace are modified.")
    .option('--customer-ids <value>', "Customer UUIDs (max ${HARD_CAP}).")
    .option('--add <value>', "")
    .option('--remove <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerIds'] !== undefined) args['customerIds'] = opts['customerIds'];
      if (opts['add'] !== undefined) args['add'] = opts['add'];
      if (opts['remove'] !== undefined) args['remove'] = opts['remove'];
      const result = await callTool('bulk_tag_customers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-vip-tier')
    .description("Create a new VIP reward tier (spend threshold + reward).")
    .option('--name <value>', "")
    .option('--spend-threshold <number>', "Lifetime spend required to enter this tier.", (v) => Number(v))
    .option('--order-count-threshold <number>', "Optional minimum order count.", (v) => Number(v))
    .option('--reward-type <value>', "DISCOUNT_CODE | FREE_SHIPPING | STORE_CREDIT")
    .option('--reward-value <number>', "Value of the reward (percentage or currency amount, by type).", (v) => Number(v))
    .option('--is-active', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['spendThreshold'] !== undefined) args['spendThreshold'] = opts['spendThreshold'];
      if (opts['orderCountThreshold'] !== undefined) args['orderCountThreshold'] = opts['orderCountThreshold'];
      if (opts['rewardType'] !== undefined) args['rewardType'] = opts['rewardType'];
      if (opts['rewardValue'] !== undefined) args['rewardValue'] = opts['rewardValue'];
      if (opts['isActive'] !== undefined) args['isActive'] = opts['isActive'];
      const result = await callTool('create_vip_tier', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-customer-details')
    .description("Get a customer\\")
    .option('--customer-id <value>', "Customer UUID.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('get_customer_details', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-browse-events')
    .description("List recent product-view (browse) events captured by the tracking pixel. Used to build browse-abandonment recovery flows.")
    .option('--status <value>', "")
    .option('--product-id <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['productId'] !== undefined) args['productId'] = opts['productId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_browse_events', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-carts')
    .description("List shopping carts. Defaults to recent ABANDONED carts — useful for building abandonment recovery flows or analyzing drop-off behaviour.")
    .option('--status <value>', "ACTIVE | ABANDONED | RECOVERED | CONVERTED. Default ABANDONED.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--customer-id <value>', "Filter to one customer\\")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('list_carts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-customer-events')
    .description("List customer behavior events (page views, cart adds, purchases, email interactions). Optionally filter by customer, event type, and time window.")
    .option('--customer-id <value>', "Optional — filter to one customer\\")
    .option('--event-type <value>', "Optional — filter by event type.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--since <value>', "ISO datetime — only events after this point.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['eventType'] !== undefined) args['eventType'] = opts['eventType'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      const result = await callTool('list_customer_events', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List customers in the current workspace with cursor-based pagination. Returns id, email, name, tags, totalSpent, orderCount, createdAt.")
    .option('--limit <number>', "Max customers to return. Default 20, hard cap 100.", (v) => Number(v))
    .option('--cursor <value>', "Customer id to paginate after (cursor-based pagination).")
    .option('--search <value>', "Optional substring match on email or first/last name.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['cursor'] !== undefined) args['cursor'] = opts['cursor'];
      if (opts['search'] !== undefined) args['search'] = opts['search'];
      const result = await callTool('list_customers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-stock-notify-subscribers')
    .description("List customers who asked to be notified when a product is back in stock. Filter by product id, or by")
    .option('--product-id <value>', "")
    .option('--pending', "When true, only subscribers who have not yet been notified.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['productId'] !== undefined) args['productId'] = opts['productId'];
      if (opts['pending'] !== undefined) args['pending'] = opts['pending'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_stock_notify_subscribers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-vip-tiers')
    .description("List VIP reward tiers configured for the workspace.")
    .option('--active', "Filter to active tiers only.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['active'] !== undefined) args['active'] = opts['active'];
      const result = await callTool('list_vip_tiers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('search')
    .description("Search customers in the current workspace by email, name, or phone substring.")
    .option('--query <value>', "Search term — matches email, name, or phone.")
    .option('--limit <number>', "Default 20, hard cap 100.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['query'] !== undefined) args['query'] = opts['query'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('search_customers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('tag')
    .description("Add or remove tags on a single customer. Tags array is deduplicated.")
    .option('--customer-id <value>', "Customer UUID.")
    .option('--add <value>', "Tags to add. Existing tags are preserved.")
    .option('--remove <value>', "Tags to remove.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['add'] !== undefined) args['add'] = opts['add'];
      if (opts['remove'] !== undefined) args['remove'] = opts['remove'];
      const result = await callTool('tag_customers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

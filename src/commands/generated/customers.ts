// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.970Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('customers')
    .description('Auto-generated customers commands. 30 subcommands.');

  group.command('add customer note')
    .description("Add an internal note to a customer\\")
    .option('--customer-id <value>', "")
    .option('--text <value>', "Note body. Supports plain text up to 10 000 chars.")
    .option('--author-name <value>', "Display name of the note author. Defaults to ")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['text'] !== undefined) args['text'] = opts['text'];
      if (opts['authorName'] !== undefined) args['authorName'] = opts['authorName'];
      const result = await callTool('add_customer_note', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('bulk-update-customers')
    .description("Apply a field-level change across many customers in one call. Workspace isolation enforced. Allowed fields: status, segment, leadStage, type. Hard cap 500 customers per call.")
    .option('--customer-ids <value>', "Customer ids to update. Max 500 per call.")
    .option('--patch <value>', "e.g. ")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerIds'] !== undefined) args['customerIds'] = opts['customerIds'];
      if (opts['patch'] !== undefined) args['patch'] = opts['patch'];
      const result = await callTool('bulk_update_customers', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('detect hot leads')
    .description("List customers whose lead score is at or above a threshold, ordered newest-first. Default threshold 80 / 100. Answers")
    .option('--threshold <number>', "Min lead score (0-100). Default 80.", (v) => Number(v))
    .option('--limit <number>', "Max results. Default 100, hard cap 200.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['threshold'] !== undefined) args['threshold'] = opts['threshold'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('detect_hot_leads', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-churn-predictions')
    .description("Predicted churn probability per customer with reasons. Use to build win-back flows or to prioritize outreach.")
    .option('--limit <number>', "Max customers to score. Default 100, hard cap 500.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_churn_predictions', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-clv-analysis')
    .description("Customer Lifetime Value per customer with segmentation hint, ordered by CLV descending. Use for budgeting decisions and high-value targeting.")
    .option('--limit <number>', "Max customers to compute. Default 100, hard cap 500.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_clv_analysis', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-cohort-analysis')
    .description("Retention / churn data grouped by acquisition cohort (month). Use to answer")
    .option('--months-back <number>', "Lookback in months for cohort definition. Default 12, hard cap 36.", (v) => Number(v))
    .option('--limit <number>', "Max customers to include. Default 1000.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['monthsBack'] !== undefined) args['monthsBack'] = opts['monthsBack'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_cohort_analysis', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-customer-dna')
    .description("Get the CustomerDNA row for one customer — behavioral patterns, engagement scores, temporal patterns, predicted next-purchase metrics, and message-fatigue tracking. Use to ground personalization decisions.")
    .option('--customer-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('get_customer_dna', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-customer-timeline')
    .description("Get the unified activity timeline for one customer — orders, COO events, conversations, and campaign interactions, merged and sorted newest-first. Use this to answer")
    .option('--customer-id <value>', "")
    .option('--limit <number>', "Max events to return. Default 50, hard cap 200.", (v) => Number(v))
    .option('--offset <number>', "Pagination offset.", (v) => Number(v))
    .option('--types <value>', "Filter to one or more event types. (one of: order, coo_event, conversation, campaign, lead_score, note, tag_added, tag_removed)")
    .option('--since <value>', "ISO datetime — only events on or after this time.")
    .option('--until <value>', "ISO datetime — only events on or before this time.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['offset'] !== undefined) args['offset'] = opts['offset'];
      if (opts['types'] !== undefined) args['types'] = opts['types'];
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      const result = await callTool('get_customer_timeline', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-customer-timeline-summary')
    .description("Aggregate counts across the customer\\")
    .option('--customer-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('get_customer_timeline_summary', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-lead-score-breakdown')
    .description("Get the per-factor lead score breakdown (engagement / fit / activity) for one customer plus narrative recommendations. Companion to detect_hot_leads.")
    .option('--customer-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('get_lead_score_breakdown', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-rfm-analysis')
    .description("RFM (Recency-Frequency-Monetary) segmentation across the workspace\\")
    .option('--limit <number>', "Max customers to score. Default 100, hard cap 500.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_rfm_analysis', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-segment-metrics')
    .description("Aggregate metrics per Segment row in the workspace: current customer count, average LTV, recent engagement.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_segment_metrics', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('link customer phone')
    .description("Attach a phone number to an existing customer. Adds a system note documenting the link. Use after merging an anonymous caller with an email-only contact.")
    .option('--customer-id <value>', "")
    .option('--phone <value>', "Phone number in any common format; will be normalized by the service.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['phone'] !== undefined) args['phone'] = opts['phone'];
      const result = await callTool('link_customer_phone', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-consent-records')
    .description("List immutable consent audit records for the workspace. Filter by email, consent type, and time window. Use for GDPR compliance audits.")
    .option('--email <value>', "Filter to one email address. Omit for workspace-wide history.")
    .option('--consent-type <value>', "Filter by SIGNUP_TERMS / MARKETING_OPT_IN / DATA_PROCESSING / COOKIE_CONSENT / PRIVACY_POLICY.")
    .option('--since <value>', "")
    .option('--until <value>', "")
    .option('--limit <number>', "Default 100, hard cap 500.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['email'] !== undefined) args['email'] = opts['email'];
      if (opts['consentType'] !== undefined) args['consentType'] = opts['consentType'];
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_consent_records', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('recalculate lead score')
    .description("Force a fresh lead-score computation for one customer and persist it. Use after a meaningful change to a customer (new tag, lifecycle bump, etc.).")
    .option('--customer-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      const result = await callTool('recalculate_lead_score', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('refresh all lead scores')
    .description("Recompute lead scores for every customer in the workspace. EXPENSIVE — 30s undo window before any DB work starts. Returns an actionId to pass to cancel_pending_action if the trigger was accidental.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('refresh_all_lead_scores', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('set customer custom attribute')
    .description("Set a single key/value pair on the customer\\")
    .option('--customer-id <value>', "")
    .option('--key <value>', "Attribute name. Cannot be ")
    .option('--value <json>', "JSON-serializable value. Use null to delete the attribute. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['key'] !== undefined) args['key'] = opts['key'];
      if (opts['value'] !== undefined) args['value'] = opts['value'];
      const result = await callTool('set_customer_custom_attribute', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-customer-lifecycle-stage')
    .description("Set a single customer\\")
    .option('--customer-id <value>', "")
    .option('--lead-stage <value>', "Lifecycle stage label (e.g. new / contacted / qualified / proposal / won / lost).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['leadStage'] !== undefined) args['leadStage'] = opts['leadStage'];
      const result = await callTool('update_customer_lifecycle_stage', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-customer-marketing-preferences')
    .description("Update a customer\\")
    .option('--customer-id <value>', "")
    .option('--email-consent', "Email Newsletter opt-in / opt-out.")
    .option('--sms-consent', "SMS Marketing opt-in / opt-out.")
    .option('--whatsapp-opt-in', "WhatsApp opt-in / opt-out.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['emailConsent'] !== undefined) args['emailConsent'] = opts['emailConsent'];
      if (opts['smsConsent'] !== undefined) args['smsConsent'] = opts['smsConsent'];
      if (opts['whatsappOptIn'] !== undefined) args['whatsappOptIn'] = opts['whatsappOptIn'];
      const result = await callTool('update_customer_marketing_preferences', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

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

// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.814Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('flows')
    .description('Auto-generated flows commands. 13 subcommands.');

  group.command('activate-flow')
    .description("Move a flow from DRAFT to ACTIVE. Reversible via update_flow_draft (set status back to draft or paused).")
    .option('--flow-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['flowId'] !== undefined) args['flowId'] = opts['flowId'];
      const result = await callTool('activate_flow', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('cancel-pending-action')
    .description("Cancel a queued send_campaign or publish_social_post within its 30s undo window.")
    .option('--action-id <value>', "actionId returned by send_campaign or publish_social_post.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['actionId'] !== undefined) args['actionId'] = opts['actionId'];
      const result = await callTool('cancel_pending_action', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-flow-draft')
    .description("Create a new email flow in DRAFT status. Returns the new flow id with previewUrl/approveUrl.")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--category <value>', "")
    .option('--trigger <value>', "Trigger event name (lowercase snake_case). Common: cart_abandoned, order_placed, customer_created, customer_birthday, new_subscriber, product_price_drop, product_back_in_stock. See FLOW_TRIGGER_VALUES for the full list. (one of: order_placed, order_cancelled, order_fulfilled, order_paid, order_updated, customer_created, customer_updated, customer_inactive, customer_lapsed, customer_birthday, cart_abandoned, checkout_abandoned, browse_abandoned, new_subscriber, product_price_drop, product_low_inventory, product_back_in_stock, product_created, product_updated, product_deleted, product_viewed, refund_created, fulfillment_created, fulfillment_updated, vip_achieved, email_opened, email_clicked, email_bounced, email_unsubscribed, email_complained, custom_event, manual, segment_entered, segment_exited, whatsapp_message_received, instagram_comment_received, instagram_dm_received, instagram_story_reply_received, instagram_follow_received, facebook_message_received, facebook_follow_received, sunset, winback, birthday, BROWSE_ABANDONED, VIP_ACHIEVED, viewed_product, SOCIAL_COMMENT, instagram_comment, instagram_story_reply, instagram_follow)")
    .option('--segment-id <value>', "")
    .option('--nodes <json>', "Flow nodes graph (ReactFlow JSON). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--definition <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['nodes'] !== undefined) args['nodes'] = opts['nodes'];
      if (opts['definition'] !== undefined) args['definition'] = opts['definition'];
      const result = await callTool('create_flow_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-chat-flow')
    .description("Fetch one chat flow including its full node/edge graph (ReactFlow JSON) so Claude can analyze or clone it.")
    .option('--flow-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['flowId'] !== undefined) args['flowId'] = opts['flowId'];
      const result = await callTool('get_chat_flow', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-flow-performance')
    .description("Get per-flow metrics: entered/completed/converted/revenue plus recent execution count.")
    .option('--flow-id <value>', "Flow UUID.")
    .option('--days <number>', "Recent execution window. Default: 30.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['flowId'] !== undefined) args['flowId'] = opts['flowId'];
      if (opts['days'] !== undefined) args['days'] = opts['days'];
      const result = await callTool('get_flow_performance', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-chat-flows')
    .description("List conversation chat flows (chatbot conversations for inbound DMs). Different from email flows — these run on WhatsApp / Instagram / Messenger.")
    .option('--status <value>', " (one of: draft, active, paused)")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_chat_flows', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-condition-operators')
    .description("Static catalog of operators supported by flow condition nodes and trigger conditions. Use this before composing a flow with conditional branching so the operator name matches what the engine accepts.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('list_condition_operators', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List email flows in the current workspace with status, trigger, and basic metrics.")
    .option('--status <value>', "Filter by flow status. (one of: draft, active, paused)")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_flows', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-flow-templates')
    .description("Pre-built flow templates Claude can adapt instead of composing from scratch. Covers cart-recovery, welcome series, win-back, birthday, post-purchase, review-request, back-in-stock, price-drop, and social patterns.")
    .option('--trigger-type <value>', "Optional filter — only return templates whose triggerType matches.")
    .option('--category <value>', "Optional filter — only return templates in this category. (one of: E-commerce, Lifecycle, Promotional, Transactional, Social)")
    .option('--include-graph', "If true, include the full nodes/edges JSON. Default false (summary only).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['triggerType'] !== undefined) args['triggerType'] = opts['triggerType'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['includeGraph'] !== undefined) args['includeGraph'] = opts['includeGraph'];
      const result = await callTool('list_flow_templates', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-template-variables')
    .description("For a given flow trigger, return the variables emitted in its payload. Call this before composing email content so {{var}} references resolve at send time.")
    .option('--trigger-type <value>', "Lowercase snake_case trigger name from the FlowTriggerType enum. (one of: order_placed, order_cancelled, order_fulfilled, order_paid, order_updated, customer_created, customer_updated, customer_inactive, customer_lapsed, customer_birthday, cart_abandoned, checkout_abandoned, browse_abandoned, new_subscriber, product_price_drop, product_low_inventory, product_back_in_stock, product_created, product_updated, product_deleted, product_viewed, refund_created, fulfillment_created, fulfillment_updated, vip_achieved, email_opened, email_clicked, email_bounced, email_unsubscribed, email_complained, custom_event, manual, segment_entered, segment_exited, whatsapp_message_received, instagram_comment_received, instagram_dm_received, instagram_story_reply_received, instagram_follow_received, facebook_message_received, facebook_follow_received, sunset, winback, birthday, BROWSE_ABANDONED, VIP_ACHIEVED, viewed_product, SOCIAL_COMMENT, instagram_comment, instagram_story_reply, instagram_follow)")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['triggerType'] !== undefined) args['triggerType'] = opts['triggerType'];
      const result = await callTool('list_template_variables', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-flow-draft')
    .description("Update fields on an existing flow (kept in DRAFT). Pass")
    .option('--flow-id <value>', "")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--category <value>', "")
    .option('--trigger <value>', " (one of: order_placed, order_cancelled, order_fulfilled, order_paid, order_updated, customer_created, customer_updated, customer_inactive, customer_lapsed, customer_birthday, cart_abandoned, checkout_abandoned, browse_abandoned, new_subscriber, product_price_drop, product_low_inventory, product_back_in_stock, product_created, product_updated, product_deleted, product_viewed, refund_created, fulfillment_created, fulfillment_updated, vip_achieved, email_opened, email_clicked, email_bounced, email_unsubscribed, email_complained, custom_event, manual, segment_entered, segment_exited, whatsapp_message_received, instagram_comment_received, instagram_dm_received, instagram_story_reply_received, instagram_follow_received, facebook_message_received, facebook_follow_received, sunset, winback, birthday, BROWSE_ABANDONED, VIP_ACHIEVED, viewed_product, SOCIAL_COMMENT, instagram_comment, instagram_story_reply, instagram_follow)")
    .option('--segment-id <value>', "")
    .option('--nodes <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--definition <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['flowId'] !== undefined) args['flowId'] = opts['flowId'];
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['nodes'] !== undefined) args['nodes'] = opts['nodes'];
      if (opts['definition'] !== undefined) args['definition'] = opts['definition'];
      const result = await callTool('update_flow_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('validate-flow-graph')
    .description("Validate a flow\\")
    .option('--nodes <json>', "ReactFlow node array. Each node needs at least id + type. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--edges <json>', "ReactFlow edge array. Each edge needs source + target. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['nodes'] !== undefined) args['nodes'] = opts['nodes'];
      if (opts['edges'] !== undefined) args['edges'] = opts['edges'];
      const result = await callTool('validate_flow_graph', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('validate-template-string')
    .description("Check that every {{variable}} in a template resolves against a trigger\\")
    .option('--template <value>', "Template string with {{variable.path}} placeholders. Pass an email subject or body.")
    .option('--trigger-type <value>', "The trigger whose payload the template will resolve against. (one of: order_placed, order_cancelled, order_fulfilled, order_paid, order_updated, customer_created, customer_updated, customer_inactive, customer_lapsed, customer_birthday, cart_abandoned, checkout_abandoned, browse_abandoned, new_subscriber, product_price_drop, product_low_inventory, product_back_in_stock, product_created, product_updated, product_deleted, product_viewed, refund_created, fulfillment_created, fulfillment_updated, vip_achieved, email_opened, email_clicked, email_bounced, email_unsubscribed, email_complained, custom_event, manual, segment_entered, segment_exited, whatsapp_message_received, instagram_comment_received, instagram_dm_received, instagram_story_reply_received, instagram_follow_received, facebook_message_received, facebook_follow_received, sunset, winback, birthday, BROWSE_ABANDONED, VIP_ACHIEVED, viewed_product, SOCIAL_COMMENT, instagram_comment, instagram_story_reply, instagram_follow)")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['template'] !== undefined) args['template'] = opts['template'];
      if (opts['triggerType'] !== undefined) args['triggerType'] = opts['triggerType'];
      const result = await callTool('validate_template_string', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

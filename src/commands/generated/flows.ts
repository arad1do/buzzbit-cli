// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.974Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('flows')
    .description('Auto-generated flows commands. 8 subcommands.');

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
    .option('--trigger <value>', "e.g. CUSTOMER_CREATED, CART_ABANDONED, ORDER_PLACED.")
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

  group.command('update-flow-draft')
    .description("Update fields on an existing flow (kept in DRAFT). Pass")
    .option('--flow-id <value>', "")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--category <value>', "")
    .option('--trigger <value>', "")
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

  return group;
}

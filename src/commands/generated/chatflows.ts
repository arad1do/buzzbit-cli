// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-15T11:28:32.554Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('chatflows')
    .description('Auto-generated chatflows commands. 5 subcommands.');

  group.command('activate-chatflow')
    .description("Activate a ChatFlow (DRAFT → ACTIVE). Validates the flow has a trigger and at least one message or AI-response node before activating. Reversible via update_chatflow_draft (set status back to draft or paused).")
    .option('--chatflow-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['chatflowId'] !== undefined) args['chatflowId'] = opts['chatflowId'];
      const result = await callTool('activate_chatflow', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-chatflow-draft')
    .description("Create a new ChatFlow in DRAFT status for WhatsApp / Instagram / Messenger DM automation. Use validate_flow_graph-style rules before sending: trigger has no incoming, every condition has both branches, every condition needs a default fallback to handoff.")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--trigger <value>', "Lowercase chatflow trigger from the ChatFlowTriggerType enum (23 values). Common: whatsapp_message, whatsapp_first_message, whatsapp_keyword, instagram_dm, instagram_comment, keyword_match.")
    .option('--trigger-config <json>', "Optional config — e.g. { keywords: [ (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--nodes <json>', "ChatFlow nodes (trigger, message, question, condition, ai_response, whatsapp_template, handoff, end). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--edges <json>', "Edges connecting nodes. Default empty. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['triggerConfig'] !== undefined) args['triggerConfig'] = opts['triggerConfig'];
      if (opts['nodes'] !== undefined) args['nodes'] = opts['nodes'];
      if (opts['edges'] !== undefined) args['edges'] = opts['edges'];
      const result = await callTool('create_chatflow_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-chatflow-performance')
    .description("Performance summary for a ChatFlow: total execution count, last-executed timestamp, status breakdown, and recent executions.")
    .option('--chatflow-id <value>', "")
    .option('--recent-limit <number>', "How many recent executions to return. Default 10. Max 100.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['chatflowId'] !== undefined) args['chatflowId'] = opts['chatflowId'];
      if (opts['recentLimit'] !== undefined) args['recentLimit'] = opts['recentLimit'];
      const result = await callTool('get_chatflow_performance', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-chatflow-templates')
    .description("Pre-built ChatFlow templates Claude can adapt instead of composing from scratch. Covers full e-commerce DM journey, order tracking, FAQ trees, abandoned-cart-from-DM, and more.")
    .option('--platform <value>', "Filter by messaging platform. (one of: whatsapp, instagram, messenger, facebook)")
    .option('--trigger <value>', "Filter by trigger name (e.g. whatsapp_message, instagram_dm).")
    .option('--include-graph', "If true, include the full nodes/edges JSON. Default false (summary only).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['platform'] !== undefined) args['platform'] = opts['platform'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['includeGraph'] !== undefined) args['includeGraph'] = opts['includeGraph'];
      const result = await callTool('list_chatflow_templates', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-chatflow-draft')
    .description("Update fields on an existing ChatFlow. Workspace-scoped. Only changed fields are sent.")
    .option('--chatflow-id <value>', "")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--trigger <value>', "")
    .option('--trigger-config <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--nodes <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--edges <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--viewport <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--audience-filter <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['chatflowId'] !== undefined) args['chatflowId'] = opts['chatflowId'];
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['triggerConfig'] !== undefined) args['triggerConfig'] = opts['triggerConfig'];
      if (opts['nodes'] !== undefined) args['nodes'] = opts['nodes'];
      if (opts['edges'] !== undefined) args['edges'] = opts['edges'];
      if (opts['viewport'] !== undefined) args['viewport'] = opts['viewport'];
      if (opts['audienceFilter'] !== undefined) args['audienceFilter'] = opts['audienceFilter'];
      const result = await callTool('update_chatflow_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

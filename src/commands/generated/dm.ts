// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.972Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('dm')
    .description('Auto-generated dm commands. 7 subcommands.');

  group.command('create-draft')
    .description("Create a DRAFT DM in an existing conversation. The draft is not sent — it awaits merchant approval in the inbox. Returns the message id and previewUrl.")
    .option('--conversation-id <value>', "Existing conversation id (from list_conversations).")
    .option('--body <value>', "Message body. May include {{firstName}} / {{orderNumber}} style variables.")
    .option('--media-urls <value>', "Optional media URLs (images / videos / docs).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['conversationId'] !== undefined) args['conversationId'] = opts['conversationId'];
      if (opts['body'] !== undefined) args['body'] = opts['body'];
      if (opts['mediaUrls'] !== undefined) args['mediaUrls'] = opts['mediaUrls'];
      const result = await callTool('create_dm_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-template')
    .description("Save a reusable DM template (WhatsApp / Instagram / Messenger / email). Returns the template id; apply via send_dm_template per recipient.")
    .option('--name <value>', "Internal template name (unique per workspace).")
    .option('--body <value>', "")
    .option('--platform <value>', "Channel the template targets. (one of: whatsapp, instagram, messenger, email)")
    .option('--variables <value>', "Variable names referenced in the body via {{...}} substitution.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['body'] !== undefined) args['body'] = opts['body'];
      if (opts['platform'] !== undefined) args['platform'] = opts['platform'];
      if (opts['variables'] !== undefined) args['variables'] = opts['variables'];
      const result = await callTool('create_dm_template', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-conversation-messages')
    .description("Get messages for a conversation (workspace-scoped) — ordered newest first.")
    .option('--conversation-id <value>', "Conversation UUID.")
    .option('--limit <number>', "Max messages to return. Default 50, hard cap 100.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['conversationId'] !== undefined) args['conversationId'] = opts['conversationId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('get_conversation_messages', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-auto-reply-rules')
    .description("List email auto-reply rules — keyed on intent classification with a response template and a min-confidence threshold.")
    .option('--enabled', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['enabled'] !== undefined) args['enabled'] = opts['enabled'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_auto_reply_rules', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-conversations')
    .description("List inbox conversations across platforms (Gmail, WhatsApp, Instagram, Facebook).")
    .option('--unread', "Only return conversations with unread=true.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['unread'] !== undefined) args['unread'] = opts['unread'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_conversations', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-templates')
    .description("List reusable auto-reply rules (DM templates) in the current workspace.")
    .option('--intent-type <value>', "Filter by intent type (e.g. order_status, refund, product_question).")
    .option('--enabled', "Filter by enabled flag.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['intentType'] !== undefined) args['intentType'] = opts['intentType'];
      if (opts['enabled'] !== undefined) args['enabled'] = opts['enabled'];
      const result = await callTool('list_dm_templates', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('send-template')
    .description("Send a DM template to one customer. 30-second undo window — call cancel_pending_action with the returned actionId to abort.")
    .option('--template-id <value>', "")
    .option('--customer-id <value>', "")
    .option('--variables <value>', "Variable values to substitute into the template body.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['templateId'] !== undefined) args['templateId'] = opts['templateId'];
      if (opts['customerId'] !== undefined) args['customerId'] = opts['customerId'];
      if (opts['variables'] !== undefined) args['variables'] = opts['variables'];
      const result = await callTool('send_dm_template', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

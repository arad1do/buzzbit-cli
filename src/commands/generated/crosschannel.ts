// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-17T08:42:26.811Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('crosschannel')
    .description('Auto-generated crosschannel commands. 1 subcommand.');

  group.command('compose cross channel campaign')
    .description("Atomically create coordinated drafts across email + popup + social channels for a single campaign brief. Claude composes each channel\\")
    .option('--brief <value>', "Plain-English summary of the campaign for record-keeping (not used to generate content — Claude composes each channel).")
    .option('--email <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--popup <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--social <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--dm <json>', "Not implemented in v1. Use create_dm_draft separately. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['brief'] !== undefined) args['brief'] = opts['brief'];
      if (opts['email'] !== undefined) args['email'] = opts['email'];
      if (opts['popup'] !== undefined) args['popup'] = opts['popup'];
      if (opts['social'] !== undefined) args['social'] = opts['social'];
      if (opts['dm'] !== undefined) args['dm'] = opts['dm'];
      const result = await callTool('compose_cross_channel_campaign', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

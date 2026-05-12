// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.757Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('drafts')
    .description('Auto-generated drafts commands. 1 subcommand.');

  group.command('delete-draft')
    .description("Delete a draft resource. Campaign/segment use soft-delete (24h via deletedAt); others hard-delete.")
    .option('--resource-type <value>', " (one of: campaign, flow, popup, social_post, segment)")
    .option('--resource-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['resourceType'] !== undefined) args['resourceType'] = opts['resourceType'];
      if (opts['resourceId'] !== undefined) args['resourceId'] = opts['resourceId'];
      const result = await callTool('delete_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

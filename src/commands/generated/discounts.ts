// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T10:21:33.542Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('discounts')
    .description('Auto-generated discounts commands. 1 subcommand.');

  group.command('create-discount-code')
    .description("Create a discount code in this workspace. Returns the created discount with its current status.")
    .option('--code <value>', "Discount code (e.g. ")
    .option('--type <value>', " (one of: PERCENTAGE, FIXED, FREE_SHIPPING)")
    .option('--value <number>', "Percent for PERCENTAGE, currency amount for FIXED, ignored for FREE_SHIPPING.", (v) => Number(v))
    .option('--usage-limit <number>', "Max total redemptions across all customers. Omit for unlimited.", (v) => Number(v))
    .option('--min-purchase <number>', "Minimum cart total for the code to apply.", (v) => Number(v))
    .option('--starts-at <value>', "")
    .option('--expires-at <value>', "")
    .option('--requires-approval', "If true, code is created in PENDING_APPROVAL status.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['code'] !== undefined) args['code'] = opts['code'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['value'] !== undefined) args['value'] = opts['value'];
      if (opts['usageLimit'] !== undefined) args['usageLimit'] = opts['usageLimit'];
      if (opts['minPurchase'] !== undefined) args['minPurchase'] = opts['minPurchase'];
      if (opts['startsAt'] !== undefined) args['startsAt'] = opts['startsAt'];
      if (opts['expiresAt'] !== undefined) args['expiresAt'] = opts['expiresAt'];
      if (opts['requiresApproval'] !== undefined) args['requiresApproval'] = opts['requiresApproval'];
      const result = await callTool('create_discount_code', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

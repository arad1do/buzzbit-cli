/**
 * `bbx discounts` — create discount code.
 *
 * No list/get yet (MCP tools for those don't exist). When they ship in a
 * future BuzzBit release, add them here without touching the rest of the
 * CLI — the dispatcher in index.ts picks up new command files.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildCreateCommand(): Command {
  return new Command('create')
    .description('Create a discount code (also pushed to Shopify if connected)')
    .requiredOption('--code <code>', 'Code merchants will enter at checkout (e.g. WELCOME10)')
    .requiredOption('--type <type>', 'percentage | fixed | free_shipping')
    .option('--value <n>', 'Discount value (percent or currency amount)')
    .option('--expires-at <iso>', 'ISO 8601 expiration datetime')
    .option('--usage-limit <n>', 'Max total uses')
    .option('--per-customer <n>', 'Max uses per customer')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      code: string;
      type: string;
      value?: string;
      expiresAt?: string;
      usageLimit?: string;
      perCustomer?: string;
      format?: string;
    }) => {
      const args: Record<string, unknown> = {
        code: opts.code,
        type: opts.type,
      };
      if (opts.value !== undefined) {
        const v = parseFloat(opts.value);
        if (Number.isNaN(v)) throw new ValidationError('--value must be a number');
        args.value = v;
      }
      if (opts.expiresAt) args.expiresAt = opts.expiresAt;
      if (opts.usageLimit) args.usageLimit = parseInt(opts.usageLimit, 10);
      if (opts.perCustomer) args.perCustomerLimit = parseInt(opts.perCustomer, 10);
      const result = await callTool('create_discount_code', args);
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildDiscountsCommand(): Command {
  return new Command('discounts')
    .description('Create discount codes')
    .addCommand(buildCreateCommand());
}

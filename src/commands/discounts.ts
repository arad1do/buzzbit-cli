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

// Server accepts these case-insensitively (z.preprocess) but we still send
// the canonical uppercase form so a user running an older server (before
// the case-insensitive preprocess shipped) doesn't see a confusing reject.
const CANONICAL_DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'] as const;
type CanonicalType = (typeof CANONICAL_DISCOUNT_TYPES)[number];

function buildCreateCommand(): Command {
  return new Command('create')
    .description('Create a discount code (also pushed to Shopify if connected)')
    .requiredOption('--code <code>', 'Code merchants will enter at checkout (e.g. WELCOME10)')
    .requiredOption(
      '--type <type>',
      'PERCENTAGE | FIXED | FREE_SHIPPING (case-insensitive — "percentage", "fixed", "free_shipping" also accepted)',
    )
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
      const normalizedType = opts.type.toUpperCase() as CanonicalType;
      if (!CANONICAL_DISCOUNT_TYPES.includes(normalizedType)) {
        throw new ValidationError(
          `--type must be one of ${CANONICAL_DISCOUNT_TYPES.join(', ')} (case-insensitive). Got '${opts.type}'.`,
        );
      }
      const args: Record<string, unknown> = {
        code: opts.code,
        type: normalizedType,
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

/**
 * `bbx popups` — list, performance, create-draft, update-draft.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const POPUP_TABLE_COLS = ['id', 'name', 'trigger', 'status', 'conversionRate', 'updatedAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List popups in the active workspace')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const result = await callTool('list_popups', { limit });
      printResult(result, { format: parseFormat(opts.format), columns: POPUP_TABLE_COLS });
    });
}

function buildPerformanceCommand(): Command {
  return new Command('performance')
    .description('Conversion / impression metrics for a popup')
    .argument('<id>', 'Popup id')
    .option('--period <period>', 'last_7_days | last_30_days | last_90_days', 'last_30_days')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { period?: string; format?: string }) => {
      if (!id) throw new ValidationError('Popup id required');
      const result = await callTool('get_popup_performance', {
        popupId: id,
        period: opts.period ?? 'last_30_days',
      });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildCreateDraftCommand(): Command {
  return new Command('create-draft')
    .description('Create a new popup draft')
    .requiredOption('--name <name>', 'Internal popup name')
    .requiredOption('--trigger <trigger>', 'exit_intent | scroll_50 | time_5s | time_30s')
    .option('--headline <text>', 'Headline text')
    .option('--body <text>', 'Body text')
    .option('--cta <text>', 'Call-to-action button text', 'Get 10% off')
    .option('--discount-code <code>', 'Discount code to issue on submit')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      name: string;
      trigger: string;
      headline?: string;
      body?: string;
      cta?: string;
      discountCode?: string;
      format?: string;
    }) => {
      const args: Record<string, unknown> = {
        name: opts.name,
        trigger: opts.trigger,
        cta: opts.cta ?? 'Get 10% off',
      };
      if (opts.headline) args.headline = opts.headline;
      if (opts.body) args.body = opts.body;
      if (opts.discountCode) args.discountCode = opts.discountCode;
      const result = await callTool('create_popup_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateDraftCommand(): Command {
  return new Command('update-draft')
    .description('Update an existing popup draft')
    .argument('<id>', 'Popup id')
    .option('--name <name>', 'Internal popup name')
    .option('--headline <text>', 'Headline text')
    .option('--body <text>', 'Body text')
    .option('--cta <text>', 'Call-to-action button text')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { name?: string; headline?: string; body?: string; cta?: string; format?: string }) => {
      if (!id) throw new ValidationError('Popup id required');
      const args: Record<string, unknown> = { popupId: id };
      if (opts.name) args.name = opts.name;
      if (opts.headline) args.headline = opts.headline;
      if (opts.body) args.body = opts.body;
      if (opts.cta) args.cta = opts.cta;
      const result = await callTool('update_popup_draft', args);
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildPopupsCommand(): Command {
  return new Command('popups')
    .description('Manage popups (signup, exit-intent, etc.)')
    .addCommand(buildListCommand())
    .addCommand(buildPerformanceCommand())
    .addCommand(buildCreateDraftCommand())
    .addCommand(buildUpdateDraftCommand());
}

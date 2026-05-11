/**
 * `bbx boards` — list, get, items, create-item, update-cell.
 *
 * The CRM/Business Hub module. Boards are Monday-style: rows are items,
 * cells are stored separately per (item × column).
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const BOARD_COLS = ['id', 'name', 'kind', 'updatedAt'];

function buildListCommand(): Command {
  return new Command('list')
    .description('List boards in the active workspace')
    .option('--kind <kind>', 'CUSTOM | ECOM_CONTACTS | ECOM_INVENTORY | ECOM_ORDERS | …')
    .option('-l, --limit <n>', 'Max rows', '50')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { kind?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.kind) args.kind = opts.kind;
      const result = await callTool('list_boards', args);
      printResult(result, { format: parseFormat(opts.format), columns: BOARD_COLS });
    });
}

function buildGetCommand(): Command {
  return new Command('get')
    .description('Get one board (columns, groups, counts)')
    .argument('<id>', 'Board id')
    .option('--format <format>', 'table | json', 'json')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Board id required');
      const result = await callTool('get_board', { boardId: id });
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

function buildItemsCommand(): Command {
  return new Command('items')
    .description('List items (rows) on a board')
    .argument('<boardId>', 'Board id')
    .option('--group <id>', 'Filter to one group')
    .option('-l, --limit <n>', 'Max rows', '50')
    .option('-c, --cursor <id>', 'Pagination cursor (item id)')
    .option('--format <format>', 'table | json | csv', 'json')
    .action(async (boardId: string, opts: { group?: string; limit?: string; cursor?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 200);
      const args: Record<string, unknown> = { boardId, limit };
      if (opts.group) args.groupId = opts.group;
      if (opts.cursor) args.cursor = opts.cursor;
      const result = await callTool('list_board_items', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });
}

function buildCreateItemCommand(): Command {
  return new Command('create-item')
    .description('Create a new row on a board')
    .requiredOption('--board <id>', 'Board id')
    .option('--group <id>', 'Group id (column groups)')
    .option('--cells <json>', 'JSON object: { "<columnId>": <value>, ... }')
    .option('--position <n>', 'Insert position', '0')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { board: string; group?: string; cells?: string; position?: string; format?: string }) => {
      const args: Record<string, unknown> = { boardId: opts.board, position: parseInt(opts.position ?? '0', 10) || 0 };
      if (opts.group) args.groupId = opts.group;
      if (opts.cells) {
        try {
          args.cells = JSON.parse(opts.cells);
        } catch (err) {
          throw new ValidationError(`--cells must be valid JSON: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      const result = await callTool('create_board_item', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateCellCommand(): Command {
  return new Command('update-cell')
    .description('Set one cell value on a board item')
    .requiredOption('--item <id>', 'Item id')
    .requiredOption('--column <id>', 'Column id')
    .requiredOption('--value <json>', 'JSON-encoded value')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { item: string; column: string; value: string; format?: string }) => {
      let value: unknown;
      try {
        value = JSON.parse(opts.value);
      } catch (err) {
        throw new ValidationError(`--value must be valid JSON: ${err instanceof Error ? err.message : String(err)}`);
      }
      const result = await callTool('update_board_item_cell', {
        itemId: opts.item,
        columnId: opts.column,
        value,
      });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildViewsCommand(): Command {
  return new Command('views')
    .description('List views on a board (table/kanban/calendar/timeline/dashboard)')
    .argument('<boardId>')
    .option('--type <type>', 'TABLE | KANBAN | CALENDAR | TIMELINE | DASHBOARD')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (boardId: string, opts: { type?: string; format?: string }) => {
      const args: Record<string, unknown> = { boardId };
      if (opts.type) args.viewType = opts.type;
      const result = await callTool('list_board_views', args);
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildWidgetsCommand(): Command {
  return new Command('widgets')
    .description('List widgets on a board (or in a specific view)')
    .argument('<boardId>')
    .option('--view <id>')
    .option('--type <type>', 'COUNT | SUM | AVERAGE | PIE | BAR')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (boardId: string, opts: { view?: string; type?: string; format?: string }) => {
      const args: Record<string, unknown> = { boardId };
      if (opts.view) args.viewId = opts.view;
      if (opts.type) args.widgetType = opts.type;
      const result = await callTool('list_board_widgets', args);
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildAutomationsCommand(): Command {
  return new Command('automations')
    .description('List + create rule-based board automations')
    .addCommand(
      new Command('list')
        .description('List automations for a board (or workspace-wide)')
        .option('--board <id>')
        .option('--enabled-only')
        .option('--format <format>', 'table | json | csv', 'table')
        .action(async (opts: { board?: string; enabledOnly?: boolean; format?: string }) => {
          const args: Record<string, unknown> = {};
          if (opts.board) args.boardId = opts.board;
          if (opts.enabledOnly) args.enabledOnly = true;
          const result = await callTool('list_board_automations', args);
          printResult(result, { format: parseFormat(opts.format) });
        }),
    )
    .addCommand(
      new Command('create')
        .description('Create a board automation rule')
        .requiredOption('--name <name>')
        .option('--board <id>')
        .requiredOption('--trigger <json>', 'JSON trigger config')
        .requiredOption('--actions <json>', 'JSON actions array')
        .option('--disabled', 'Create as disabled')
        .option('--format <format>', 'table | json', 'table')
        .action(async (opts: { name: string; board?: string; trigger: string; actions: string; disabled?: boolean; format?: string }) => {
          let trigger: unknown;
          let actions: unknown;
          try {
            trigger = JSON.parse(opts.trigger);
            actions = JSON.parse(opts.actions);
          } catch (err) {
            throw new ValidationError(`--trigger and --actions must be valid JSON: ${err instanceof Error ? err.message : String(err)}`);
          }
          const args: Record<string, unknown> = { name: opts.name, trigger, actions };
          if (opts.board) args.boardId = opts.board;
          if (opts.disabled) args.enabled = false;
          const result = await callTool('create_board_automation', args);
          printRecord(result, parseFormat(opts.format));
        }),
    );
}

function buildDeleteItemCommand(): Command {
  return new Command('delete-item')
    .description('Soft-delete a board item (30s undo)')
    .argument('<itemId>')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (itemId: string, opts: { confirm?: boolean; format?: string }) => {
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(`About to delete board item ${itemId}. Re-run with --confirm.\n`);
        return;
      }
      const result = await callTool('delete_board_item', { itemId });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildBoardsCommand(): Command {
  return new Command('boards')
    .description('CRM / Business Hub boards (Monday-style)')
    .addCommand(buildListCommand())
    .addCommand(buildGetCommand())
    .addCommand(buildItemsCommand())
    .addCommand(buildCreateItemCommand())
    .addCommand(buildUpdateCellCommand())
    .addCommand(buildViewsCommand())
    .addCommand(buildWidgetsCommand())
    .addCommand(buildAutomationsCommand())
    .addCommand(buildDeleteItemCommand());
}

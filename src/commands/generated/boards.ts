// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.749Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('boards')
    .description('Auto-generated boards commands. 10 subcommands.');

  group.command('create-board-automation')
    .description("Create a rule-based board automation: trigger (item activity filter) → actions (side effects). Defaults to enabled. Refer to existing BoardAutomation rows via list_board_automations for the exact trigger/actions JSON shape.")
    .option('--name <value>', "")
    .option('--board-id <value>', "Optional — leave blank for workspace-wide automations.")
    .option('--trigger <json>', "Trigger config JSON (event filter shape from the rule engine). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--actions <json>', "Actions JSON array (each action has its own shape). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--enabled', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['trigger'] !== undefined) args['trigger'] = opts['trigger'];
      if (opts['actions'] !== undefined) args['actions'] = opts['actions'];
      if (opts['enabled'] !== undefined) args['enabled'] = opts['enabled'];
      const result = await callTool('create_board_automation', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('create-board-item')
    .description("Create a new row on a board. Optionally seed initial cell values by passing { cells: {")
    .option('--board-id <value>', "")
    .option('--group-id <value>', "")
    .option('--cells <value>', "Map of columnId → value to seed initial cells.")
    .option('--position <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['groupId'] !== undefined) args['groupId'] = opts['groupId'];
      if (opts['cells'] !== undefined) args['cells'] = opts['cells'];
      if (opts['position'] !== undefined) args['position'] = opts['position'];
      const result = await callTool('create_board_item', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('delete-board-item')
    .description("Soft-delete a board item (sets deletedAt). 30-second undo window — call cancel_pending_action with the returned actionId to abort. The item is recoverable from the boards UI within 24h.")
    .option('--item-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['itemId'] !== undefined) args['itemId'] = opts['itemId'];
      const result = await callTool('delete_board_item', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-board')
    .description("Get one board\\")
    .option('--board-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      const result = await callTool('get_board', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-board-automations')
    .description("List rule-based BoardAutomation entries (trigger → actions reacting to item activity).")
    .option('--board-id <value>', "Optional — restrict to one board. Omit for workspace-wide automations.")
    .option('--enabled-only', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['enabledOnly'] !== undefined) args['enabledOnly'] = opts['enabledOnly'];
      const result = await callTool('list_board_automations', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-board-items')
    .description("List items (rows) on a board with their cell values. Workspace + board scoped. Paginated, hard max 200.")
    .option('--board-id <value>', "")
    .option('--group-id <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--cursor <value>', "Item id to paginate after (cursor-based).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['groupId'] !== undefined) args['groupId'] = opts['groupId'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      if (opts['cursor'] !== undefined) args['cursor'] = opts['cursor'];
      const result = await callTool('list_board_items', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List Business Hub / CRM boards (Monday/Airtable-style). Includes system boards (Contacts, Inventory, Orders, etc.) and any custom boards the workspace has created.")
    .option('--kind <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['kind'] !== undefined) args['kind'] = opts['kind'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_boards', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-board-views')
    .description("List saved views (table / kanban / calendar / timeline / dashboard) for a board.")
    .option('--board-id <value>', "")
    .option('--view-type <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['viewType'] !== undefined) args['viewType'] = opts['viewType'];
      const result = await callTool('list_board_views', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-board-widgets')
    .description("List widgets (count / sum / average / pie / bar) on a board or in a specific view.")
    .option('--board-id <value>', "")
    .option('--view-id <value>', "")
    .option('--widget-type <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['boardId'] !== undefined) args['boardId'] = opts['boardId'];
      if (opts['viewId'] !== undefined) args['viewId'] = opts['viewId'];
      if (opts['widgetType'] !== undefined) args['widgetType'] = opts['widgetType'];
      const result = await callTool('list_board_widgets', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-board-item-cell')
    .description("Set the value of one cell on a board item. Creates the cell if it does not yet exist. Use list_board_items to discover column ids.")
    .option('--item-id <value>', "")
    .option('--column-id <value>', "")
    .option('--value <json>', "Cell value — shape depends on the column type. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['itemId'] !== undefined) args['itemId'] = opts['itemId'];
      if (opts['columnId'] !== undefined) args['columnId'] = opts['columnId'];
      if (opts['value'] !== undefined) args['value'] = opts['value'];
      const result = await callTool('update_board_item_cell', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

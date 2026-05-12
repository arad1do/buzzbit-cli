// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T10:21:33.549Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('popups')
    .description('Auto-generated popups commands. 4 subcommands.');

  group.command('create-popup-draft')
    .description("Create a popup in DRAFT status with design/content/triggers/targeting.")
    .option('--name <value>', "")
    .option('--type <value>', "e.g. POPUP, BAR, SLIDE_IN. Default: POPUP.")
    .option('--design <json>', "Visual design configuration (JSON). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--content <json>', "Body content (headline/subhead/CTA — JSON). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--triggers <json>', "Trigger rules (exit-intent, scroll %, time-on-page). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--targeting <json>', "Audience targeting (URL match, device, etc.). (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['design'] !== undefined) args['design'] = opts['design'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['triggers'] !== undefined) args['triggers'] = opts['triggers'];
      if (opts['targeting'] !== undefined) args['targeting'] = opts['targeting'];
      const result = await callTool('create_popup_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-popup-performance')
    .description("Get a popup\\")
    .option('--popup-id <value>', "Popup UUID.")
    .option('--days <number>', "Window. Default: 30.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['popupId'] !== undefined) args['popupId'] = opts['popupId'];
      if (opts['days'] !== undefined) args['days'] = opts['days'];
      const result = await callTool('get_popup_performance', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List popups in the current workspace.")
    .option('--status <value>', "Filter by popup status (DRAFT, ACTIVE, etc.).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      const result = await callTool('list_popups', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-popup-draft')
    .description("Update a popup\\")
    .option('--popup-id <value>', "")
    .option('--name <value>', "")
    .option('--type <value>', "")
    .option('--status <value>', "e.g. DRAFT, ACTIVE, PAUSED.")
    .option('--design <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--content <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--triggers <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--targeting <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['popupId'] !== undefined) args['popupId'] = opts['popupId'];
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['type'] !== undefined) args['type'] = opts['type'];
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['design'] !== undefined) args['design'] = opts['design'];
      if (opts['content'] !== undefined) args['content'] = opts['content'];
      if (opts['triggers'] !== undefined) args['triggers'] = opts['triggers'];
      if (opts['targeting'] !== undefined) args['targeting'] = opts['targeting'];
      const result = await callTool('update_popup_draft', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

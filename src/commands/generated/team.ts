// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.761Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('team')
    .description('Auto-generated team commands. 5 subcommands.');

  group.command('invite-member')
    .description("Invite a new member to the workspace by email. Defaults to VIEWER role. Returns the invitation id + token; the actual email dispatch is best-effort and may be retried via the dashboard.")
    .option('--email <value>', "")
    .option('--role <value>', "OWNER | ADMIN | EDITOR | VIEWER. Defaults to VIEWER.")
    .option('--custom-role-id <value>', "Optional CustomRole id to assign instead of (or alongside) the base role.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['email'] !== undefined) args['email'] = opts['email'];
      if (opts['role'] !== undefined) args['role'] = opts['role'];
      if (opts['customRoleId'] !== undefined) args['customRoleId'] = opts['customRoleId'];
      const result = await callTool('invite_team_member', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-roles-and-permissions')
    .description("Catalog of available roles + permissions for the workspace. Includes built-in MemberRole values with their default permission sets, all CustomRole rows in this workspace, and the full Permission enum.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('list_roles_and_permissions', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-members')
    .description("List members of the active workspace with role, status, custom role, and last login. Use to audit who has access or to find a target before changing role.")
    .option('--status <value>', "ACTIVE | INVITED. Default returns both.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_team_members', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('remove-member')
    .description("Remove a member from the workspace. 30-second undo window — call cancel_pending_action with the returned actionId to abort. Refuses to remove the sole OWNER.")
    .option('--member-id <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['memberId'] !== undefined) args['memberId'] = opts['memberId'];
      const result = await callTool('remove_team_member', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-member-role')
    .description("Update a workspace member\\")
    .option('--member-id <value>', "")
    .option('--role <value>', "Optional new base role.")
    .option('--custom-role-id <value>', "Optional CustomRole id. Pass null to clear the custom role assignment.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['memberId'] !== undefined) args['memberId'] = opts['memberId'];
      if (opts['role'] !== undefined) args['role'] = opts['role'];
      if (opts['customRoleId'] !== undefined) args['customRoleId'] = opts['customRoleId'];
      const result = await callTool('update_member_role', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}

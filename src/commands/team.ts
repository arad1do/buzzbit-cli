/**
 * `bbx team` — list, invite, update-role, remove, roles.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildListCommand(): Command {
  return new Command('list')
    .description('List workspace members')
    .option('-s, --status <status>', 'ACTIVE | INVITED')
    .option('-l, --limit <n>', 'Max rows', '50')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { status?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '50', 10) || 50, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_team_members', args);
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildInviteCommand(): Command {
  return new Command('invite')
    .description('Invite a new member by email')
    .requiredOption('--email <email>')
    .option('--role <role>', 'OWNER | ADMIN | EDITOR | VIEWER', 'VIEWER')
    .option('--custom-role <id>', 'Optional CustomRole id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { email: string; role?: string; customRole?: string; format?: string }) => {
      const args: Record<string, unknown> = { email: opts.email };
      if (opts.role) args.role = opts.role;
      if (opts.customRole) args.customRoleId = opts.customRole;
      const result = await callTool('invite_team_member', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateRoleCommand(): Command {
  return new Command('update-role')
    .description('Update a member\'s role assignment')
    .requiredOption('--member <id>')
    .option('--role <role>', 'OWNER | ADMIN | EDITOR | VIEWER')
    .option('--custom-role <id>', 'CustomRole id (or "none" to clear)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { member: string; role?: string; customRole?: string; format?: string }) => {
      const args: Record<string, unknown> = { memberId: opts.member };
      if (opts.role) args.role = opts.role;
      if (opts.customRole !== undefined) {
        args.customRoleId = opts.customRole === 'none' ? null : opts.customRole;
      }
      const result = await callTool('update_member_role', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildRemoveCommand(): Command {
  return new Command('remove')
    .description('Remove a member (30s undo window)')
    .requiredOption('--member <id>')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { member: string; confirm?: boolean; format?: string }) => {
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(`About to remove member ${opts.member}. Re-run with --confirm.\n`);
        return;
      }
      const result = await callTool('remove_team_member', { memberId: opts.member });
      printRecord(result, parseFormat(opts.format));
    });
}

function buildRolesCommand(): Command {
  return new Command('roles')
    .description('List the role + permission catalog for this workspace')
    .option('--format <format>', 'table | json', 'json')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('list_roles_and_permissions');
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

export function buildTeamCommand(): Command {
  return new Command('team')
    .description('Manage workspace members and roles')
    .addCommand(buildListCommand())
    .addCommand(buildInviteCommand())
    .addCommand(buildUpdateRoleCommand())
    .addCommand(buildRemoveCommand())
    .addCommand(buildRolesCommand());
}

void ValidationError;

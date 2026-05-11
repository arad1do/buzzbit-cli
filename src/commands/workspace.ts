/**
 * `bbx workspace` — workspace-level read tools.
 *
 *   brand   — get_workspace_brand
 *   limits  — get_workspace_limits (mirrored from `bbx metrics limits`)
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';

function buildBrandCommand(): Command {
  return new Command('brand')
    .description('Get brand settings (colors, voice, tone) for the active workspace')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_workspace_brand');
      printRecord(result, parseFormat(opts.format));
    });
}

function buildLimitsCommand(): Command {
  return new Command('limits')
    .description('Subscription tier + current quota usage')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_workspace_limits');
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildWorkspaceCommand(): Command {
  return new Command('workspace')
    .description('Workspace metadata (brand, limits)')
    .addCommand(buildBrandCommand())
    .addCommand(buildLimitsCommand());
}

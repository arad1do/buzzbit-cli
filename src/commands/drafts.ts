/**
 * `bbx drafts delete` — soft-delete a draft (campaign / flow / popup / social).
 *
 * Wraps `delete_draft` which is a 24h soft-delete on the server. Within
 * the window the draft can be restored via the dashboard.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

function buildDeleteCommand(): Command {
  return new Command('delete')
    .description('Soft-delete a draft (24h restore window on the server)')
    .requiredOption('--type <type>', 'campaign | flow | popup | social | dm | segment')
    .requiredOption('--id <id>', 'Draft id')
    .option('--confirm', 'Skip the interactive prompt')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { type: string; id: string; confirm?: boolean; format?: string }) => {
      if (!opts.confirm && process.stdout.isTTY) {
        process.stderr.write(
          `About to delete ${opts.type} draft ${opts.id}. Re-run with --confirm.\n`,
        );
        return;
      }
      const result = await callTool('delete_draft', {
        draftType: opts.type,
        draftId: opts.id,
      });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildDraftsCommand(): Command {
  return new Command('drafts')
    .description('Manage draft lifecycle across all draftable types')
    .addCommand(buildDeleteCommand());
}

// Validate exported draft types — used inside delete validation in future
// if we add a `bbx drafts list` that has to filter by type.
export const VALID_DRAFT_TYPES = ['campaign', 'flow', 'popup', 'social', 'dm', 'segment'] as const;

export function isValidDraftType(value: string): boolean {
  return (VALID_DRAFT_TYPES as ReadonlyArray<string>).includes(value);
}

// Re-export to suppress unused warning when other commands import only the
// builder. (Keeping the helper exports is intentional for future commands.)
void isValidDraftType;
void ValidationError;

#!/usr/bin/env node
/**
 * bbx — BuzzBit X CLI entry point.
 *
 * Wires every command group under the root `bbx` program. Each command
 * file exports a `build<Name>Command(): Command` function so adding a new
 * command means: drop a file in commands/, import it, addCommand once.
 *
 * Errors thrown anywhere in the command tree are caught here, printed
 * with their CliError code, and used to set the process exit code.
 */

import { Command } from 'commander';
import { buildAuthCommand } from './commands/auth.js';
import { buildCustomersCommand } from './commands/customers.js';
import { buildOrdersCommand } from './commands/orders.js';
import { buildProductsCommand } from './commands/products.js';
import { buildFlowsCommand } from './commands/flows.js';
import { buildCampaignsCommand } from './commands/campaigns.js';
import { buildSocialCommand } from './commands/social.js';
import { buildInboxCommand } from './commands/inbox.js';
import { buildDiscountsCommand } from './commands/discounts.js';
import { buildMetricsCommand } from './commands/metrics.js';
import { buildReportCommandTree } from './commands/report.js';
import { buildToolsCommand } from './commands/tools.js';
import { buildSkillsCommand } from './commands/skills.js';
import { CliError } from './lib/errors.js';

const VERSION = '0.1.0';

function buildProgram(): Command {
  const program = new Command();
  program
    .name('bbx')
    .description('BuzzBit X command-line interface (MCP-backed).')
    .version(VERSION);

  program.addCommand(buildAuthCommand());
  program.addCommand(buildCustomersCommand());
  program.addCommand(buildOrdersCommand());
  program.addCommand(buildProductsCommand());
  program.addCommand(buildFlowsCommand());
  program.addCommand(buildCampaignsCommand());
  program.addCommand(buildSocialCommand());
  program.addCommand(buildInboxCommand());
  program.addCommand(buildDiscountsCommand());
  program.addCommand(buildMetricsCommand());
  program.addCommand(buildReportCommandTree());
  program.addCommand(buildToolsCommand());
  program.addCommand(buildSkillsCommand());

  return program;
}

async function main(): Promise<void> {
  const program = buildProgram();
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err instanceof CliError) {
      process.stderr.write(`error: ${err.message}\n`);
      process.exit(err.exitCode);
    }
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error: ${msg}\n`);
    process.exit(1);
  }
}

void main();

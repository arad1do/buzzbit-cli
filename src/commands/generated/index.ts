// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-15T11:28:32.579Z
//
// The auto-generated commands live under a single `bbx mcp` namespace so
// they don't collide with the hand-tuned commands at the top level. Use
// the manual wrappers (e.g. `bbx customers list`) for everyday work and
// the generated ones (`bbx mcp customers list-customers`) for direct
// MCP-tool calls or when a hand-tuned wrapper doesn't exist yet.

import { Command } from 'commander';
import { buildGeneratedCommand as buildGenerated_ads } from './ads.js';
import { buildGeneratedCommand as buildGenerated_analytics } from './analytics.js';
import { buildGeneratedCommand as buildGenerated_billing } from './billing.js';
import { buildGeneratedCommand as buildGenerated_boards } from './boards.js';
import { buildGeneratedCommand as buildGenerated_broadcasts } from './broadcasts.js';
import { buildGeneratedCommand as buildGenerated_campaigns } from './campaigns.js';
import { buildGeneratedCommand as buildGenerated_chatflows } from './chatflows.js';
import { buildGeneratedCommand as buildGenerated_content } from './content.js';
import { buildGeneratedCommand as buildGenerated_coo } from './coo.js';
import { buildGeneratedCommand as buildGenerated_crosschannel } from './crosschannel.js';
import { buildGeneratedCommand as buildGenerated_customers } from './customers.js';
import { buildGeneratedCommand as buildGenerated_discounts } from './discounts.js';
import { buildGeneratedCommand as buildGenerated_dm } from './dm.js';
import { buildGeneratedCommand as buildGenerated_drafts } from './drafts.js';
import { buildGeneratedCommand as buildGenerated_finance } from './finance.js';
import { buildGeneratedCommand as buildGenerated_flows } from './flows.js';
import { buildGeneratedCommand as buildGenerated_integrations } from './integrations.js';
import { buildGeneratedCommand as buildGenerated_orders } from './orders.js';
import { buildGeneratedCommand as buildGenerated_popups } from './popups.js';
import { buildGeneratedCommand as buildGenerated_products } from './products.js';
import { buildGeneratedCommand as buildGenerated_segments } from './segments.js';
import { buildGeneratedCommand as buildGenerated_social } from './social.js';
import { buildGeneratedCommand as buildGenerated_support } from './support.js';
import { buildGeneratedCommand as buildGenerated_team } from './team.js';
import { buildGeneratedCommand as buildGenerated_webhooks } from './webhooks.js';
import { buildGeneratedCommand as buildGenerated_workspace } from './workspace.js';

export function buildMcpCommand(): Command {
  const mcp = new Command('mcp')
    .description('Direct MCP-tool invocation. Auto-generated from the live MCP registry — every server-side tool is reachable here.');
  mcp.addCommand(buildGenerated_ads());
  mcp.addCommand(buildGenerated_analytics());
  mcp.addCommand(buildGenerated_billing());
  mcp.addCommand(buildGenerated_boards());
  mcp.addCommand(buildGenerated_broadcasts());
  mcp.addCommand(buildGenerated_campaigns());
  mcp.addCommand(buildGenerated_chatflows());
  mcp.addCommand(buildGenerated_content());
  mcp.addCommand(buildGenerated_coo());
  mcp.addCommand(buildGenerated_crosschannel());
  mcp.addCommand(buildGenerated_customers());
  mcp.addCommand(buildGenerated_discounts());
  mcp.addCommand(buildGenerated_dm());
  mcp.addCommand(buildGenerated_drafts());
  mcp.addCommand(buildGenerated_finance());
  mcp.addCommand(buildGenerated_flows());
  mcp.addCommand(buildGenerated_integrations());
  mcp.addCommand(buildGenerated_orders());
  mcp.addCommand(buildGenerated_popups());
  mcp.addCommand(buildGenerated_products());
  mcp.addCommand(buildGenerated_segments());
  mcp.addCommand(buildGenerated_social());
  mcp.addCommand(buildGenerated_support());
  mcp.addCommand(buildGenerated_team());
  mcp.addCommand(buildGenerated_webhooks());
  mcp.addCommand(buildGenerated_workspace());
  return mcp;
}

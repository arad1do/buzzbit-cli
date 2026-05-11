/**
 * `bbx report` — compose a daily / weekly multi-section snapshot.
 *
 * This is a CLIENT-SIDE composition that fans out to several read tools
 * in parallel and renders one combined report. The user can pipe it into
 * email, Slack, or a markdown file:
 *
 *   bbx report --period=last_7_days > report.md
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { CliError } from '../lib/errors.js';

interface CallResult<T> {
  status: 'ok' | 'err';
  data?: T;
  message?: string;
}

async function safeCall<T>(toolName: string, args: Record<string, unknown> = {}): Promise<CallResult<T>> {
  try {
    const data = await callTool<T>(toolName, args);
    return { status: 'ok', data };
  } catch (err) {
    return { status: 'err', message: err instanceof Error ? err.message : String(err) };
  }
}

function formatSection<T>(title: string, result: CallResult<T>): string {
  const header = `\n## ${title}\n`;
  if (result.status === 'err') {
    return header + `_unavailable: ${result.message}_\n`;
  }
  return header + '```json\n' + JSON.stringify(result.data, null, 2) + '\n```\n';
}

function buildReportCommand(): Command {
  return new Command('report')
    .description('Multi-section snapshot of the workspace (markdown)')
    .option('--period <period>', 'last_7_days | last_30_days', 'last_7_days')
    .option('--include <sections>', 'Comma-separated: overview,revenue,growth,top-products,campaigns,flows,social', 'overview,revenue,growth,top-products')
    .action(async (opts: { period?: string; include?: string }) => {
      const period = opts.period ?? 'last_7_days';
      const sections = (opts.include ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      if (sections.length === 0) throw new CliError('No sections selected');

      const tasks: Array<Promise<{ title: string; result: CallResult<unknown> }>> = [];
      const want = new Set(sections);

      if (want.has('overview')) {
        tasks.push(
          safeCall('get_dashboard_overview').then((r) => ({ title: 'Overview', result: r })),
        );
      }
      if (want.has('revenue')) {
        tasks.push(
          safeCall('get_revenue_stats', { period }).then((r) => ({ title: 'Revenue', result: r })),
        );
      }
      if (want.has('growth')) {
        tasks.push(
          safeCall('get_growth_metrics', { period }).then((r) => ({ title: 'Growth', result: r })),
        );
      }
      if (want.has('top-products')) {
        tasks.push(
          safeCall('list_products', { limit: 10 }).then((r) => ({ title: 'Recent products', result: r })),
        );
      }
      if (want.has('campaigns')) {
        tasks.push(
          safeCall('list_campaigns', { limit: 10 }).then((r) => ({ title: 'Recent campaigns', result: r })),
        );
      }
      if (want.has('flows')) {
        tasks.push(
          safeCall('list_flows', { limit: 10 }).then((r) => ({ title: 'Active flows', result: r })),
        );
      }
      if (want.has('social')) {
        tasks.push(
          safeCall('get_social_performance', { period }).then((r) => ({ title: 'Social performance', result: r })),
        );
      }

      const sectionsOut = await Promise.all(tasks);
      const generated = new Date().toISOString();
      const out =
        `# BuzzBit X report — ${period}\n\n_Generated ${generated}_\n` +
        sectionsOut.map((s) => formatSection(s.title, s.result)).join('');
      process.stdout.write(out + '\n');
    });
}

export function buildReportCommandTree(): Command {
  return buildReportCommand();
}

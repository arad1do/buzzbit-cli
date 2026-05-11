# @buzzbitx/cli — `bbx`

Command-line interface for [BuzzBit X](https://buzzbitx.com) over the Model Context Protocol.

Every command wraps a `tools/call` against `https://api.buzzbitx.com/mcp` using your `bz_live_…` API key, so the CLI gets new capabilities the moment they ship on the server.

## Install

```bash
npm install -g @buzzbitx/cli
bbx --version
```

Node 18+ required.

## Authenticate

Generate a key at `https://buzzbitx.com/settings/integrations` → Claude card → **Keys** tab → **Generate**.

```bash
bbx auth login --key=bz_live_xxxxxxxxxxxxxxxxxxxx
bbx auth status
```

The key is saved to `~/.buzzbit/config.json` with mode 0600.

### Multi-workspace (Agency)

```bash
bbx auth login --label=client-a --key=bz_live_aaa…
bbx auth login --label=client-b --key=bz_live_bbb…
bbx auth list
bbx auth use client-a
bbx customers list           # runs against client-a
```

You can also override per-invocation via env: `BBX_API_KEY=bz_live_… bbx customers list`.

## What's in v0.1

| Group | Commands |
|---|---|
| `bbx auth` | `login`, `logout`, `status`, `use`, `list` |
| `bbx customers` | `list`, `get`, `search`, `tag` |
| `bbx orders` | `list`, `get` |
| `bbx products` | `list`, `get`, `performance` |
| `bbx flows` | `list`, `performance`, `activate`, `cancel` |
| `bbx campaigns` | `list`, `metrics`, `send` |
| `bbx social` | `list`, `performance`, `publish` |
| `bbx inbox` | `list`, `show`, `templates`, `send-template` |
| `bbx discounts` | `create` |
| `bbx metrics` | `overview`, `revenue`, `growth`, `limits` |
| `bbx report` | (composes overview + revenue + growth + top products into markdown) |
| `bbx tools` | `list`, `describe` |
| `bbx skills` | `list`, `upload`, `delete` (Agency tier) |

## Output formats

Every list command supports `--format=table|json|csv`. Pipe `json` to `jq`, `csv` to your spreadsheet.

```bash
bbx customers list --format=json --limit=100 | jq '.customers[] | .email'
bbx orders list --status=paid --format=csv > paid_orders.csv
bbx report --period=last_7_days --include=overview,revenue,growth > weekly.md
```

## Send-like commands

`bbx campaigns send`, `bbx social publish`, `bbx inbox send-template` all require either an interactive `--confirm` flag or running in a non-TTY (CI) context. They submit through the 30-second undo queue server-side — you can abort with `bbx flows cancel <actionId>` while the window is open.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | success |
| 1 | generic error |
| 2 | auth missing / invalid |
| 3 | MCP server returned an error |
| 4 | bad flags / arguments |
| 5 | network / transport error |

## Development

```bash
git clone https://github.com/arad1do/buzzbit-cli
cd buzzbit-cli
npm install
npm run build
node dist/index.js auth status
```

## License

MIT

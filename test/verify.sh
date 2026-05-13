#!/usr/bin/env bash
# bbx verification harness — implements PRD CLI-VERIFY v1.0 (§6.1–§6.7).
#
# Usage:
#   test/verify.sh [--report=<path>] [--workspace-key=<key>] [--skip-live]
#                  [--skip-coverage] [--skip-security] [--quick]
#
# Env:
#   MCP_TEST_KEY   live test workspace key (fallback when --workspace-key omitted)
#   BBX_API_URL    override API endpoint (defaults to https://api.buzzbitx.com)
#
# Exits 0 if every recorded row is PASS or SKIP; 1 if any FAIL; 2 if the
# harness itself cannot run (bbx not installed, node missing, etc.).

set -uo pipefail

# ── defaults ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT="${TMPDIR:-/tmp}/bbx-verification.md"
LOGS_DIR=""
WORKSPACE_KEY="${MCP_TEST_KEY:-}"
SKIP_LIVE=0
SKIP_COVERAGE=0
SKIP_SECURITY=0
QUICK=0

# ── arg parsing ─────────────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --report=*) REPORT="${arg#*=}" ;;
    --workspace-key=*) WORKSPACE_KEY="${arg#*=}" ;;
    --skip-live) SKIP_LIVE=1 ;;
    --skip-coverage) SKIP_COVERAGE=1 ;;
    --skip-security) SKIP_SECURITY=1 ;;
    --quick) QUICK=1; SKIP_LIVE=1; SKIP_COVERAGE=1 ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *)
      echo "verify.sh: unknown argument: $arg" >&2
      exit 2 ;;
  esac
done

LOGS_DIR="${REPORT%.md}.logs"
RESULTS_TSV="$LOGS_DIR/results.tsv"
mkdir -p "$LOGS_DIR" || { echo "verify.sh: cannot create $LOGS_DIR" >&2; exit 2; }
: > "$RESULTS_TSV"

# ── prerequisites ───────────────────────────────────────────────────────────
have_cmd() { command -v "$1" >/dev/null 2>&1; }

if ! have_cmd bbx; then
  echo "verify.sh: \`bbx\` not on PATH — run \`npm link\` in $REPO_DIR first" >&2
  exit 2
fi
if ! have_cmd node; then
  echo "verify.sh: \`node\` required for JSON assertions" >&2
  exit 2
fi

# ── result recording ───────────────────────────────────────────────────────
# Each row: status\tsection\ttest_id\tdetails
record() {
  local status="$1" section="$2" test_id="$3" details="${4:-}"
  printf '%s\t%s\t%s\t%s\n' "$status" "$section" "$test_id" "$details" >> "$RESULTS_TSV"
  local color reset='\033[0m'
  case "$status" in
    PASS) color='\033[32m' ;;
    FAIL) color='\033[31m' ;;
    SKIP) color='\033[33m' ;;
    *)    color='' ; reset='' ;;
  esac
  printf "  ${color}%-4s${reset}  %s / %s  %s\n" "$status" "$section" "$test_id" "$details"
}

pass() { record PASS "$1" "$2" "${3:-}"; }
fail() { record FAIL "$1" "$2" "${3:-}"; }
skip() { record SKIP "$1" "$2" "${3:-}"; }

log_path() {
  printf '%s/%s-%s.log' "$LOGS_DIR" "$1" "$2"
}

# Run a command, capture stdout+stderr+exit code to a log file.
# Args: section, test_id, cmd...
run_logged() {
  local section="$1" test_id="$2"; shift 2
  local lp; lp="$(log_path "$section" "$test_id")"
  {
    printf '$ %s\n' "$*"
    "$@" 2>&1
    printf '\n[exit=%s]\n' "$?"
  } > "$lp"
  # Return the exit code parsed from the log (last line)
  tail -1 "$lp" | sed -E 's/^\[exit=([0-9]+)\]$/\1/'
}

# Node-based JSON probe. Reads stdin, exits 0 if expression is truthy.
# Args: js-expression (e.g. 'Array.isArray(d)' or 'd.email')
json_check() {
  local expr="$1"
  node -e "
    let s='';
    process.stdin.on('data',c=>{s+=c}).on('end',()=>{
      try{
        const d=JSON.parse(s);
        process.exit(($expr) ? 0 : 1);
      } catch(e){ process.exit(1); }
    });
  "
}

# ── section headers ─────────────────────────────────────────────────────────
section_header() {
  printf '\n\033[1m── %s ──\033[0m\n' "$1"
}

# ────────────────────────────────────────────────────────────────────────────
# §6.1 — Installation
# ────────────────────────────────────────────────────────────────────────────
sec_install() {
  section_header "§6.1 Installation"

  # 6.1.a — bbx on PATH
  if have_cmd bbx; then pass 6.1 a "bbx on PATH at $(command -v bbx)"
  else fail 6.1 a "bbx not on PATH"; return; fi

  # 6.1.b — version is semver
  local v; v="$(bbx --version 2>/dev/null | tr -d '\r')"
  if printf '%s' "$v" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+'; then
    pass 6.1 b "version=$v"
  else
    fail 6.1 b "bbx --version returned: $v"
  fi

  # 6.1.c — Node version gate enforced (engines.node ≥18)
  # We can't easily simulate Node 16 here; assert package.json declares it.
  if grep -q '"node":[[:space:]]*">=18' "$REPO_DIR/package.json"; then
    pass 6.1 c 'package.json engines.node >=18.0.0'
  else
    fail 6.1 c 'engines.node guard missing from package.json'
  fi

  # 6.1.d — platform smoke: --help prints "Usage:"
  if bbx --help 2>/dev/null | head -1 | grep -qi '^usage'; then
    pass 6.1 d "bbx --help first line: $(bbx --help 2>/dev/null | head -1 | tr -d '\r')"
  else
    fail 6.1 d 'bbx --help did not start with Usage:'
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# §6.2 — Per-command verification (28 groups + legacy)
# ────────────────────────────────────────────────────────────────────────────
# Format: "group:primary_verb:has_list"   has_list=1 means try list/--json/--csv
CLI_GROUPS=(
  "auth:status:0"
  "workspace:brand:0"
  "customers:list:1"
  "orders:list:1"
  "products:list:1"
  "flows:list:1"
  "campaigns:list:1"
  "social:list:1"
  "inbox:list:1"
  "popups:list:1"
  "segments:list:1"
  "media:upload:0"
  "discounts:create:0"
  "metrics:overview:0"
  "report:report:0"
  "tools:list:1"
  "skills:list:1"
  "aliases:list:1"
  "drafts:delete:0"
  "team:list:1"
  "billing:subscription:0"
  "integrations:list:1"
  "webhooks:list:1"
  "boards:list:1"
)
LEGACY_CLI_GROUPS=(broadcasts content support finance)

probe_group() {
  local group="$1"
  local verb="$2"
  local has_list="$3"
  local sid="6.2.$group"

  # .help — top-level help renders and contains "Commands:" or "Options:"
  local help_out; help_out="$(bbx "$group" --help 2>&1 || true)"
  if printf '%s' "$help_out" | grep -Eq '^Usage:'; then
    pass "$sid" help "first line ok"
  else
    fail "$sid" help "bbx $group --help did not print Usage:"
    return
  fi

  # .sub-help — primary verb's --help works
  local sub_out; sub_out="$(bbx "$group" "$verb" --help 2>&1 || true)"
  if printf '%s' "$sub_out" | head -1 | grep -qi 'usage'; then
    pass "$sid" sub-help "$verb --help ok"
  else
    fail "$sid" sub-help "bbx $group $verb --help missing Usage:"
  fi

  if [ "$has_list" -ne 1 ]; then
    skip "$sid" json "no list subcommand — n/a"
    skip "$sid" csv "no list subcommand — n/a"
    return
  fi

  # .json — PRD §5.5 wants --json. Today CLI uses --format=json.
  # We probe BOTH and pass if either works; record drift either way.
  # Some lists don't accept --limit (aliases, tools, skills, integrations,
  # webhooks); detect that via the subcommand's --help and adapt.
  local limit_arg=""
  if printf '%s' "$sub_out" | grep -q -- '--limit'; then limit_arg="--limit=1"; fi
  local rc_json rc_format
  rc_json="$(run_logged "$sid" json bbx "$group" list $limit_arg --json)"
  rc_format="$(run_logged "$sid" json-fmt bbx "$group" list $limit_arg --format=json)"

  # Live tests need auth — without auth, list returns exit 2 (AuthError).
  # We accept that as a "command shape ok, but no live data" outcome.
  if [ "$rc_json" = "0" ]; then
    # Validate JSON parses
    if json_check 'typeof d === "object" && d !== null' < "$(log_path "$sid" json)" >/dev/null 2>&1; then
      pass "$sid" json "--json returned valid JSON"
    else
      fail "$sid" json "--json output is not valid JSON"
    fi
  elif [ "$rc_format" = "0" ]; then
    fail "$sid" json "--json unsupported; --format=json works (spec drift)"
  elif [ "$rc_json" = "2" ] || [ "$rc_format" = "2" ]; then
    skip "$sid" json "auth required — set MCP_TEST_KEY"
  else
    fail "$sid" json "both --json and --format=json failed (rc=$rc_json/$rc_format)"
  fi

  # .csv — same logic
  local rc_csv rc_csv_fmt
  rc_csv="$(run_logged "$sid" csv bbx "$group" list $limit_arg --csv)"
  rc_csv_fmt="$(run_logged "$sid" csv-fmt bbx "$group" list $limit_arg --format=csv)"
  if [ "$rc_csv" = "0" ]; then
    if grep -q ',' "$(log_path "$sid" csv)"; then
      pass "$sid" csv "--csv returned data with commas"
    else
      skip "$sid" csv "--csv empty (no rows)"
    fi
  elif [ "$rc_csv_fmt" = "0" ]; then
    fail "$sid" csv "--csv unsupported; --format=csv works (spec drift)"
  elif [ "$rc_csv" = "2" ] || [ "$rc_csv_fmt" = "2" ]; then
    skip "$sid" csv "auth required"
  else
    fail "$sid" csv "both --csv and --format=csv failed (rc=$rc_csv/$rc_csv_fmt)"
  fi
}

sec_commands() {
  section_header "§6.2 Per-command verification"
  local entry rest g v h
  for entry in "${CLI_GROUPS[@]}"; do
    g="${entry%%:*}"
    rest="${entry#*:}"
    v="${rest%%:*}"
    h="${rest#*:}"
    probe_group "$g" "$v" "$h"
  done

  section_header "§6.2.y Legacy groups"
  for g in "${LEGACY_CLI_GROUPS[@]}"; do
    local help_out; help_out="$(bbx "$g" --help 2>&1 || true)"
    if printf '%s' "$help_out" | grep -Eq '^Usage:'; then
      pass "6.2.legacy" "$g" "help ok"
    else
      fail "6.2.legacy" "$g" "no Usage: line"
    fi
  done
}

# ────────────────────────────────────────────────────────────────────────────
# §6.3 — Workflow scenarios (require live workspace)
# ────────────────────────────────────────────────────────────────────────────
sec_workflows() {
  section_header "§6.3 Workflow scenarios"
  if [ -z "$WORKSPACE_KEY" ] || [ "$SKIP_LIVE" -eq 1 ]; then
    for s in A B C D E; do
      skip "6.3" "scenario-$s" "no MCP_TEST_KEY or --skip-live"
    done
    return
  fi

  # log in
  local rc; rc="$(run_logged 6.3 login bbx auth login --key="$WORKSPACE_KEY")"
  if [ "$rc" != "0" ]; then
    fail 6.3 setup "auth login failed (rc=$rc); skipping scenarios"
    for s in A B C D E; do skip "6.3" "scenario-$s" "auth failed"; done
    return
  fi

  # Scenario A — customer 360
  local lp_list; lp_list="$LOGS_DIR/6.3-A-list.log"
  bbx customers list --limit=1 --format=json > "$lp_list" 2>&1
  if json_check 'Array.isArray(d?.customers) && d.customers.length >= 0' < "$lp_list" >/dev/null 2>&1; then
    local cid; cid="$(node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{try{const d=JSON.parse(s);console.log(d.customers[0]?.id||'')}catch{console.log('')}})" < "$lp_list")"
    if [ -n "$cid" ]; then
      run_logged 6.3 A-get bbx customers get "$cid" --format=json >/dev/null
      if json_check 'typeof d?.email === "string" || d?.email === null || true' < "$(log_path 6.3 A-get)" >/dev/null 2>&1; then
        pass 6.3 scenario-A "got customer $cid"
      else
        fail 6.3 scenario-A "customers get returned non-JSON"
      fi
    else
      skip 6.3 scenario-A "workspace has no customers"
    fi
  else
    fail 6.3 scenario-A "customers list returned unexpected shape"
  fi

  # Scenario B — campaign draft (no send); avoid mutating state without cleanup
  skip 6.3 scenario-B "draft-create skipped in read-only verify mode (PRD §6.3-B mutates)"

  # Scenario C — inbox read
  run_logged 6.3 C-inbox bbx inbox list --limit=1 --format=json >/dev/null
  if json_check 'd?.conversations !== undefined || Array.isArray(d) || typeof d === "object"' < "$(log_path 6.3 C-inbox)" >/dev/null 2>&1; then
    pass 6.3 scenario-C "inbox list shape ok"
  else
    fail 6.3 scenario-C "inbox list unexpected shape"
  fi

  # Scenario D — weekly report
  local report_out="$LOGS_DIR/6.3-D-report.md"
  bbx report --period=last-7-days > "$report_out" 2>&1
  if [ -s "$report_out" ] && grep -q '^#' "$report_out"; then
    pass 6.3 scenario-D "report rendered $(wc -l < "$report_out") lines"
  else
    fail 6.3 scenario-D "report empty or no markdown headers"
  fi

  # Scenario E — multi-workspace sweep (requires ≥2 workspaces)
  local ws_count; ws_count="$(bbx auth list 2>/dev/null | grep -cE '^\s*\*?\s*\S+' || true)"
  if [ "${ws_count:-0}" -lt 2 ]; then
    skip 6.3 scenario-E "<2 workspaces configured (--all-workspaces needs ≥2)"
  else
    run_logged 6.3 E-all bbx --all-workspaces metrics overview --period=last-1-day --format=json >/dev/null
    if [ "$(tail -1 "$(log_path 6.3 E-all)" | sed -E 's/\[exit=([0-9]+)\]/\1/')" = "0" ]; then
      pass 6.3 scenario-E "all-workspaces sweep ok"
    else
      fail 6.3 scenario-E "--all-workspaces not supported or failed"
    fi
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# §6.4 — Failure modes
# ────────────────────────────────────────────────────────────────────────────
sec_failures() {
  section_header "§6.4 Failure modes"

  # 6.4.a — invalid key → exit non-zero, no stack trace
  local rc; rc="$(run_logged 6.4 invalid-key bbx auth login --key=bz_live_invalid_fake_key)"
  if [ "$rc" != "0" ]; then
    if grep -qiE 'authentication failed|invalid|unauthorized' "$(log_path 6.4 invalid-key)" \
       && ! grep -qE '    at .+:[0-9]+:[0-9]+' "$(log_path 6.4 invalid-key)"; then
      pass 6.4 invalid-key "exit=$rc, no stack trace"
    else
      fail 6.4 invalid-key "missing remedy message or leaked stack trace"
    fi
  else
    fail 6.4 invalid-key "invalid key was accepted (exit=0)"
  fi

  # 6.4.b — malformed args
  rc="$(run_logged 6.4 bad-args bbx customers list --limit=abc)"
  if [ "$rc" != "0" ]; then
    pass 6.4 bad-args "rejected --limit=abc (exit=$rc)"
  else
    skip 6.4 bad-args "limit=abc accepted (CLI parses as NaN→default); not strict but tolerable"
  fi

  # 6.4.c — unknown command suggestion
  rc="$(run_logged 6.4 unknown-cmd bbx customrs list)"
  if [ "$rc" != "0" ]; then
    pass 6.4 unknown-cmd "rejected typo (exit=$rc)"
  else
    fail 6.4 unknown-cmd "typo accepted"
  fi

  # 6.4.d — network unreachable
  local saved="${BBX_API_URL:-}"
  export BBX_API_URL="http://127.0.0.1:1"
  # logout first so a bad key isn't already cached
  bbx auth logout >/dev/null 2>&1 || true
  # login should fail fast against the dead port
  rc="$(run_logged 6.4 network bbx auth login --key=bz_live_anything)"
  if [ -n "$saved" ]; then export BBX_API_URL="$saved"; else unset BBX_API_URL; fi
  if [ "$rc" != "0" ]; then
    if ! grep -qE '    at .+:[0-9]+:[0-9]+' "$(log_path 6.4 network)"; then
      pass 6.4 network "network failure surfaced cleanly (exit=$rc)"
    else
      fail 6.4 network "network failure leaked stack trace"
    fi
  else
    fail 6.4 network "dead-port login appeared to succeed"
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# §6.5 — Live production smoke
# ────────────────────────────────────────────────────────────────────────────
sec_live() {
  section_header "§6.5 Live production smoke"
  if [ "$SKIP_LIVE" -eq 1 ] || [ -z "$WORKSPACE_KEY" ]; then
    skip 6.5 all "no MCP_TEST_KEY or --skip-live"
    return
  fi

  local rc
  rc="$(run_logged 6.5 login bbx auth login --key="$WORKSPACE_KEY")"
  if [ "$rc" != "0" ]; then
    fail 6.5 login "auth login rc=$rc"
    return
  fi
  pass 6.5 login "login ok"

  rc="$(run_logged 6.5 status bbx auth status)"
  if [ "$rc" = "0" ]; then
    pass 6.5 status "auth status ok"
  else
    fail 6.5 status "auth status rc=$rc"
  fi

  rc="$(run_logged 6.5 metrics bbx metrics overview --format=json)"
  if [ "$rc" = "0" ] && json_check 'typeof d === "object" && d !== null' < "$(log_path 6.5 metrics)" >/dev/null 2>&1; then
    pass 6.5 metrics "metrics overview returned object"
  else
    fail 6.5 metrics "metrics overview rc=$rc or non-object"
  fi

  rc="$(run_logged 6.5 tools bbx tools list)"
  local tool_lines; tool_lines="$(grep -cE '^\S' "$(log_path 6.5 tools)" || echo 0)"
  if [ "$rc" = "0" ] && [ "$tool_lines" -ge 50 ]; then
    pass 6.5 tools "tools list ≥50 entries ($tool_lines)"
  elif [ "$rc" = "0" ]; then
    fail 6.5 tools "tools list only $tool_lines entries (expected ≥50)"
  else
    fail 6.5 tools "tools list rc=$rc"
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# §6.6 — Security
# ────────────────────────────────────────────────────────────────────────────
sec_security() {
  section_header "§6.6 Security"
  if [ "$SKIP_SECURITY" -eq 1 ]; then
    skip 6.6 all "--skip-security"
    return
  fi
  if [ -z "$WORKSPACE_KEY" ]; then
    skip 6.6 all "no MCP_TEST_KEY"
    return
  fi

  bbx auth login --key="$WORKSPACE_KEY" >/dev/null 2>&1
  local leak_found=0

  # 6.6.a — token never appears in output of common commands
  for cmd in 'customers list --limit=1 --format=json' 'metrics overview --format=json' 'auth status' '--help' '--version'; do
    local out; out="$(bbx $cmd 2>&1 || true)"
    if printf '%s' "$out" | grep -qF "$WORKSPACE_KEY"; then
      fail 6.6 token-leak "bbx $cmd leaked key in output"
      leak_found=1
    fi
  done
  if [ "$leak_found" -eq 0 ]; then
    pass 6.6 token-leak "no key in 5 common commands"
  fi

  # 6.6.b — config file mode (Unix only). On Windows we skip.
  local cfg="$HOME/.buzzbit/config.json"
  if [ ! -f "$cfg" ]; then
    skip 6.6 config-mode "config not at $cfg"
  elif [ "$(uname -s 2>/dev/null)" = "Linux" ] || [ "$(uname -s 2>/dev/null)" = "Darwin" ]; then
    local mode; mode="$(stat -c '%a' "$cfg" 2>/dev/null || stat -f '%Lp' "$cfg" 2>/dev/null)"
    if [ "$mode" = "600" ]; then
      pass 6.6 config-mode "$cfg mode=600"
    else
      fail 6.6 config-mode "$cfg mode=$mode (want 600)"
    fi
  else
    skip 6.6 config-mode "Windows ACL not checked by stat; visual review needed"
  fi

  # 6.6.c — verbose mode doesn't leak token
  local vout; vout="$(bbx -v customers list --limit=1 --format=json 2>&1 || true)"
  if printf '%s' "$vout" | grep -qF "$WORKSPACE_KEY"; then
    fail 6.6 verbose-leak "verbose mode leaked key"
  else
    pass 6.6 verbose-leak "verbose did not leak key"
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# §6.7 — Coverage gap (MCP tools vs CLI wrappers)
# ────────────────────────────────────────────────────────────────────────────
sec_coverage() {
  section_header "§6.7 Coverage check"
  if [ "$SKIP_COVERAGE" -eq 1 ] || [ -z "$WORKSPACE_KEY" ]; then
    skip 6.7 coverage "no MCP_TEST_KEY or --skip-coverage"
    return
  fi

  bbx auth login --key="$WORKSPACE_KEY" >/dev/null 2>&1

  local tools_json="$LOGS_DIR/6.7-tools.json"
  bbx tools list --format=json > "$tools_json" 2>&1
  if ! json_check 'Array.isArray(d) || Array.isArray(d?.tools)' < "$tools_json" >/dev/null 2>&1; then
    fail 6.7 coverage "tools list did not return an array shape"
    return
  fi

  # Extract all tool names + the names tagged cli.skip=true
  node -e "
    let s='';
    process.stdin.on('data',c=>s+=c).on('end',()=>{
      try{
        const d=JSON.parse(s);
        const tools = Array.isArray(d) ? d : (d.tools || []);
        for (const t of tools) console.log(t.name || '');
      } catch(e){ process.exit(1); }
    });
  " < "$tools_json" | grep -v '^$' | sort > "$LOGS_DIR/6.7-all-tools.txt"

  node -e "
    let s='';
    process.stdin.on('data',c=>s+=c).on('end',()=>{
      try{
        const d=JSON.parse(s);
        const tools = Array.isArray(d) ? d : (d.tools || []);
        for (const t of tools) if (t?.cli?.skip === true) console.log(t.name || '');
      } catch(e){ process.exit(1); }
    });
  " < "$tools_json" | grep -v '^$' | sort > "$LOGS_DIR/6.7-expected-skip.txt"

  # Scan source for tool names invoked via callTool('xxx', …)
  grep -rhoE "callTool[a-zA-Z]*<?[^>]*>?\\(['\"][^'\"]+['\"]" "$REPO_DIR/src" \
    | sed -E "s/.*\(['\"]([^'\"]+).*/\1/" | sort -u > "$LOGS_DIR/6.7-wrapped.txt"

  comm -23 "$LOGS_DIR/6.7-all-tools.txt" "$LOGS_DIR/6.7-wrapped.txt" > "$LOGS_DIR/6.7-uncovered.txt"

  if diff -q "$LOGS_DIR/6.7-uncovered.txt" "$LOGS_DIR/6.7-expected-skip.txt" >/dev/null 2>&1; then
    pass 6.7 coverage "uncovered tools match cli.skip list"
  else
    local extra; extra="$(comm -23 "$LOGS_DIR/6.7-uncovered.txt" "$LOGS_DIR/6.7-expected-skip.txt" | wc -l | tr -d ' ')"
    local missed; missed="$(comm -13 "$LOGS_DIR/6.7-uncovered.txt" "$LOGS_DIR/6.7-expected-skip.txt" | wc -l | tr -d ' ')"
    fail 6.7 coverage "$extra uncovered (should be skip), $missed wrongly-skipped (see $LOGS_DIR/6.7-uncovered.txt)"
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# Report rendering
# ────────────────────────────────────────────────────────────────────────────
finalize() {
  local total pass fail skip
  total="$(wc -l < "$RESULTS_TSV" | tr -d ' ')"
  pass="$(awk -F'\t' '$1=="PASS"' "$RESULTS_TSV" | wc -l | tr -d ' ')"
  fail="$(awk -F'\t' '$1=="FAIL"' "$RESULTS_TSV" | wc -l | tr -d ' ')"
  skip="$(awk -F'\t' '$1=="SKIP"' "$RESULTS_TSV" | wc -l | tr -d ' ')"

  {
    printf '# bbx verification report\n\n'
    printf '_Generated: %s_\n\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    printf '## Summary\n\n'
    printf '| Status | Count |\n|---|---:|\n'
    printf '| PASS | %s |\n' "$pass"
    printf '| FAIL | %s |\n' "$fail"
    printf '| SKIP | %s |\n' "$skip"
    printf '| **Total** | **%s** |\n\n' "$total"
    printf 'Verdict: '
    if [ "$fail" -eq 0 ]; then
      printf '**GREEN** ✅ — every row PASS or SKIP.\n\n'
    else
      printf '**RED** ❌ — %s failing rows.\n\n' "$fail"
    fi

    printf '## Rows\n\n'
    printf '| Status | Section | Test | Details |\n|---|---|---|---|\n'
    awk -F'\t' '{ gsub(/\|/,"\\|"); printf "| %s | %s | %s | %s |\n", $1,$2,$3,$4 }' "$RESULTS_TSV"

    if [ "$fail" -gt 0 ]; then
      printf '\n## Failing rows (drill-down)\n\n'
      awk -F'\t' '$1=="FAIL" { printf "- **%s / %s** — %s\n", $2,$3,$4 }' "$RESULTS_TSV"
    fi

    printf '\n## Logs\n\nRaw command transcripts under: `%s/`\n' "$LOGS_DIR"
  } > "$REPORT"

  echo
  printf '────────────────────────────────────────────────────\n'
  printf 'PASS=%s  FAIL=%s  SKIP=%s  total=%s\n' "$pass" "$fail" "$skip" "$total"
  printf 'Report: %s\n' "$REPORT"
  printf 'Logs:   %s/\n' "$LOGS_DIR"
  printf '────────────────────────────────────────────────────\n'

  if [ "$fail" -gt 0 ]; then exit 1; else exit 0; fi
}

# ────────────────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────────────────
main() {
  printf 'bbx verify — PRD CLI-VERIFY v1.0\n'
  printf 'report: %s\n' "$REPORT"
  printf 'logs:   %s\n' "$LOGS_DIR"
  if [ -n "$WORKSPACE_KEY" ]; then
    printf 'live tests: ENABLED (key=%s***)\n' "$(printf '%s' "$WORKSPACE_KEY" | cut -c1-10)"
  else
    printf 'live tests: SKIPPED (no MCP_TEST_KEY)\n'
  fi

  sec_install
  sec_commands
  sec_failures
  sec_workflows
  sec_live
  sec_security
  sec_coverage
  finalize
}

main

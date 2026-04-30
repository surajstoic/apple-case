#!/bin/bash
# Generic Grok Brain updater — fires on Stop hook
# Works for any project with .agent/GROK_BRAIN_SUMMARY.md

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO=$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)
[ -z "$REPO" ] && REPO="$(dirname "$(dirname "$SCRIPT_DIR")")"

BRAIN="$REPO/.agent/GROK_BRAIN_SUMMARY.md"
LOG="$REPO/.claude/hooks/brain-update.log"
TODAY=$(date '+%Y-%m-%d')

[ ! -f "$BRAIN" ] && exit 0

cd "$REPO" || exit 1

CHANGED=$(git diff HEAD --name-only 2>/dev/null | grep -v '\.gbrain' | grep -v '^$' | head -5)
if [ -z "$CHANGED" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] No changes — brain update skipped" >> "$LOG"
  exit 0
fi

CHANGED_SUMMARY=$(echo "$CHANGED" | tr '\n' ', ' | sed 's/,$//')

python3 - "$BRAIN" "$TODAY" "$CHANGED_SUMMARY" << 'PYEOF'
import sys, re
brain_file, today, changed = sys.argv[1], sys.argv[2], sys.argv[3]
with open(brain_file, 'r') as f:
    content = f.read()
content = re.sub(r'\*\*Last updated:\*\* .*', f'**Last updated:** {today} (auto-updated by Stop hook)', content)
content = re.sub(r'- Last session changed: .*', f'- Last session changed: {changed}', content)
with open(brain_file, 'w') as f:
    f.write(content)
print(f"Brain updated: {today}, changed={changed}")
PYEOF

git add "$BRAIN"
if git diff --cached --quiet; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Brain unchanged — no commit" >> "$LOG"
  exit 0
fi

git commit -m "auto: grok-brain sync — $TODAY" >> "$LOG" 2>&1

REMOTE_URL=$(git remote get-url origin 2>/dev/null)
REPO_PATH=$(echo "$REMOTE_URL" | sed 's|.*github.com/||' | sed 's|\.git$||' | sed 's|https://[^@]*@||')
GH_USER=$(echo "$REPO_PATH" | cut -d'/' -f1)

gh auth switch --user "$GH_USER" 2>/dev/null || true
TOKEN=$(gh auth token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] No gh token — push skipped" >> "$LOG"
  exit 0
fi

git remote set-url origin "https://${GH_USER}:${TOKEN}@github.com/${REPO_PATH}.git"
git push origin "$(git rev-parse --abbrev-ref HEAD)" >> "$LOG" 2>&1
git remote set-url origin "$REMOTE_URL"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Brain synced. Changed: $CHANGED_SUMMARY" >> "$LOG"

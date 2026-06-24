#!/usr/bin/env bash
set -euo pipefail

OWNER_REPO="Moistbobo/sos-world-dashboard"
RULESETS_DIR="$(cd "$(dirname "$0")/../.github/rulesets" && pwd)"

apply_ruleset() {
  local file=$1
  local name
  name=$(jq -r '.name' "$file")

  echo "Applying ruleset: $name"

  existing_id=$(gh api "repos/${OWNER_REPO}/rulesets" --jq ".[] | select(.name == \"$name\") | .id" 2>/dev/null || true)

  if [ -n "$existing_id" ]; then
    echo "  -> Updating existing ruleset id=$existing_id"
    gh api "repos/${OWNER_REPO}/rulesets/${existing_id}" --method PUT --input "$file" --jq '{id, name, enforcement, rules}'
  else
    echo "  -> Creating new ruleset"
    gh api "repos/${OWNER_REPO}/rulesets" --method POST --input "$file" --jq '{id, name, enforcement, rules}'
  fi
}

for file in "$RULESETS_DIR"/*.json; do
  apply_ruleset "$file"
done

echo "Done. Current rulesets:"
gh ruleset list -R "$OWNER_REPO"

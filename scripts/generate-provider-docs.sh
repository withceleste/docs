#!/bin/bash
# Generate provider docs from the Celeste model registry.
#
# Mirrors the website pattern:
# - CELESTE_SOURCE=local  -> run against local workspace (celeste-python-private)
# - otherwise             -> run against PyPI (celeste-ai[all])

set -euo pipefail

cd "$(dirname "$0")/.."
DOCS_ROOT="$(pwd)"

if [ "${CELESTE_SOURCE:-}" = "local" ]; then
  WORKSPACE_ROOT="$(cd .. && pwd)"
  CELESTE_PY_PRIVATE_ROOT="$WORKSPACE_ROOT/celeste-python-private"

  cd "$CELESTE_PY_PRIVATE_ROOT"
  # Run against the local workspace project.
  uv run python "$DOCS_ROOT/scripts/generate-provider-docs.py"
  cd "$DOCS_ROOT"
else
  uv run --no-project --with "celeste-ai" python scripts/generate-provider-docs.py
fi


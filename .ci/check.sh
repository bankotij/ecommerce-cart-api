#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
project_root=$(pwd)
cd "$project_root/."
npm ci --no-audit --no-fund
cd "$project_root/."
npm test
cd "$project_root/."
npm run build

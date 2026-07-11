#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${CMS_APP_DIR:-/var/www/cms-frontend}"
RUNNER="${APP_DIR}/scripts/run-cms-data-sync.sh"

if [[ ! -x "${RUNNER}" ]]; then
  echo "Missing executable sync runner: ${RUNNER}" >&2
  exit 1
fi

cat > /etc/cron.d/cms-data-sync <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Lightweight channel statistics refresh every 30 minutes.
*/30 * * * * root ${RUNNER} stats >> /var/log/cms-data-sync-stats.log 2>&1
# Revenue refresh once daily at 00:15 UTC (05:45 India time).
15 0 * * * root ${RUNNER} revenue >> /var/log/cms-data-sync-revenue.log 2>&1
EOF
chmod 0644 /etc/cron.d/cms-data-sync

cat > /etc/logrotate.d/cms-data-sync <<'EOF'
/var/log/cms-data-sync-stats.log /var/log/cms-data-sync-revenue.log {
  weekly
  rotate 8
  compress
  missingok
  notifempty
  copytruncate
}
EOF
chmod 0644 /etc/logrotate.d/cms-data-sync

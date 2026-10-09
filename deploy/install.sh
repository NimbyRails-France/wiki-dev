#!/usr/bin/env bash
# Deploy only prebuilt developer-wiki files. No compiler or test runner on production.
# Usage: sudo bash install.sh <upload-directory> <release-id> <archive-sha256>
set -euo pipefail
upload=$(realpath "$1")
release=$2
expected=$3
[[ "$release" =~ ^[a-zA-Z0-9-]+$ && "$expected" =~ ^[a-f0-9]{64}$ ]]
printf '%s  %s\n' "$expected" "$upload/wiki.tar.gz" | sha256sum -c -
base=/opt/docker/nimbyrailsfrance-wiki-dev
gateway=/opt/docker/infrastructure/caddy/Caddyfile
mkdir -p "$base/storage/releases"
exec 9>"$base/.deploy.lock"
flock -n 9
target="$base/storage/releases/$release"
[[ ! -e "$target" ]]
mkdir "$target"
tar -xzf "$upload/wiki.tar.gz" --no-same-owner --no-same-permissions -C "$target"
test -s "$target/index.html"
test -s "$target/commencer/installation/index.html"
test -s "$target/404.html"
chmod -R a+rX "$target"
previous=$(readlink "$base/storage/current" || true)
if [[ -n "$previous" ]]; then
  ln -sfn "$previous" "$base/storage/previous"
fi
install -m 644 "$upload/compose.yaml" "$base/compose.yaml"
install -m 644 "$upload/Caddyfile" "$base/Caddyfile"
ln -s "releases/$release" "$base/storage/current.next"
mv -Tf "$base/storage/current.next" "$base/storage/current"
cd "$base"
if ! docker compose up -d --no-build --pull never; then
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$base/storage/current.rollback"
    mv -Tf "$base/storage/current.rollback" "$base/storage/current"
  fi
  exit 1
fi

# Append the developer site block, preserving every existing domain. Wiki.js and
# reassignment of the old public wiki hostname are outside this installer.
# Validate before
# replacing the bound file, whose inode must remain stable for Docker's mount.
if ! grep -Fq 'wiki-dev.nimbyrails-france.fr' "$gateway"; then
  before=$(sha256sum "$gateway" | cut -d ' ' -f 1)
  backup="$gateway.before-wiki-dev-$release"
  cp -p "$gateway" "$backup"
  { cat "$backup"; printf '\n'; cat "$upload/gateway.caddy"; } > "$base/gateway.candidate"
  docker cp "$base/gateway.candidate" caddy:/tmp/nrf-wiki-dev-candidate.caddy
  docker exec caddy caddy validate --config /tmp/nrf-wiki-dev-candidate.caddy --adapter caddyfile
  [[ "$(sha256sum "$gateway" | cut -d ' ' -f 1)" == "$before" ]]
  cat "$base/gateway.candidate" > "$gateway"
  if ! docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile; then
    cat "$backup" > "$gateway"
    docker exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    exit 1
  fi
fi
printf 'Published %s; previous=%s\n' "$release" "$previous"

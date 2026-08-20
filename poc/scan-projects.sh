#!/usr/bin/env bash
#
# Scans local Java/Gradle projects into SonarQube for the Cost Savings demo.
# Prerequisites:
#   - SonarQube running at SONAR_URL (default http://localhost:9000)
#   - A user token stored in SONAR_TOKEN
#   - Maven 3.9+ and Java 17+ on PATH
#
# Usage:
#   export SONAR_TOKEN=squ_xxxxxxxx
#   ./scan-projects.sh
#

set -euo pipefail

SONAR_URL="${SONAR_URL:-http://localhost:9000}"
SONAR_TOKEN="${SONAR_TOKEN:?Set SONAR_TOKEN to a SonarQube user token}"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

log() { echo "==> $*"; }

scan_maven() {
  local dir="$1"
  local key="$2"
  local name="$3"

  if [ ! -f "$dir/pom.xml" ]; then
    log "SKIP $name — no pom.xml found at $dir"
    return
  fi

  log "Scanning $name ($dir) ..."
  (cd "$dir" && mvn -q sonar:sonar \
    -Dsonar.host.url="$SONAR_URL" \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.projectKey="$key" \
    -Dsonar.projectName="$name" \
    -DskipTests 2>&1 | tail -5) || log "WARN: $name scan finished with errors"
}

scan_gradle() {
  local dir="$1"
  local key="$2"
  local name="$3"

  if [ ! -f "$dir/build.gradle" ] && [ ! -f "$dir/build.gradle.kts" ]; then
    log "SKIP $name — no build.gradle found at $dir"
    return
  fi

  log "Scanning $name ($dir) ..."
  (cd "$dir" && ./gradlew sonar \
    -Dsonar.host.url="$SONAR_URL" \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.projectKey="$key" \
    -Dsonar.projectName="$name" 2>&1 | tail -5) || log "WARN: $name scan finished with errors"
}

log "SonarQube URL: $SONAR_URL"
log "Base directory: $BASE_DIR"
echo ""

# Maven projects
scan_maven "$BASE_DIR/WebGoat"       "webgoat"       "WebGoat"
scan_maven "$BASE_DIR/BenchmarkJava" "benchmark-java" "OWASP Benchmark Java"

# Gradle projects
scan_gradle "$BASE_DIR/kafka"         "kafka"          "Apache Kafka"
scan_gradle "$BASE_DIR/elasticsearch" "elasticsearch"  "Elasticsearch"

echo ""
log "Done. Check $SONAR_URL/projects for results."

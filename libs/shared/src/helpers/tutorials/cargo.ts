/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/**
 * The Scanner for Cargo is published as the `cargo-sonar-scanner` crate and installs itself as the
 * `sonar-scanner` Cargo subcommand. Both SQS and SQC print these commands, so they live here to
 * keep the two tutorials from drifting apart.
 */
export const CARGO_INSTALL_COMMAND = 'cargo install cargo-sonar-scanner';
export const CARGO_BINSTALL_COMMAND = 'cargo binstall cargo-sonar-scanner';
export const CARGO_SCAN_COMMAND = 'cargo sonar-scanner';

export const CARGO_MANIFEST_NAME = 'Cargo.toml';

/** Workspace-level counterpart of the `[package.metadata.sonar]` table built below. */
export const CARGO_WORKSPACE_METADATA_TABLE = '[workspace.metadata.sonar]';

export interface CargoManifestSnippetParams {
  organization?: string;
  projectKey: string;
}

/**
 * Builds the `[package.metadata.sonar]` block that the Scanner for Cargo reads from `Cargo.toml`.
 *
 * The `target/**` exclusion is spelled out on purpose: scanner-side auto-configuration does not
 * derive the analysis scope from Cargo yet, so without it the build output is indexed alongside
 * the sources. Drop it once auto-config contributes the exclusion itself.
 *
 * The token is deliberately absent — `Cargo.toml` is committed, and for a library crate it is
 * published inside the `.crate` archive, so it must be passed on the command line instead.
 */
export function buildCargoManifestSnippet({
  organization,
  projectKey,
}: CargoManifestSnippetParams): string {
  return [
    '[package.metadata.sonar]',
    `project-key = "${projectKey}"`,
    ...(organization === undefined ? [] : [`organization = "${organization}"`]),
    'exclusions = ["target/**"]',
  ].join('\n');
}

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

interface Props {
  branches: unknown[];
  fixabilityByRiskKey?: unknown;
  isDisabled: boolean;
  lookupRiskFixability?: (riskKeys: string[]) => Promise<ReadonlyMap<string, unknown>>;
  onPendingChange: (isPending: boolean) => void;
  onSuccess: () => void;
  risks: unknown[];
}

/** No-op on SonarQube Server; assigning dependency risks to the agent is Cloud-only. */
export default function ScaBulkAgentButton(_props: Readonly<Props>) {
  return null;
}

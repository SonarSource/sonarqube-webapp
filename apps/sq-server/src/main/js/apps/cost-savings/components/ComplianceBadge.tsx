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

const FRAMEWORK_COLORS: Record<string, string> = {
  HIPAA: 'sw-bg-purple-100 sw-text-purple-800',
  'OWASP Top 10': 'sw-bg-orange-100 sw-text-orange-800',
  'PCI-DSS': 'sw-bg-blue-100 sw-text-blue-800',
  'SOC 2': 'sw-bg-green-100 sw-text-green-800',
};

interface Props {
  framework: string;
}

function ComplianceBadge({ framework }: Props) {
  const name = extractFrameworkName(framework);
  const colors = FRAMEWORK_COLORS[name] ?? 'sw-bg-gray-100 sw-text-gray-700';

  return (
    <span
      className={`sw-inline-block sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-medium ${colors}`}
    >
      {name}
    </span>
  );
}

function extractFrameworkName(control: string): string {
  if (control.startsWith('PCI-DSS')) {
    return 'PCI-DSS';
  }
  if (control.startsWith('SOC 2')) {
    return 'SOC 2';
  }
  if (control.startsWith('HIPAA')) {
    return 'HIPAA';
  }
  if (control.startsWith('OWASP')) {
    return 'OWASP Top 10';
  }
  return control;
}

export { ComplianceBadge, extractFrameworkName };

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

const FRAMEWORK_COLORS: Record<string, { bg: string; text: string }> = {
  HIPAA: { bg: 'rgba(126, 34, 206, 0.08)', text: '#6b21a8' },
  'OWASP Top 10': { bg: 'rgba(234, 88, 12, 0.08)', text: '#c2410c' },
  'PCI-DSS': { bg: '#EEF4FC', text: '#126ED3' },
  'SOC 2': { bg: 'rgba(22, 163, 74, 0.08)', text: '#15803d' },
};

const DEFAULT_COLORS = { bg: '#F7F9FC', text: '#69809B' };

interface Props {
  framework: string;
}

function ComplianceBadge({ framework }: Props) {
  const name = extractFrameworkName(framework);
  const colors = FRAMEWORK_COLORS[name] ?? DEFAULT_COLORS;

  return (
    <span
      className="sw-inline-block sw-rounded-full sw-px-2.5 sw-py-0.5 sw-text-xs sw-font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
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

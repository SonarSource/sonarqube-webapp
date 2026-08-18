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

import { Text, TextSize } from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import type { WidgetModalAccordionComponent } from './modalAccordionTypes';

export interface ApplyFiltersAccordionShellProps {
  Accordion: WidgetModalAccordionComponent;
  applyFiltersAccordionOpen: boolean;
  children: ReactNode;
  onAccordionToggle: () => void;
}

export function ApplyFiltersAccordionShell({
  Accordion,
  applyFiltersAccordionOpen,
  children,
  onAccordionToggle,
}: Readonly<ApplyFiltersAccordionShellProps>) {
  return (
    <Accordion
      isOpen={applyFiltersAccordionOpen}
      onToggle={onAccordionToggle}
      title={<FormattedMessage id="dashboard.add_widget_modal.apply_filters" />}
    >
      {children}
    </Accordion>
  );
}

export function ApplyFiltersAccordionContent({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className="sw-flex sw-flex-col sw-gap-4"
      onClick={(e) => {
        e.stopPropagation();
      }}
      role="none"
    >
      {children}
    </div>
  );
}

export function ApplyFiltersWarning() {
  return (
    <Text isSubtle size={TextSize.Small}>
      <FormattedMessage id="dashboard.add_widget_modal.apply_filters.warning" />
    </Text>
  );
}

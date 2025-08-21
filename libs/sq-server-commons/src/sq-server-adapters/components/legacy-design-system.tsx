/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { useState } from 'react';
import { AccordionProps, SubnavigationLinkItemProps } from '~shared/types/design-system';
import {
  Accordion as LegacyAccordion,
  HtmlFormatter as LegacyHtmlFormatter,
  SubnavigationLinkItem as LegacySubnavigationLinkItem,
} from '../../design-system';

/**
 * This file exports the legacy design system components that are needed by shared code
 * but have not yet been ported to Echoes. It is not intended to be used by new code.
 *
 * All components in this file should be @deprecated
 */

/**
 * @deprecated Stop using design-system in shared code.
 */
export function SubnavigationLinkItem(props: Readonly<SubnavigationLinkItemProps>) {
  return <LegacySubnavigationLinkItem {...props} />;
}

/**
 * @deprecated Stop using design-system in shared code.
 */
export const HtmlFormatter = LegacyHtmlFormatter;

/**
 * @deprecated Stop using design-system in shared code.
 */
export function Accordion(props: Readonly<AccordionProps>) {
  const [open, setOpen] = useState(false);
  return (
    <LegacyAccordion
      ariaLabel={props.ariaLabel}
      header={props.title}
      onClick={() => {
        setOpen(!open);
      }}
      open={open}
    >
      {props.children}
    </LegacyAccordion>
  );
}

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

import { Button, ButtonVariety, Heading } from '@sonarsource/echoes-react';
import { BasicSeparator } from '../../design-system';
import { translate } from '../../helpers/l10n';
import ModeBanner from './ModeBanner';

interface Props {
  clearAllButtonLabel?: string;
  clearAllButtonVariety?: ButtonVariety;
  displayModeBanner?: boolean;
  displayReset: boolean;
  onReset: () => void;
  title?: string;
}

export default function FiltersHeader({
  clearAllButtonLabel = translate('clear_all_filters'),
  clearAllButtonVariety = ButtonVariety.DangerOutline,
  displayModeBanner = true,
  displayReset,
  onReset,
  title = translate('filters'),
}: Readonly<Props>) {
  return (
    <div className="sw-mb-5">
      <div className="sw-flex sw-h-9 sw-items-center sw-justify-between">
        <Heading as="h2" className="sw-typo-lg-semibold">
          {title}
        </Heading>

        {displayReset && (
          <Button onClick={onReset} variety={clearAllButtonVariety}>
            {clearAllButtonLabel}
          </Button>
        )}
      </div>

      {displayModeBanner && <ModeBanner as="facetBanner" />}
      <BasicSeparator className="sw-mt-4" />
    </div>
  );
}

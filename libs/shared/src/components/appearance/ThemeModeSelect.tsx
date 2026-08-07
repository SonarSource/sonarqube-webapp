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

import { SelectionCards } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { getBaseUrl } from '~adapters/helpers/system';
import { useThemeMode } from '~adapters/helpers/useThemeMode';
import { ThemeMode } from '../../types/themes';

export function ThemeModeSelect() {
  const { formatMessage } = useIntl();
  const [themeMode, setThemeMode] = useThemeMode();

  const handleThemeSelect = useCallback(
    (selectedTheme: ThemeMode) => {
      setThemeMode(selectedTheme);
    },
    [setThemeMode],
  );

  return (
    <SelectionCards
      alignment="horizontal"
      ariaLabel={formatMessage({ id: 'my_account.appearance.customize_theme' })}
      className="sw-mt-4"
      onChange={handleThemeSelect}
      options={Object.values(ThemeMode).map((theme) => ({
        value: theme,
        label: formatMessage({ id: `theme_select_card_title.${theme}` }),
        illustration: (
          <Image
            alt={formatMessage({ id: `theme_select_card_title.${theme}` })}
            aria-hidden
            src={`${getBaseUrl()}/images/theme/${theme}.svg`}
          />
        ),
      }))}
      value={themeMode}
    />
  );
}

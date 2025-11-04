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

import { LogoSize } from '@sonarsource/echoes-react';
import { useContext } from 'react';
import { useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { MainAppBar } from '~design-system';
import { SonarQubeProductLogo } from '~sq-server-commons/components/branding/SonarQubeProductLogo';
import { AppStateContext } from '~sq-server-commons/context/app-state/AppStateContext';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';

const DEFAULT_CUSTOM_LOGO_WIDTH_IN_PX = 100;
const MAX_LOGO_HEIGHT_IN_PX = 40;
const MAX_LOGO_WIDTH_IN_PX = 150;

export function LogoWithAriaText() {
  const { settings } = useContext(AppStateContext);
  const intl = useIntl();

  const customLogoUrl = settings[GlobalSettingKeys.LogoUrl];

  const customLogoWidth = parseInt(
    settings[GlobalSettingKeys.LogoWidth] ?? `${DEFAULT_CUSTOM_LOGO_WIDTH_IN_PX}`,
    10,
  );

  const title = customLogoUrl
    ? intl.formatMessage({ id: 'layout.nav.home_logo_alt' })
    : intl.formatMessage({ id: 'layout.nav.home_sonarqube_logo_alt' });

  return (
    <div aria-label={title} role="img">
      {customLogoUrl ? (
        <Image
          alt={title}
          src={customLogoUrl}
          style={{
            maxHeight: `${MAX_LOGO_HEIGHT_IN_PX}px`,
            maxWidth: `${MAX_LOGO_WIDTH_IN_PX}px`,
            objectFit: 'contain',
          }}
          width={Math.min(customLogoWidth, MAX_LOGO_WIDTH_IN_PX)}
        />
      ) : (
        <SonarQubeProductLogo hasText size={LogoSize.Medium} />
      )}
    </div>
  );
}

export default function MainSonarQubeBar({ children }: React.PropsWithChildren<object>) {
  return <MainAppBar Logo={LogoWithAriaText}>{children}</MainAppBar>;
}

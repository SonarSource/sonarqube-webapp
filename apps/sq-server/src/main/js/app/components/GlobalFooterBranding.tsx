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

import { LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import { isOfficial } from '~sq-server-commons/helpers/system';

export default function GlobalFooterBranding() {
  const official = isOfficial();

  return (
    <div className="max-[1400px]:sw-max-w-[12rem] sw-flex sw-items-center">
      {official ? (
        <span>
          SonarQube&trade; technology is powered by{' '}
          <LinkStandalone
            enableOpenInNewTab
            highlight={LinkHighlight.CurrentColor}
            isDiscreet
            to="https://www.sonarsource.com"
          >
            SonarSource Sàrl
          </LinkStandalone>
        </span>
      ) : (
        <span>
          This application is based on{' '}
          <LinkStandalone
            enableOpenInNewTab
            highlight={LinkHighlight.CurrentColor}
            isDiscreet
            title="SonarQube™"
            to="https://www.sonarsource.com/products/sonarqube/?referrer=sonarqube"
          >
            SonarQube™
          </LinkStandalone>{' '}
          but is <strong>not</strong> an official version provided by{' '}
          <LinkStandalone
            enableOpenInNewTab
            highlight={LinkHighlight.CurrentColor}
            isDiscreet
            title="SonarSource Sàrl"
            to="https://www.sonarsource.com"
          >
            SonarSource Sàrl
          </LinkStandalone>
          .
        </span>
      )}
    </div>
  );
}

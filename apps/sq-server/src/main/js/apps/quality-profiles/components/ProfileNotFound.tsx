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

import {
  Button,
  ButtonVariety,
  EmptyState,
  IconQualityProfile,
  Layout,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';

export default function ProfileNotFound() {
  return (
    <Layout.PageGrid>
      <Layout.PageContent className="sw-flex sw-flex-col sw-items-center sw-justify-start sw-pt-40">
        <EmptyState
          action={
            <Button to={PROFILE_PATH} variety={ButtonVariety.Primary}>
              <FormattedMessage id="quality_profiles.back_to_list" />
            </Button>
          }
          className="sw-max-w-[32rem]"
          graphic={<IconQualityProfile />}
          text={<FormattedMessage id="quality_profiles.not_found.description" />}
          title={<FormattedMessage id="quality_profiles.not_found" />}
          titleAs="h1"
          titleSize="medium"
        />
      </Layout.PageContent>
    </Layout.PageGrid>
  );
}

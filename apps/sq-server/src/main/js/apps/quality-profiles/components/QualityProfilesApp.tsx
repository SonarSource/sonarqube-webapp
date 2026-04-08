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

import { Layout, Spinner } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { useLanguagesWithRules } from '~sq-server-commons/context/languages/withLanguages';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  useExportersQuery,
  useQualityProfilesSearchQuery,
} from '~sq-server-commons/queries/quality-profiles';
import { QualityProfilesContextProps } from '~sq-server-commons/types/quality-profiles';
import { sortProfiles } from '~sq-server-commons/utils/quality-profiles-utils';

export function QualityProfilesApp() {
  const languagesWithRules = useLanguagesWithRules();

  const { data: profilesData, isLoading: isProfilesLoading } =
    useQualityProfilesSearchQuery(undefined);
  const { data: exporters, isLoading: isExportersLoading } = useExportersQuery();

  const isLoading = isProfilesLoading || isExportersLoading;

  const context: QualityProfilesContextProps = {
    actions: profilesData?.actions ?? {},
    profiles: sortProfiles(profilesData?.profiles ?? []),
    languages: Object.values(languagesWithRules),
    exporters: exporters ?? [],
  };

  return (
    <>
      <Suggestions suggestion={DocLink.InstanceAdminQualityProfiles} />
      <Helmet defer={false} title={translate('quality_profiles.page')} />

      <Layout.ContentGrid>
        <Spinner isLoading={isLoading}>
          <Outlet context={context} />
        </Spinner>
      </Layout.ContentGrid>
    </>
  );
}

export default QualityProfilesApp;

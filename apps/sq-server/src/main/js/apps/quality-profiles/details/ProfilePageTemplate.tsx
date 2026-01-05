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
  Badge,
  BreadcrumbsProps,
  Layout,
  Link,
  LinkHighlight,
  LinkStandalone,
  Text,
} from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { useLocation } from '~shared/components/hoc/withRouter';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { getProfilePath } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import {
  getProfileChangelogPath,
  getProfilesForLanguagePath,
} from '~sq-server-commons/utils/quality-profiles-utils';
import BuiltInQualityProfileBadge from '../components/BuiltInQualityProfileBadge';
import ProfileActions from '../components/ProfileActions';
import { useQualityProfileDetailsContext } from '../qualityProfilesContext';

interface Props {
  additionalBreadcrumbs?: BreadcrumbsProps['items'];
  helmetTitle: string;
  hideChangelogLink?: boolean;
  hideMetadata?: boolean;
}

export function ProfilePageTemplate(props: PropsWithChildren<Props>) {
  const {
    additionalBreadcrumbs = [],
    children,
    helmetTitle,
    hideChangelogLink = false,
    hideMetadata = false,
  } = props;

  const { profile, profiles, updateProfiles } = useQualityProfileDetailsContext();

  const location = useLocation();
  const { language } = location.query;

  const filteredProfiles = profiles.filter((p) => p.language === language);
  const isComparable = filteredProfiles.length > 1;

  const { hasFeature } = useAvailableFeatures();

  const hasAicaFeature = hasFeature(Feature.AiCodeAssurance);
  const showAicaIntro = Boolean(
    hasAicaFeature && addons.aica?.isQualityProfileRecommendedForAI?.(profile),
  );

  const getDocUrl = useDocUrl();

  return (
    <Layout.PageGrid width="fluid">
      <Helmet defer={false} title={helmetTitle} />

      <Layout.PageHeader
        actions={
          <Layout.PageHeader.Actions>
            <ProfileActions
              isComparable={isComparable}
              profile={profile}
              updateProfiles={updateProfiles}
            />
          </Layout.PageHeader.Actions>
        }
        breadcrumbs={
          <Layout.PageHeader.Breadcrumbs
            items={[
              { linkElement: <FormattedMessage id="quality_profiles.page" />, to: PROFILE_PATH },
              {
                linkElement: profile.languageName,
                to: getProfilesForLanguagePath(profile.language),
              },
              { linkElement: profile.name, to: getProfilePath(profile.name, profile.language) },
              ...additionalBreadcrumbs,
            ]}
          />
        }
        className="it__quality-profiles__header"
        description={
          profile.isBuiltIn && (
            <FormattedMessage
              id={
                showAicaIntro
                  ? 'quality_profiles.built_in.aica_description'
                  : 'quality_profiles.built_in.description'
              }
              values={{
                aica: (text) => <Text>{text}</Text>,
                link: (text) => (
                  <Link
                    enableOpenInNewTab
                    highlight={LinkHighlight.CurrentColor}
                    to={getDocUrl(DocLink.AiCodeAssuranceProfiles)}
                  >
                    {text}
                  </Link>
                ),
              }}
            />
          )
        }
        metadata={
          !hideMetadata && (
            <Layout.PageHeader.Metadata className="sw-gap-3">
              <div>
                <strong className="sw-typo-semibold">
                  <FormattedMessage id="quality_profiles.updated_" />
                </strong>{' '}
                <DateFromNow date={profile.rulesUpdatedAt} />
              </div>

              <div>
                <strong className="sw-typo-semibold">
                  <FormattedMessage id="quality_profiles.used_" />
                </strong>{' '}
                <DateFromNow date={profile.lastUsed} />
              </div>

              {!hideChangelogLink && (
                <div>
                  <LinkStandalone
                    className="it__quality-profiles__changelog"
                    to={getProfileChangelogPath(profile.name, profile.language)}
                  >
                    <FormattedMessage id="see_changelog" />
                  </LinkStandalone>
                </div>
              )}
            </Layout.PageHeader.Metadata>
          )
        }
        title={
          <Layout.PageHeader.Title
            suffix={
              <div className="sw-flex sw-items-center sw-ml-2 sw-gap-2">
                {profile.isBuiltIn && <BuiltInQualityProfileBadge tooltip={false} />}
                {profile.isDefault && (
                  <Badge variety="neutral">
                    <FormattedMessage id="default" />
                  </Badge>
                )}
                {isDefined(addons.aica?.ProfileRecommendedForAiIcon) && hasAicaFeature && (
                  <addons.aica.ProfileRecommendedForAiIcon profile={profile} />
                )}
              </div>
            }
          >
            {profile.name}
          </Layout.PageHeader.Title>
        }
      />

      <Layout.PageContent>{children}</Layout.PageContent>

      <GlobalFooter />
    </Layout.PageGrid>
  );
}

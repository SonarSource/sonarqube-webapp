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

import {
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  Card,
  Heading,
  IconEdit,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { groupBy, orderBy } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import {
  ActionCell,
  ContentCell,
  LargeCenteredLayout,
  Link,
  Table,
  TableRow,
  TableRowInteractive,
} from '~design-system';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import { Component } from '~sq-server-commons/types/types';
import BuiltInQualityProfileBadge from '../quality-profiles/components/BuiltInQualityProfileBadge';
import AddLanguageModal from './components/AddLanguageModal';
import SetQualityProfileModal from './components/SetQualityProfileModal';
import { ProjectProfile } from './types';

export interface ProjectQualityProfilesAppRendererProps {
  allProfiles?: BaseProfile[];
  component: Component;
  loading: boolean;
  onAddLanguage: (key: string) => Promise<void>;
  onCloseModal: () => void;
  onOpenAddLanguageModal: () => void;
  onOpenSetProfileModal: (projectProfile: ProjectProfile) => void;
  onSetProfile: (newKey: string | undefined, oldKey: string) => Promise<void>;
  projectProfiles?: ProjectProfile[];
  showAddLanguageModal?: boolean;
  showProjectProfileInModal?: ProjectProfile;
}

const ProfileAICodeSuggestionBanner =
  addons.aica?.ProfileAICodeSuggestionBanner || (() => undefined);

export default function ProjectQualityProfilesAppRenderer(
  props: Readonly<ProjectQualityProfilesAppRendererProps>,
) {
  const {
    allProfiles,
    component,
    loading,
    showProjectProfileInModal,
    projectProfiles,
    showAddLanguageModal,
  } = props;

  const { hasFeature } = useAvailableFeatures();
  const profilesByLanguage = groupBy(allProfiles, 'language');
  const orderedProfiles = orderBy(projectProfiles, (p) => p.profile.languageName);
  const hasAICAFeature = hasFeature(Feature.AiCodeAssurance);

  const COLUMN_WIDTHS_WITH_PURGE_SETTING = ['auto', 'auto', 'auto', '5%'];

  const header = (
    <TableRow>
      <ContentCell>{translate('language')}</ContentCell>
      <ContentCell>{translate('project_quality_profile.current')}</ContentCell>
      <ContentCell>{translate('coding_rules.filters.activation.active_rules')}</ContentCell>
      <ActionCell>{translate('actions')}</ActionCell>
    </TableRow>
  );

  return (
    <LargeCenteredLayout id="project-quality-profiles">
      <div className="sw-my-8">
        <Suggestions suggestion={DocLink.InstanceAdminQualityProfiles} />
        <Helmet defer={false} title={translate('project_quality_profile.page')} />
        <A11ySkipTarget anchor="profiles_main" />

        <Heading as="h1">
          <FormattedMessage id="project_quality_profile.page" />
        </Heading>
        <Text as="p" className="sw-mt-4">
          <FormattedMessage id="project_quality_profile.page.description" />
        </Text>

        {hasAICAFeature && (
          <ProfileAICodeSuggestionBanner
            component={component}
            profiles={projectProfiles?.map((p) => p.profile) ?? []}
          />
        )}

        <Spinner isLoading={loading}>
          {!loading && orderedProfiles.length > 0 && (
            <Card className="sw-mt-6">
              <Card.Header
                description={
                  <FormattedMessage id="project_quality_profile.profiles_by_languages.description" />
                }
                title={<FormattedMessage id="project_quality_profile.profiles_by_languages" />}
              />
              <Card.Body className="sw-px-2">
                <Table
                  columnCount={COLUMN_WIDTHS_WITH_PURGE_SETTING.length}
                  columnWidths={COLUMN_WIDTHS_WITH_PURGE_SETTING}
                  header={header}
                  noHeaderTopBorder
                >
                  {orderedProfiles.map((projectProfile) => {
                    const { profile, selected } = projectProfile;

                    return (
                      <TableRowInteractive key={profile.language}>
                        <ContentCell>
                          <span>{profile.languageName}</span>
                        </ContentCell>
                        <ContentCell>
                          <span>
                            {!selected && profile.isDefault && (
                              <em className="sw-mr-1">
                                <FormattedMessage id="project_quality_profile.instance_default" />
                              </em>
                            )}
                            {profile.name}
                            {profile.isBuiltIn && (
                              <BuiltInQualityProfileBadge className="sw-ml-1" />
                            )}
                            {hasAICAFeature &&
                              isDefined(addons.aica?.ProfileRecommendedForAiIcon) && (
                                <addons.aica.ProfileRecommendedForAiIcon profile={profile} />
                              )}
                          </span>
                        </ContentCell>
                        <ContentCell>
                          <Link to={getRulesUrl({ activation: 'true', qprofile: profile.key })}>
                            {profile.activeRuleCount}
                          </Link>
                        </ContentCell>

                        <ActionCell>
                          <ButtonIcon
                            Icon={IconEdit}
                            ariaLabel={translateWithParameters(
                              'project_quality_profile.change_profile_x',
                              profile.languageName,
                            )}
                            onClick={() => {
                              props.onOpenSetProfileModal(projectProfile);
                            }}
                            size={ButtonSize.Medium}
                            variety={ButtonVariety.DefaultGhost}
                          />
                        </ActionCell>
                      </TableRowInteractive>
                    );
                  })}
                </Table>
              </Card.Body>
            </Card>
          )}

          <Card className="sw-mt-6 sw-p-4 sw-flex-row sw-items-center sw-justify-between">
            <div>
              <Heading as="h3">
                <FormattedMessage id="project_quality_profile.add_language.title" />
              </Heading>
              <Text as="p">
                <FormattedMessage id="project_quality_profile.add_language.description" />
              </Text>
            </div>
            <Button onClick={props.onOpenAddLanguageModal} variety={ButtonVariety.Primary}>
              <FormattedMessage id="project_quality_profile.add_language.action" />
            </Button>
          </Card>
        </Spinner>
        {showAddLanguageModal && projectProfiles && (
          <AddLanguageModal
            onClose={props.onCloseModal}
            onSubmit={props.onAddLanguage}
            profilesByLanguage={profilesByLanguage}
            unavailableLanguages={projectProfiles.map((p) => p.profile.language)}
          />
        )}
        {showProjectProfileInModal && (
          <SetQualityProfileModal
            availableProfiles={profilesByLanguage[showProjectProfileInModal.profile.language]}
            component={component}
            currentProfile={showProjectProfileInModal.profile}
            onClose={props.onCloseModal}
            onSubmit={props.onSetProfile}
            usesDefault={!showProjectProfileInModal.selected}
          />
        )}
      </div>
    </LargeCenteredLayout>
  );
}

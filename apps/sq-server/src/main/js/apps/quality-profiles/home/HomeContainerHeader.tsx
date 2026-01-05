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
  Layout,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { Actions } from '~sq-server-commons/api/quality-profiles';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { getProfilePath } from '~sq-server-commons/helpers/urls';
import { Feature } from '~sq-server-commons/types/features';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import CreateProfileForm from './CreateProfileForm';
import RestoreProfileForm from './RestoreProfileForm';

interface Props {
  actions: Actions;
  languages: Array<{ key: string; name: string }>;
  profiles: Profile[];
  updateProfiles: () => Promise<void>;
}

export function HomeContainerHeader(props: Readonly<Props>) {
  const { actions, languages, profiles } = props;
  const intl = useIntl();
  const location = useLocation();
  const { hasFeature } = useAvailableFeatures();
  const router = useRouter();

  const handleCreate = (profile: Profile) => {
    props.updateProfiles().then(
      () => {
        router.push(getProfilePath(profile.name, profile.language));
      },
      () => {},
    );
  };

  const showAICA = isDefined(addons.aica) && hasFeature(Feature.AiCodeAssurance);

  return (
    <Layout.PageHeader
      actions={
        actions.create && (
          <div className="sw-flex sw-flex-col sw-items-end sw-justify-center">
            <Layout.PageHeader.Actions>
              <CreateProfileForm
                languages={languages}
                location={location}
                onCreate={handleCreate}
                profiles={profiles}
              >
                <Button
                  id="quality-profiles-create"
                  isDisabled={languages.length === 0}
                  variety={ButtonVariety.Primary}
                >
                  {intl.formatMessage({ id: 'create' })}
                </Button>
              </CreateProfileForm>

              <RestoreProfileForm onRestore={props.updateProfiles}>
                <Button id="quality-profiles-restore">
                  {intl.formatMessage({ id: 'restore' })}
                </Button>
              </RestoreProfileForm>
            </Layout.PageHeader.Actions>

            {languages.length === 0 && (
              <MessageCallout className="sw-mt-2" variety={MessageVariety.Warning}>
                {intl.formatMessage({ id: 'quality_profiles.no_languages_available' })}
              </MessageCallout>
            )}
          </div>
        )
      }
      description={
        <Layout.PageHeader.Description>
          <FormattedMessage
            id="quality_profiles.intro"
            values={{
              link: (text) => (
                <DocumentationLink
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={DocLink.InstanceAdminQualityProfiles}
                >
                  {text}
                </DocumentationLink>
              ),
              p1: (text) =>
                showAICA ? (
                  <Text as="p" className="sw-mt-4 sw-max-w-full">
                    {text}
                  </Text>
                ) : null,
              p2: (text) => (
                <Text as="p" className="sw-mt-4">
                  {text}
                </Text>
              ),
            }}
          />
        </Layout.PageHeader.Description>
      }
      title={
        <Layout.PageHeader.Title>
          <FormattedMessage id="quality_profiles.page" />
        </Layout.PageHeader.Title>
      }
    />
  );
}

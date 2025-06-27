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
  ButtonGroup,
  ButtonVariety,
  Heading,
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
import { translate } from '~sq-server-commons/helpers/l10n';
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

export default function PageHeader(props: Readonly<Props>) {
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
    <header className="sw-grid sw-grid-cols-3 sw-gap-12">
      <div className="sw-col-span-2">
        <Heading as="h1" hasMarginBottom>
          {translate('quality_profiles.page')}
        </Heading>

        <div className="sw-typo-default">
          <FormattedMessage
            id="quality_profiles.intro"
            values={{
              link: (text) => (
                <DocumentationLink
                  highlight={LinkHighlight.CurrentColor}
                  shouldOpenInNewTab
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
        </div>
      </div>

      {actions.create && (
        <div className="sw-flex sw-flex-col sw-items-end">
          <ButtonGroup>
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
              <Button id="quality-profiles-restore">{intl.formatMessage({ id: 'restore' })}</Button>
            </RestoreProfileForm>
          </ButtonGroup>

          {languages.length === 0 && (
            <MessageCallout className="sw-mt-2" variety={MessageVariety.Warning}>
              {intl.formatMessage({ id: 'quality_profiles.no_languages_available' })}
            </MessageCallout>
          )}
        </div>
      )}
    </header>
  );
}

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
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { FlagMessage } from '~design-system';
import { Actions } from '~sq-server-shared/api/quality-profiles';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { translate } from '~sq-server-shared/helpers/l10n';
import { getProfilePath } from '~sq-server-shared/helpers/urls';
import { useLocation, useRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { Profile } from '~sq-server-shared/types/quality-profiles';
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
  const router = useRouter();

  const [modal, setModal] = React.useState<'' | 'createProfile' | 'restoreProfile'>('');

  const handleCreate = (profile: Profile) => {
    props.updateProfiles().then(
      () => {
        router.push(getProfilePath(profile.name, profile.language));
      },
      () => {},
    );
  };

  const closeModal = () => setModal('');

  return (
    <header className="sw-grid sw-grid-cols-3 sw-gap-12">
      <div className="sw-col-span-2">
        <Heading as="h1" hasMarginBottom>
          {translate('quality_profiles.page')}
        </Heading>

        <div className="sw-typo-default">
          {intl.formatMessage(
            { id: 'quality_profiles.intro' },
            {
              link: (text) => (
                <DocumentationLink
                  highlight={LinkHighlight.CurrentColor}
                  shouldOpenInNewTab
                  to={DocLink.InstanceAdminQualityProfiles}
                >
                  {text}
                </DocumentationLink>
              ),
            },
          )}
        </div>
      </div>

      {actions.create && (
        <div className="sw-flex sw-flex-col sw-items-end">
          <ButtonGroup>
            <Button
              id="quality-profiles-create"
              isDisabled={languages.length === 0}
              onClick={() => setModal('createProfile')}
              variety={ButtonVariety.Primary}
            >
              {intl.formatMessage({ id: 'create' })}
            </Button>

            <Button id="quality-profiles-restore" onClick={() => setModal('restoreProfile')}>
              {intl.formatMessage({ id: 'restore' })}
            </Button>
          </ButtonGroup>

          {languages.length === 0 && (
            <FlagMessage className="sw-mt-2" variant="warning">
              {intl.formatMessage({ id: 'quality_profiles.no_languages_available' })}
            </FlagMessage>
          )}
        </div>
      )}

      {modal === 'restoreProfile' && (
        <RestoreProfileForm onClose={closeModal} onRestore={props.updateProfiles} />
      )}

      {modal === 'createProfile' && (
        <CreateProfileForm
          languages={languages}
          location={location}
          onClose={closeModal}
          onCreate={handleCreate}
          profiles={profiles}
        />
      )}
    </header>
  );
}

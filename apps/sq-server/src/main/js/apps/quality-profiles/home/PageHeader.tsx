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
  MessageType,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { Actions } from '~sq-server-commons/api/quality-profiles';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getProfilePath } from '~sq-server-commons/helpers/urls';
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
  const router = useRouter();

  const handleCreate = (profile: Profile) => {
    props.updateProfiles().then(
      () => {
        router.push(getProfilePath(profile.name, profile.language));
      },
      () => {},
    );
  };

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
            <MessageCallout
              className="sw-mt-2"
              text={intl.formatMessage({ id: 'quality_profiles.no_languages_available' })}
              type={MessageType.Warning}
            />
          )}
        </div>
      )}
    </header>
  );
}

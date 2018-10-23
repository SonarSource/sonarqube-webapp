/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import IdentityProviderLink from '../../../components/ui/IdentityProviderLink';
import Step from '../../tutorials/components/Step';
import { translate } from '../../../helpers/l10n';
import { AlmApplication } from '../../../app/types';
import { Alert } from '../../../components/ui/Alert';

interface Props {
  almApplication: AlmApplication;
  almInstallId?: string;
}

export default class ChooseRemoteOrganizationStep extends React.PureComponent<Props> {
  renderForm = () => {
    const { almApplication, almInstallId } = this.props;
    return (
      <div className="boxed-group-inner">
        {almInstallId && (
          <Alert className="markdown big-spacer-bottom width-60" variant="error">
            {translate('onboarding.import_organization.org_not_found')}
            <ul>
              <li>{translate('onboarding.import_organization.org_not_found.tips_1')}</li>
              <li>{translate('onboarding.import_organization.org_not_found.tips_2')}</li>
            </ul>
          </Alert>
        )}
        <IdentityProviderLink
          className="display-inline-block"
          identityProvider={almApplication}
          small={true}
          url={almApplication.installationUrl}>
          {translate(
            'onboarding.import_organization.choose_organization_button',
            almApplication.key
          )}
        </IdentityProviderLink>
      </div>
    );
  };

  renderResult = () => {
    return null;
  };

  render() {
    return (
      <Step
        finished={false}
        onOpen={() => {}}
        open={true}
        renderForm={this.renderForm}
        renderResult={this.renderResult}
        stepNumber={1}
        stepTitle={translate('onboarding.import_organization.import_org_details')}
      />
    );
  }
}

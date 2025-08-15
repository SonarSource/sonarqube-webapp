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

import { Button, ButtonVariety, Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FlagMessage, Modal, PageContentFontWrapper } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  AlmBindingDefinition,
  AlmKeys,
  AzureBindingDefinition,
  BitbucketCloudBindingDefinition,
  BitbucketServerBindingDefinition,
  GithubBindingDefinition,
  GitlabBindingDefinition,
} from '~sq-server-commons/types/alm-settings';
import AzureForm from './AzureForm';
import BitbucketForm from './BitbucketForm';
import GithubForm from './GithubForm';
import GitlabForm from './GitlabForm';

export interface Props {
  alm: AlmKeys;
  bitbucketVariant?: AlmKeys.BitbucketServer | AlmKeys.BitbucketCloud;
  canSubmit: boolean;
  errorListElementRef: React.RefObject<HTMLDivElement>;
  formData: AlmBindingDefinition;
  isUpdate: boolean;
  onBitbucketVariantChange: (
    bitbucketVariant: AlmKeys.BitbucketServer | AlmKeys.BitbucketCloud,
  ) => void;
  onCancel: () => void;
  onFieldChange: (fieldId: keyof AlmBindingDefinition, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  validationError?: string;
}

export default class AlmBindingDefinitionFormRenderer extends React.PureComponent<Readonly<Props>> {
  renderForm = () => {
    const { alm, formData, isUpdate, bitbucketVariant } = this.props;

    switch (alm) {
      case AlmKeys.GitLab:
        return (
          <GitlabForm
            formData={formData as GitlabBindingDefinition}
            onFieldChange={this.props.onFieldChange}
          />
        );
      case AlmKeys.Azure:
        return (
          <AzureForm
            formData={formData as AzureBindingDefinition}
            onFieldChange={this.props.onFieldChange}
          />
        );
      case AlmKeys.GitHub:
        return (
          <GithubForm
            formData={formData as GithubBindingDefinition}
            onFieldChange={this.props.onFieldChange}
          />
        );
      case AlmKeys.BitbucketServer:
        return (
          <BitbucketForm
            formData={
              formData as BitbucketServerBindingDefinition | BitbucketCloudBindingDefinition
            }
            isUpdate={isUpdate}
            onFieldChange={this.props.onFieldChange}
            onVariantChange={this.props.onBitbucketVariantChange}
            variant={bitbucketVariant}
          />
        );
      default:
        return null;
    }
  };

  render() {
    const { isUpdate, canSubmit, submitting, validationError, errorListElementRef } = this.props;
    const header = translate('settings.almintegration.form.header', isUpdate ? 'edit' : 'create');
    const FORM_ID = `settings.almintegration.form.${isUpdate ? 'edit' : 'create'}`;

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      this.props.onSubmit();
    };

    const formBody = (
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <PageContentFontWrapper className="sw-typo-default" ref={errorListElementRef}>
          {validationError && !canSubmit && (
            <FlagMessage className="sw-w-full sw-mb-2" variant="error">
              <div>
                <p>{translate('settings.almintegration.configuration_invalid')}</p>
                <ul>
                  <li>{validationError}</li>
                </ul>
              </div>
            </FlagMessage>
          )}
          {this.renderForm()}
        </PageContentFontWrapper>
      </form>
    );

    return (
      <Modal
        body={formBody}
        headerTitle={header}
        isScrollable
        onClose={this.props.onCancel}
        primaryButton={
          <>
            <Spinner isLoading={submitting} />
            <Button
              form={FORM_ID}
              hasAutoFocus
              isDisabled={!canSubmit || submitting}
              type="submit"
              variety={ButtonVariety.Primary}
            >
              {translate('settings.almintegration.form.save')}
            </Button>
          </>
        }
        secondaryButtonLabel={translate('cancel')}
      />
    );
  }
}

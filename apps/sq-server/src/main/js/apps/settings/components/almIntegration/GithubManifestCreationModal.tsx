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
  Checkbox,
  Modal,
  ModalSize,
  Text,
  TextInput,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCreateGithubConfigurationFromManifestMutation } from '~sq-server-commons/queries/alm-settings';

export type ManifestScope = 'devops' | 'auth';

interface Props {
  onClose: () => void;
  primaryScope: ManifestScope;
}

const FORM_ID = 'github-manifest-creation-form';

/**
 * Submits the GitHub App manifest to GitHub via a real top-level form POST so that GitHub creates
 * the App and redirects the browser back to SonarQube's manifest callback.
 */
function submitManifestToGithub(githubAppUrl: string, manifest: string, state: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${githubAppUrl}?state=${encodeURIComponent(state)}`;

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'manifest';
  input.value = manifest;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
}

export default function GithubManifestCreationModal({ onClose, primaryScope }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const [key, setKey] = React.useState('');
  const [keyEdited, setKeyEdited] = React.useState(false);
  const [organization, setOrganization] = React.useState('');
  const [alsoSetupOther, setAlsoSetupOther] = React.useState(false);

  const { mutateAsync: createConfiguration, isPending: submitting } =
    useCreateGithubConfigurationFromManifestMutation();

  const isDevopsPrimary = primaryScope === 'devops';
  const devops = isDevopsPrimary || alsoSetupOther;
  const auth = !isDevopsPrimary || alsoSetupOther;
  // The configuration key only applies to the DevOps Platform integration.
  const keyRequired = devops;
  const canSubmit = !keyRequired || key.trim() !== '';

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setOrganization(value);
    // Auto-suggest the configuration name from the GitHub organization until the user edits it.
    if (!keyEdited) {
      setKey(value);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.currentTarget.value);
    setKeyEdited(true);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { githubAppUrl, manifest, state } = await createConfiguration({
        auth,
        devops,
        key: devops ? key.trim() : undefined,
        organization: organization.trim() || undefined,
      });
      // Navigates away to GitHub.
      submitManifestToGithub(githubAppUrl, manifest, state);
    } catch {
      // The error is surfaced globally by the mutation; keep the modal open so the user can retry.
    }
  };

  const configurationNameField = keyRequired && (
    <div className="sw-mb-6">
      <TextInput
        helpText={formatMessage({ id: 'settings.almintegration.github.manifest.name.help' })}
        id="github-manifest-key"
        isRequired
        label={formatMessage({ id: 'settings.almintegration.form.name.github' })}
        maxLength={200}
        onChange={handleKeyChange}
        placeholder={formatMessage({
          id: 'settings.almintegration.github.manifest.name.placeholder',
        })}
        type="text"
        value={key}
        width="full"
      />
    </div>
  );

  const body = (
    <form
      id={FORM_ID}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <Text as="p" className="sw-mb-6" isSubtle>
        <FormattedMessage id="settings.almintegration.github.manifest.info" />
      </Text>

      <div className="sw-mb-6">
        <TextInput
          helpText={formatMessage({
            id: 'settings.almintegration.github.manifest.organization.help',
          })}
          id="github-manifest-organization"
          label={formatMessage({ id: 'settings.almintegration.github.manifest.organization' })}
          maxLength={200}
          onChange={handleOrganizationChange}
          placeholder={formatMessage({
            id: 'settings.almintegration.github.manifest.organization.placeholder',
          })}
          type="text"
          value={organization}
          width="full"
        />
      </div>

      {isDevopsPrimary && configurationNameField}

      <div className="sw-mb-6">
        <Checkbox
          checked={alsoSetupOther}
          label={formatMessage(
            isDevopsPrimary
              ? { id: 'settings.almintegration.github.manifest.also_auth' }
              : { id: 'settings.almintegration.github.manifest.also_devops' },
          )}
          onCheck={(checked) => {
            setAlsoSetupOther(checked === true);
          }}
        />
      </div>

      {!isDevopsPrimary && configurationNameField}
    </form>
  );

  return (
    <Modal
      content={body}
      isOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      primaryButton={
        <Button
          form={FORM_ID}
          isDisabled={!canSubmit || submitting}
          isLoading={submitting}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="settings.almintegration.github.manifest.continue" />
        </Button>
      }
      secondaryButton={
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
      }
      size={ModalSize.Default}
      title={formatMessage({ id: 'settings.almintegration.github.manifest.title' })}
    />
  );
}

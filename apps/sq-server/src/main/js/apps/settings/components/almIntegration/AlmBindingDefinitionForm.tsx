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

import { useCallback, useRef, useState } from 'react';
import { deleteConfiguration, validateAlmSettings } from '~sq-server-commons/api/alm-settings';
import {
  useCreateAzureConfigurationMutation,
  useCreateBitbucketCloudConfigurationMutation,
  useCreateBitbucketServerConfigurationMutation,
  useCreateGithubConfigurationMutation,
  useCreateGitlabConfigurationMutation,
  useUpdateAzureConfigurationMutation,
  useUpdateBitbucketCloudConfigurationMutation,
  useUpdateBitbucketServerConfigurationMutation,
  useUpdateGithubConfigurationMutation,
  useUpdateGitlabConfigurationMutation,
} from '~sq-server-commons/queries/alm-settings';
import {
  AlmBindingDefinition,
  AlmBindingDefinitionBase,
  AlmKeys,
  AzureBindingDefinition,
  BitbucketCloudBindingDefinition,
  BitbucketServerBindingDefinition,
  GithubBindingDefinition,
  GitlabBindingDefinition,
  isBitbucketCloudBindingDefinition,
} from '~sq-server-commons/types/alm-settings';
import { BITBUCKET_CLOUD_WORKSPACE_ID_FORMAT } from '../../constants';
import AlmBindingDefinitionFormRenderer from './AlmBindingDefinitionFormRenderer';

export interface AlmBindingDefinitionFormProps {
  afterSubmit: (data: AlmBindingDefinitionBase) => void;
  alm: AlmKeys;
  bindingDefinition?: AlmBindingDefinition;
  enforceValidation?: boolean;
  onCancel: () => void;
}

const BINDING_PER_ALM: {
  [key in AlmKeys]: {
    defaultBinding: AlmBindingDefinition;
    optionalFields: Record<string, boolean>;
  };
} = {
  [AlmKeys.Azure]: {
    defaultBinding: { key: '', personalAccessToken: '', url: '' } as AzureBindingDefinition,
    optionalFields: {},
  },
  [AlmKeys.GitHub]: {
    defaultBinding: {
      key: '',
      appId: '',
      clientId: '',
      clientSecret: '',
      url: '',
      privateKey: '',
      webhookSecret: '',
    } as GithubBindingDefinition,
    optionalFields: { webhookSecret: true },
  },
  [AlmKeys.GitLab]: {
    defaultBinding: { key: '', personalAccessToken: '', url: '' } as GitlabBindingDefinition,
    optionalFields: {},
  },
  [AlmKeys.BitbucketServer]: {
    defaultBinding: {
      key: '',
      url: '',
      personalAccessToken: '',
    } as BitbucketServerBindingDefinition,
    optionalFields: {},
  },
  [AlmKeys.BitbucketCloud]: {
    defaultBinding: {
      key: '',
      clientId: '',
      clientSecret: '',
      workspace: '',
    } as BitbucketCloudBindingDefinition,
    optionalFields: {},
  },
};

export function AlmBindingDefinitionForm(props: Readonly<AlmBindingDefinitionFormProps>) {
  const { alm, bindingDefinition, enforceValidation, afterSubmit, onCancel } = props;

  const [bitbucketVariant, setBitbucketVariant] = useState<
    AlmKeys.BitbucketServer | AlmKeys.BitbucketCloud | undefined
  >(() => {
    if (bindingDefinition && alm === AlmKeys.BitbucketServer) {
      return isBitbucketCloudBindingDefinition(bindingDefinition)
        ? AlmKeys.BitbucketCloud
        : AlmKeys.BitbucketServer;
    }
    return undefined;
  });

  const [formData, setFormData] = useState<AlmBindingDefinition>(
    () => bindingDefinition ?? BINDING_PER_ALM[bitbucketVariant ?? alm].defaultBinding,
  );
  const [touched, setTouched] = useState(false);
  const [alreadySavedFormData, setAlreadySavedFormData] = useState<AlmBindingDefinition>();
  const [validationError, setValidationError] = useState<string>();
  const [validating, setValidating] = useState(false);
  const errorListElement = useRef<HTMLDivElement>(null);

  const mutationsByAlm = {
    [AlmKeys.Azure]: {
      createMutation: useCreateAzureConfigurationMutation(),
      updateMutation: useUpdateAzureConfigurationMutation(),
    },
    [AlmKeys.GitHub]: {
      createMutation: useCreateGithubConfigurationMutation(),
      updateMutation: useUpdateGithubConfigurationMutation(),
    },
    [AlmKeys.GitLab]: {
      createMutation: useCreateGitlabConfigurationMutation(),
      updateMutation: useUpdateGitlabConfigurationMutation(),
    },
    [AlmKeys.BitbucketServer]: {
      createMutation: useCreateBitbucketServerConfigurationMutation(),
      updateMutation: useUpdateBitbucketServerConfigurationMutation(),
    },
    [AlmKeys.BitbucketCloud]: {
      createMutation: useCreateBitbucketCloudConfigurationMutation(),
      updateMutation: useUpdateBitbucketCloudConfigurationMutation(),
    },
  };

  // apiAlm is only known at runtime, so TS widens createMutation/updateMutation's payload to the
  // union of every ALM's shape; the `as never` casts below tell it to trust the runtime dispatch.
  const apiAlm = bitbucketVariant ?? alm;
  const { createMutation, updateMutation } = mutationsByAlm[apiAlm];
  const submitting = createMutation.isPending || updateMutation.isPending || validating;

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormData((current) => ({ ...current, [fieldId]: value }));
    setTouched(true);
  }, []);

  const handleFormSubmit = useCallback(async () => {
    try {
      if (alreadySavedFormData && validationError) {
        await updateMutation.mutateAsync({
          newKey: formData.key,
          ...formData,
          key: alreadySavedFormData.key,
        } as never);
      } else if (bindingDefinition?.key) {
        await updateMutation.mutateAsync({
          newKey: formData.key,
          ...formData,
          key: bindingDefinition.key,
        } as never);
      } else {
        await createMutation.mutateAsync({ ...formData } as never);
      }

      setAlreadySavedFormData(formData);

      let error: string | undefined;

      if (enforceValidation) {
        setValidating(true);
        try {
          error = await validateAlmSettings(formData.key);
        } finally {
          setValidating(false);
        }
      }

      if (error) {
        setValidationError(error);
        errorListElement.current?.scrollIntoView({ block: 'start' });
      } else {
        afterSubmit(formData);
      }
    } finally {
      setTouched(false);
    }
  }, [
    alreadySavedFormData,
    validationError,
    bindingDefinition,
    formData,
    enforceValidation,
    updateMutation,
    createMutation,
    afterSubmit,
  ]);

  const handleOnCancel = useCallback(async () => {
    if (alreadySavedFormData) {
      await deleteConfiguration(alreadySavedFormData.key);
    }

    onCancel();
  }, [alreadySavedFormData, onCancel]);

  const handleBitbucketVariantChange = useCallback(
    (variant: AlmKeys.BitbucketServer | AlmKeys.BitbucketCloud) => {
      setBitbucketVariant(variant);
      setFormData({ ...BINDING_PER_ALM[variant].defaultBinding });
    },
    [],
  );

  const allRequiredFieldsProvided =
    touched &&
    !Object.entries(formData)
      .filter(([key, _value]) => !BINDING_PER_ALM[alm].optionalFields[key])
      .some(([_key, value]) => !value);

  const canSubmit =
    bitbucketVariant === AlmKeys.BitbucketCloud && isBitbucketCloudBindingDefinition(formData)
      ? allRequiredFieldsProvided && BITBUCKET_CLOUD_WORKSPACE_ID_FORMAT.test(formData.workspace)
      : allRequiredFieldsProvided;

  return (
    <AlmBindingDefinitionFormRenderer
      alm={alm}
      bitbucketVariant={bitbucketVariant}
      canSubmit={canSubmit}
      errorListElementRef={errorListElement}
      formData={formData}
      isUpdate={!!bindingDefinition}
      onBitbucketVariantChange={handleBitbucketVariantChange}
      onCancel={() => {
        void handleOnCancel();
      }}
      onFieldChange={handleFieldChange}
      onSubmit={() => {
        void handleFormSubmit();
      }}
      submitting={submitting}
      validationError={validationError}
    />
  );
}

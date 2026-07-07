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

import { noop } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import {
  countBoundProjects,
  deleteConfiguration,
  getAlmDefinitions,
  validateAlmSettings,
} from '~sq-server-commons/api/alm-settings';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import {
  AlmBindingDefinitionBase,
  AlmKeys,
  AlmSettingsBindingDefinitions,
  AlmSettingsBindingStatus,
  AlmSettingsBindingStatusType,
} from '~sq-server-commons/types/alm-settings';
import { Feature } from '~sq-server-commons/types/features';
import AlmIntegrationRenderer from './AlmIntegrationRenderer';
import { useGithubManifestReturn } from './hooks/useGithubManifestReturn';

export type AlmTabs = AlmKeys.Azure | AlmKeys.GitHub | AlmKeys.GitLab | AlmKeys.BitbucketServer;

function getInitialAlmTab(alm: AlmKeys): AlmTabs {
  return alm === AlmKeys.BitbucketCloud ? AlmKeys.BitbucketServer : alm;
}

export default function AlmIntegration() {
  const location = useLocation();
  const router = useRouter();
  const { hasFeature } = useAvailableFeatures();

  useGithubManifestReturn();

  const [currentAlmTab, setCurrentAlmTab] = useState<AlmTabs>(() =>
    getInitialAlmTab((location.query.alm as AlmKeys | undefined) || AlmKeys.GitHub),
  );
  const [definitionKeyForDeletion, setDefinitionKeyForDeletion] = useState<string>();
  const [definitionStatus, setDefinitionStatus] = useState<
    Record<string, AlmSettingsBindingStatus>
  >({});
  const [definitions, setDefinitions] = useState<AlmSettingsBindingDefinitions>({
    [AlmKeys.Azure]: [],
    [AlmKeys.BitbucketServer]: [],
    [AlmKeys.BitbucketCloud]: [],
    [AlmKeys.GitHub]: [],
    [AlmKeys.GitLab]: [],
  });
  const [loadingAlmDefinitions, setLoadingAlmDefinitions] = useState(true);
  const [loadingProjectCount, setLoadingProjectCount] = useState(false);
  const [projectCount, setProjectCount] = useState<number>();

  const handleCheck = useCallback((definitionKey: string, alertSuccess = true) => {
    setDefinitionStatus((current) => ({
      ...current,
      [definitionKey]: {
        ...current[definitionKey],
        type: AlmSettingsBindingStatusType.Validating,
      },
    }));

    validateAlmSettings(definitionKey)
      .then(
        (failureMessage) => ({
          type: failureMessage
            ? AlmSettingsBindingStatusType.Failure
            : AlmSettingsBindingStatusType.Success,
          failureMessage,
        }),
        () => ({ type: AlmSettingsBindingStatusType.Warning, failureMessage: '' }),
      )
      .then(({ type, failureMessage }) => {
        setDefinitionStatus((current) => ({
          ...current,
          [definitionKey]: { alertSuccess, failureMessage, type },
        }));
      })
      .catch(noop);
  }, []);

  const fetchPullRequestDecorationSetting = useCallback(async () => {
    setLoadingAlmDefinitions(true);
    try {
      const definitions = await getAlmDefinitions();
      setDefinitions(definitions);
      return definitions;
    } catch {
      return undefined;
    } finally {
      setLoadingAlmDefinitions(false);
    }
  }, []);

  const handleConfirmDelete = useCallback(
    async (definitionKey: string) => {
      try {
        await deleteConfiguration(definitionKey);
        await fetchPullRequestDecorationSetting();
      } finally {
        setDefinitionKeyForDeletion(undefined);
        setProjectCount(undefined);
      }
    },
    [fetchPullRequestDecorationSetting],
  );

  const handleSelectAlm = useCallback(
    (almTab: AlmTabs) => {
      location.query.alm = almTab;
      location.hash = '';
      router.push(location);
      setCurrentAlmTab(almTab);
    },
    [location, router],
  );

  const handleCancelDelete = useCallback(() => {
    setDefinitionKeyForDeletion(undefined);
    setProjectCount(undefined);
  }, []);

  const handleDelete = useCallback(async (definitionKey: string) => {
    setLoadingProjectCount(true);
    try {
      const projectCount = (await countBoundProjects(definitionKey)) as number;
      setDefinitionKeyForDeletion(definitionKey);
      setProjectCount(projectCount);
    } catch {
      // Failing to count bound projects should not block the rest of the UI.
    } finally {
      setLoadingProjectCount(false);
    }
  }, []);

  const validateAllDefinitions = useCallback(
    (loadedDefinitions: AlmSettingsBindingDefinitions) => {
      [
        AlmKeys.Azure,
        AlmKeys.BitbucketCloud,
        AlmKeys.BitbucketServer,
        AlmKeys.GitHub,
        AlmKeys.GitLab,
      ].forEach((alm) => {
        loadedDefinitions[alm].forEach((def: AlmBindingDefinitionBase) => {
          handleCheck(def.key, false);
        });
      });
    },
    [handleCheck],
  );

  useEffect(() => {
    // Validate all alms on load:
    void fetchPullRequestDecorationSetting().then((definitions) => {
      if (definitions) {
        validateAllDefinitions(definitions);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current && location.query.alm) {
      setCurrentAlmTab(location.query.alm as AlmTabs);
    } else {
      didMountRef.current = true;
    }
  }, [location.query.alm]);

  return (
    <AlmIntegrationRenderer
      branchesEnabled={hasFeature(Feature.BranchSupport)}
      currentAlmTab={currentAlmTab}
      definitionKeyForDeletion={definitionKeyForDeletion}
      definitionStatus={definitionStatus}
      definitions={definitions}
      loadingAlmDefinitions={loadingAlmDefinitions}
      loadingProjectCount={loadingProjectCount}
      multipleAlmEnabled={hasFeature(Feature.MultipleAlm)}
      onCancelDelete={handleCancelDelete}
      onCheckConfiguration={handleCheck}
      onConfirmDelete={(definitionKey) => {
        void handleConfirmDelete(definitionKey);
      }}
      onDelete={(definitionKey) => {
        void handleDelete(definitionKey);
      }}
      onSelectAlmTab={handleSelectAlm}
      onUpdateDefinitions={() => {
        void fetchPullRequestDecorationSetting();
      }}
      projectCount={projectCount}
    />
  );
}

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

import { Button, FormFieldWidth, IconDelete, TextInput } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import * as React from 'react';
import { Card } from '~design-system';
import { doesComponentExists } from '~sq-server-shared/api/components';
import { PROJECT_KEY_MAX_LEN } from '~sq-server-shared/helpers/constants';
import { translate } from '~sq-server-shared/helpers/l10n';
import { validateProjectKey } from '~sq-server-shared/helpers/projects';
import { ProjectKeyValidationResult } from '~sq-server-shared/types/component';
import { PROJECT_NAME_MAX_LEN } from '../constants';
import { getSanitizedProjectKey } from '../utils';

interface Props<I> {
  initialKey?: string;
  initialName?: string;
  monorepoSetupProjectKeys?: string[];
  onChange: (project: ProjectData<I>) => void;
  onRemove?: () => void;
  projectId?: I;
}

interface State {
  key: string;
  keyError?: ProjectKeyErrors;
  keyTouched: boolean;
  name: string;
  nameError?: boolean;
  nameTouched: boolean;
}

export interface ProjectData<I = string> {
  hasError: boolean;
  id?: I;
  key: string;
  name: string;
  touched: boolean;
}

enum ProjectKeyErrors {
  DuplicateKey = 'DUPLICATE_KEY',
  MonorepoDuplicateKey = 'MONOREPO_DUPLICATE_KEY',
  WrongFormat = 'WRONG_FORMAT',
}

const DEBOUNCE_DELAY = 250;

export default function ProjectValidation<I>(props: Readonly<Props<I>>) {
  const {
    initialKey = '',
    initialName = '',
    monorepoSetupProjectKeys,
    onChange,
    projectId,
  } = props;
  const checkFreeKeyTimeout = React.useRef<NodeJS.Timeout | undefined>();
  const [project, setProject] = React.useState<State>({
    key: initialKey,
    name: initialName,
    keyTouched: false,
    nameTouched: false,
  });

  const { key, keyError, keyTouched, name, nameError, nameTouched } = project;

  React.useEffect(() => {
    onChange({
      hasError: keyError !== undefined || nameError !== undefined,
      id: projectId,
      key,
      name,
      touched: keyTouched || nameTouched,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, name, keyError, keyTouched, nameError, nameTouched]);

  const checkFreeKey = (keyVal: string) => {
    setProject((prevProject) => ({ ...prevProject, validatingKey: true }));

    doesComponentExists({ component: keyVal })
      .then((alreadyExist) => {
        setProject((prevProject) => {
          if (keyVal === prevProject.key) {
            return {
              ...prevProject,
              keyError: alreadyExist ? ProjectKeyErrors.DuplicateKey : undefined,
              validatingKey: false,
            };
          }
          return prevProject;
        });
      })
      .catch(() => {
        setProject((prevProject) => {
          if (keyVal === prevProject.key) {
            return {
              ...prevProject,
              keyError: undefined,
              validatingKey: false,
            };
          }
          return prevProject;
        });
      });
  };

  const handleProjectKeyChange = (projectKey: string, fromUI = false) => {
    const keyError = validateKey(projectKey);

    setProject((prevProject) => ({
      ...prevProject,
      key: projectKey,
      keyError,
      keyTouched: fromUI,
    }));
  };

  React.useEffect(() => {
    if (nameTouched && !keyTouched) {
      const sanitizedProjectKey = getSanitizedProjectKey(name);

      handleProjectKeyChange(sanitizedProjectKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, keyTouched]);

  React.useEffect(() => {
    if (!keyError && key !== '') {
      checkFreeKeyTimeout.current = setTimeout(() => {
        checkFreeKey(key);
        checkFreeKeyTimeout.current = undefined;
      }, DEBOUNCE_DELAY);
    }

    return () => {
      if (checkFreeKeyTimeout.current !== undefined) {
        clearTimeout(checkFreeKeyTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (
      (keyError === undefined || keyError === ProjectKeyErrors.MonorepoDuplicateKey) &&
      key !== ''
    ) {
      if (monorepoSetupProjectKeys?.indexOf(key) !== monorepoSetupProjectKeys?.lastIndexOf(key)) {
        setProject((prevProject) => ({
          ...prevProject,
          keyError: ProjectKeyErrors.MonorepoDuplicateKey,
        }));
      } else {
        setProject((prevProject) => {
          if (prevProject.keyError === ProjectKeyErrors.MonorepoDuplicateKey) {
            return {
              ...prevProject,
              keyError: undefined,
            };
          }

          return prevProject;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monorepoSetupProjectKeys]);

  const handleProjectNameChange = (projectName: string, fromUI = false) => {
    setProject({
      ...project,
      name: projectName,
      nameError: validateName(projectName),
      nameTouched: fromUI,
    });
  };

  const validateKey = (projectKey: string) => {
    const result = validateProjectKey(projectKey);
    if (result !== ProjectKeyValidationResult.Valid) {
      return ProjectKeyErrors.WrongFormat;
    }
    return undefined;
  };

  const validateName = (projectName: string) => {
    if (isEmpty(projectName)) {
      return true;
    }
    return undefined;
  };

  const getMessageInvalid = () => {
    if (
      keyError === ProjectKeyErrors.DuplicateKey ||
      keyError === ProjectKeyErrors.MonorepoDuplicateKey
    ) {
      return translate('onboarding.create_project.project_key.duplicate_key');
    }

    if (!isEmpty(key) && keyError === ProjectKeyErrors.WrongFormat) {
      return translate('onboarding.create_project.project_key.wrong_format');
    }

    return translate('onboarding.create_project.project_key.error.empty');
  };

  const touched = Boolean(keyTouched || nameTouched);
  const projectNameIsInvalid = nameTouched && nameError !== undefined;
  const projectKeyIsInvalid = touched && keyError !== undefined;
  const projectKeyInputId = projectId !== undefined ? `project-key-${projectId}` : 'project-key';
  const projectNameInputId = projectId !== undefined ? `project-name-${projectId}` : 'project-name';

  return (
    <>
      <TextInput
        id={projectNameInputId}
        className={classNames({
          'js__is-invalid': projectNameIsInvalid,
        })}
        width={FormFieldWidth.Large}
        helpToggletipProps={{
          description: translate('onboarding.create_project.display_name.description'),
        }}
        label={translate('onboarding.create_project.display_name')}
        minLength={1}
        maxLength={PROJECT_NAME_MAX_LEN}
        onChange={(e) => handleProjectNameChange(e.currentTarget.value, true)}
        type="text"
        value={name}
        autoFocus
        isRequired
        validation={projectNameIsInvalid ? 'invalid' : 'none'}
        messageInvalid={translate('onboarding.create_project.project_key.error.empty')}
      />

      <TextInput
        id={projectKeyInputId}
        className={classNames({
          'js__is-invalid': projectKeyIsInvalid,
        })}
        width={FormFieldWidth.Large}
        helpToggletipProps={{
          description: translate('onboarding.create_project.project_key.description'),
        }}
        label={translate('onboarding.create_project.project_key')}
        minLength={1}
        maxLength={PROJECT_KEY_MAX_LEN}
        onChange={(e) => handleProjectKeyChange(e.currentTarget.value, true)}
        type="text"
        value={key}
        isRequired
        validation={projectKeyIsInvalid ? 'invalid' : 'none'}
        messageInvalid={getMessageInvalid()}
        messageValid={translate('onboarding.create_project.project_key.valid')}
      />
    </>
  );
}

export function ProjectValidationCard<I>({
  initialKey,
  initialName,
  monorepoSetupProjectKeys,
  onChange,
  onRemove,
  projectId,
  ...cardProps
}: Readonly<
  Props<I> & Omit<React.ComponentPropsWithoutRef<typeof Card>, 'onChange' | 'children'>
>) {
  return (
    <Card {...cardProps}>
      <ProjectValidation
        initialKey={initialKey}
        initialName={initialName}
        monorepoSetupProjectKeys={monorepoSetupProjectKeys}
        onChange={onChange}
        projectId={projectId}
      />
      <Button className="sw-mt-4 sw-mr-4" prefix={<IconDelete />} onClick={onRemove} type="button">
        {translate('onboarding.create_project.monorepo.remove_project')}
      </Button>
    </Card>
  );
}

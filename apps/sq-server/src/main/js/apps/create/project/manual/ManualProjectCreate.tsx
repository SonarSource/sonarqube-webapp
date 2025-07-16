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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  Form,
  FormFieldWidth,
  IconX,
  MessageCallout,
  MessageVariety,
  TextInput,
} from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getValue } from '~sq-server-commons/api/settings';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { CreateProjectModes, ImportProjectParam } from '~sq-server-commons/types/create-project';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import ProjectValidation, { ProjectData } from '../components/ProjectValidation';

interface Props {
  branchesEnabled: boolean;
  onClose: () => void;
  onProjectSetupDone: (importProjects: ImportProjectParam) => void;
}

interface MainBranchState {
  mainBranchName: string;
  mainBranchNameError?: boolean;
  mainBranchNameTouched: boolean;
}

type ValidState = ProjectData & Required<Pick<ProjectData, 'key' | 'name'>>;

export default function ManualProjectCreate(props: Readonly<Props>) {
  const [mainBranch, setMainBranch] = React.useState<MainBranchState>({
    mainBranchName: 'main',
    mainBranchNameTouched: false,
  });
  const [project, setProject] = React.useState<ProjectData>({
    hasError: false,
    key: '',
    name: '',
    touched: false,
  });

  const intl = useIntl();

  React.useEffect(() => {
    async function fetchMainBranchName() {
      const { value: mainBranchName } =
        (await getValue({ key: GlobalSettingKeys.MainBranchName })) ?? {};

      if (mainBranchName !== undefined) {
        setMainBranch((prevBranchName) => ({
          ...prevBranchName,
          mainBranchName,
        }));
      }
    }

    fetchMainBranchName();
  }, []);

  const canSubmit = (
    mainBranch: MainBranchState,
    projectData: ProjectData,
  ): projectData is ValidState => {
    const { mainBranchName } = mainBranch;
    const { key, name, hasError } = projectData;
    return Boolean(!hasError && !isEmpty(key) && !isEmpty(name) && !isEmpty(mainBranchName));
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit(mainBranch, project)) {
      props.onProjectSetupDone({
        creationMode: CreateProjectModes.Manual,
        monorepo: false,
        projects: [
          {
            project: project.key,
            name: (project.name ?? project.key).trim(),
            mainBranch: mainBranchName,
          },
        ],
      });
    }
  };

  const handleBranchNameChange = (mainBranchName: string, fromUI = false) => {
    setMainBranch({
      mainBranchName,
      mainBranchNameError: validateMainBranchName(mainBranchName),
      mainBranchNameTouched: fromUI,
    });
  };

  const validateMainBranchName = (mainBranchName: string) => {
    if (isEmpty(mainBranchName)) {
      return true;
    }
    return undefined;
  };

  const { mainBranchName, mainBranchNameError, mainBranchNameTouched } = mainBranch;
  const { branchesEnabled } = props;

  const mainBranchNameIsInvalid = mainBranchNameTouched && mainBranchNameError !== undefined;

  return (
    <section
      aria-label={translate('onboarding.create_project.manual.title')}
      className="sw-typo-default"
    >
      <div className="sw-flex sw-justify-between">
        <FormattedMessage id="onboarding.create_project.manual.step1" />
        <ButtonIcon
          Icon={IconX}
          ariaLabel={intl.formatMessage({ id: 'clear' })}
          onClick={props.onClose}
          size={ButtonSize.Medium}
          variety={ButtonVariety.DefaultGhost}
        />
      </div>

      <Form className="sw-typo-default" id="create-project-manual" onSubmit={handleFormSubmit}>
        <Form.Header
          description={
            branchesEnabled && (
              <MessageCallout variety={MessageVariety.Info}>
                {translate('onboarding.create_project.pr_decoration.information')}
              </MessageCallout>
            )
          }
          title={translate('onboarding.create_project.manual.title')}
          titleAs="h1"
        />
        <Form.Section>
          <ProjectValidation onChange={setProject} />

          <TextInput
            className={classNames({
              'js__is-invalid': mainBranchNameIsInvalid,
            })}
            helpText={
              <FormattedMessage
                id="onboarding.create_project.main_branch_name.description"
                values={{
                  learn_more: (
                    <DocumentationLink enableOpenInNewTab to={DocLink.BranchAnalysis}>
                      {translate('learn_more')}
                    </DocumentationLink>
                  ),
                }}
              />
            }
            id="main-branch-name"
            isRequired
            label={translate('onboarding.create_project.main_branch_name')}
            messageInvalid={translate('onboarding.create_project.main_branch_name.error.empty')}
            minLength={1}
            onChange={(e) => {
              handleBranchNameChange(e.target.value, true);
            }}
            validation={mainBranchNameIsInvalid ? 'invalid' : 'none'}
            value={mainBranchName ?? ''}
            width={FormFieldWidth.Large}
          />
        </Form.Section>
        <Form.Footer>
          <Button onClick={props.onClose} type="button">
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button isDisabled={!canSubmit(mainBranch, project)} type="submit" variety="primary">
            {translate('next')}
          </Button>
        </Form.Footer>
      </Form>
    </section>
  );
}

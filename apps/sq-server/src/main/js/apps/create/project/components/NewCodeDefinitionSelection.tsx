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
  ButtonIcon,
  ButtonSize,
  ButtonVariety,
  Form,
  IconX,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  Text,
  toast,
} from '@sonarsource/echoes-react';
import { omit } from 'lodash';
import * as React from 'react';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, unstable_usePrompt as usePrompt } from 'react-router-dom';
import { addGlobalSuccessMessage } from '~design-system';
import { useLocation } from '~shared/components/hoc/withRouter';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import NewCodeDefinitionSelector from '~sq-server-commons/components/new-code-definition/NewCodeDefinitionSelector';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  MutationArg,
  useImportProjectMutation,
  useImportProjectProgress,
} from '~sq-server-commons/queries/import-projects';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { ImportProjectParam } from '~sq-server-commons/types/create-project';
import { NewCodeDefinitiondWithCompliance } from '~sq-server-commons/types/new-code-definition';

const listener = (event: BeforeUnloadEvent) => {
  event.returnValue = true;
};

interface Props {
  importProjects: ImportProjectParam;
  onClose: () => void;
  redirectTo: string;
}

export default function NewCodeDefinitionSelection(props: Props) {
  const { importProjects, redirectTo, onClose } = props;

  const toUrl = useDocUrl(DocLink.NewCodeDefinition);

  const [selectedDefinition, selectDefinition] = React.useState<NewCodeDefinitiondWithCompliance>();
  const [failedImports, setFailedImports] = React.useState<number>(0);
  const { mutateAsync, data, reset, isIdle } = useImportProjectMutation();
  const mutateCount = useImportProjectProgress();
  const isImporting = mutateCount > 0;
  const { formatMessage } = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  usePrompt({
    when: isImporting,
    message: translate('onboarding.create_project.please_dont_leave'),
  });

  const projectCount = importProjects.projects.length;
  const isMultipleProjects = projectCount > 1;
  const isMonorepo = location.query?.mono === 'true';

  useEffect(() => {
    const redirect = (projectCount: number) => {
      if (!isMonorepo && projectCount === 1 && data) {
        if (redirectTo === '/projects') {
          navigate(getProjectOverviewUrl(data.project.key));
        } else {
          onClose();
        }
      } else {
        navigate({
          pathname: '/projects',
          search: queryToSearchString({ sort: '-creation_date' }),
        });
      }
    };

    if (mutateCount > 0 || isIdle) {
      return;
    }

    if (failedImports > 0) {
      toast.error({
        description: (
          <FormattedMessage
            id="onboarding.create_project.failure"
            values={{ count: failedImports }}
          />
        ),
        duration: 'medium',
      });
    }

    if (projectCount > failedImports) {
      if (redirectTo === '/projects') {
        addGlobalSuccessMessage(
          formatMessage(
            {
              id: isMonorepo
                ? 'onboarding.create_project.monorepo.success'
                : 'onboarding.create_project.success',
            },
            {
              count: projectCount - failedImports,
            },
          ),
        );
      } else if (data) {
        addGlobalSuccessMessage(
          <FormattedMessage
            id="onboarding.create_project.success.admin"
            values={{
              project_link: (
                <Link to={getProjectOverviewUrl(data.project.key)}>{data.project.name}</Link>
              ),
            }}
          />,
        );
      }
      redirect(projectCount);
    }

    reset();
    setFailedImports(0);
  }, [
    data,
    projectCount,
    failedImports,
    formatMessage,
    mutateCount,
    reset,
    navigate,
    isIdle,
    redirectTo,
    isMonorepo,
    onClose,
  ]);

  React.useEffect(() => {
    if (isImporting) {
      window.addEventListener('beforeunload', listener);
    }

    return () => {
      window.removeEventListener('beforeunload', listener);
    };
  }, [isImporting]);

  const handleProjectCreation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedDefinition) {
      importProjects.projects.forEach((p) => {
        const arg = {
          // eslint-disable-next-line local-rules/use-metrickey-enum
          ...omit(importProjects, 'projects'),
          ...p,
        } as MutationArg;
        mutateAsync({
          newCodeDefinitionType: selectedDefinition.type,
          newCodeDefinitionValue: selectedDefinition.value,
          ...arg,
        }).catch(() => {
          setFailedImports((prev) => prev + 1);
        });
      });
    }
  };

  return (
    <GlobalPageTemplate
      hidePageHeader
      title={formatMessage({ id: 'onboarding.create_project.new_code_definition.title' })}
    >
      <section
        aria-label={formatMessage({
          id: 'onboarding.create_project.new_code_definition.title',
        })}
        className="sw-typo-default"
        id="project-ncd-selection"
      >
        <div className="sw-flex sw-justify-between">
          <FormattedMessage id="onboarding.create_project.manual.step2" />
          <ButtonIcon
            Icon={IconX}
            ariaLabel={formatMessage({ id: 'clear' })}
            onClick={onClose}
            size={ButtonSize.Medium}
            variety={ButtonVariety.DefaultGhost}
          />
        </div>
        <Form onSubmit={handleProjectCreation}>
          <Form.Header
            description={
              <>
                <Text as="p">
                  <FormattedMessage id="project_baseline.page.description" />
                </Text>
                <Text as="p" className="sw-mt-4">
                  <FormattedMessage
                    id="project_baseline.page.description2"
                    values={{
                      link: (text) => (
                        <Link
                          highlight={LinkHighlight.CurrentColor}
                          to="/admin/settings?category=new_code_period"
                        >
                          {text}
                        </Link>
                      ),
                    }}
                  />
                </Text>
                <Link
                  className="sw-block"
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={toUrl}
                >
                  <FormattedMessage id="learn_more_in_doc" />
                </Link>
              </>
            }
            title={
              <span id="selection-cards-label">
                <FormattedMessage
                  id="onboarding.create_x_project.new_code_definition.title"
                  values={{
                    count: projectCount,
                  }}
                />
              </span>
            }
            titleAs="h1"
          />
          <Form.Section>
            <NewCodeDefinitionSelector onNcdChanged={selectDefinition} />

            {isMultipleProjects && (
              <MessageCallout variety={MessageVariety.Info}>
                <FormattedMessage id="onboarding.create_projects.new_code_definition.change_info" />
              </MessageCallout>
            )}
          </Form.Section>
          <Form.Footer className="sw-mb-8">
            <Button
              onClick={() => {
                navigate(-1);
              }}
            >
              {translate('back')}
            </Button>
            <Button
              isDisabled={!selectedDefinition?.isCompliant || isImporting}
              isLoading={isImporting}
              type="submit"
              variety="primary"
            >
              <FormattedMessage
                id="onboarding.create_project.new_code_definition.create_x_projects"
                values={{
                  count: projectCount,
                }}
              />
            </Button>
            {isImporting && projectCount > 1 && (
              <MessageCallout variety={MessageVariety.Warning}>
                <FormattedMessage
                  id="onboarding.create_project.import_in_progress"
                  values={{
                    count: projectCount - mutateCount,
                    total: projectCount,
                  }}
                />
              </MessageCallout>
            )}
          </Form.Footer>
        </Form>
      </section>
    </GlobalPageTemplate>
  );
}

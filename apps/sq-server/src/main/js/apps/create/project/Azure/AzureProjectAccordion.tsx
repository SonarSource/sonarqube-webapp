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

import { Link, MessageCallout, MessageType, Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Accordion } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import SearchHighlighter from '~shared/components/SearchHighlighter';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { queryToSearchString } from '~sq-server-commons/sonar-aligned/helpers/urls';
import { AzureProject, AzureRepository } from '~sq-server-commons/types/alm-integration';
import { CreateProjectModes } from '~sq-server-commons/types/create-project';
import AlmRepoItem from '../components/AlmRepoItem';

export interface AzureProjectAccordionProps {
  loading: boolean;
  onImportRepository: (repository: AzureRepository) => void;
  onOpen: (key: string) => void;
  project: AzureProject;
  repositories?: AzureRepository[];
  searchQuery?: string;
  startsOpen: boolean;
}

const PAGE_SIZE = 20;

export default function AzureProjectAccordion(props: AzureProjectAccordionProps) {
  const { loading, startsOpen, project, repositories = [], searchQuery } = props;

  const [open, setOpen] = React.useState(startsOpen);
  const handleClick = () => {
    if (!open) {
      props.onOpen(project.name);
    }
    setOpen(!open);
  };

  const [page, setPage] = React.useState(1);
  const limitedRepositories = repositories.slice(0, page * PAGE_SIZE);

  return (
    <Accordion
      header={
        <span title={project.description}>
          <SearchHighlighter term={searchQuery}>{project.name}</SearchHighlighter>
        </span>
      }
      onClick={handleClick}
      open={open}
    >
      {/* eslint-disable-next-line local-rules/no-conditional-rendering-of-spinner*/}
      {open && (
        <Spinner isLoading={loading}>
          {repositories.length === 0 ? (
            <MessageCallout
              text={
                <FormattedMessage
                  id="onboarding.create_project.azure.no_repositories"
                  values={{
                    link: (
                      <Link
                        to={{
                          pathname: '/projects/create',
                          search: queryToSearchString({
                            mode: CreateProjectModes.AzureDevOps,
                            resetPat: 1,
                          }),
                        }}
                      >
                        {translate('onboarding.create_project.update_your_token')}
                      </Link>
                    ),
                  }}
                />
              }
              type={MessageType.Warning}
            />
          ) : (
            <>
              <ul className="sw-flex sw-flex-col sw-gap-3">
                {limitedRepositories.map((r) => (
                  <AlmRepoItem
                    almIconSrc={`${getBaseUrl()}/images/alm/azure.svg`}
                    almKey={r.name}
                    key={r.name}
                    onImport={() => {
                      props.onImportRepository(r);
                    }}
                    primaryTextNode={
                      <span title={r.name}>
                        <SearchHighlighter term={searchQuery}>{r.name}</SearchHighlighter>
                      </span>
                    }
                    sqProjectKey={r.sqProjectKey}
                  />
                ))}
              </ul>
              <ListFooter
                count={limitedRepositories.length}
                loadMore={() => {
                  setPage((p) => p + 1);
                }}
                total={repositories.length}
              />
            </>
          )}
        </Spinner>
      )}
    </Accordion>
  );
}

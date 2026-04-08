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

import { Button, Link, Spinner } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, ContentCell, SubTitle, Table, TableRow } from '~design-system';
import ListFooter from '~shared/components/controls/ListFooter';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useProfileProjectsInfiniteQuery } from '~sq-server-commons/queries/quality-profiles';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import ChangeProjectsForm from './ChangeProjectsForm';

interface Props {
  profile: Profile;
}

export function ProfileProjects({ profile }: Readonly<Props>) {
  const [formOpen, setFormOpen] = React.useState(false);

  const { data, fetchNextPage, isFetchingNextPage, isLoading } = useProfileProjectsInfiniteQuery(
    profile.key,
    { enabled: !profile.isDefault },
  );

  const projects = data?.pages.flatMap((p) => p.results) ?? [];
  const total = data?.pages[0]?.paging.total ?? 0;

  const hasNoActiveRules = profile.activeRuleCount === 0;

  const renderDefault = () => (
    <>
      <Badge className="sw-mr-2">
        <FormattedMessage id="default" />
      </Badge>
      <FormattedMessage id="quality_profiles.projects_for_default" />
    </>
  );

  const renderProjects = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (profile.activeRuleCount === 0 && projects.length === 0) {
      return translate('quality_profiles.cannot_associate_projects_no_rules');
    }

    if (projects.length === 0) {
      return translate('quality_profiles.no_projects_associated_to_profile');
    }

    return (
      <>
        <Table columnCount={1} noSidePadding>
          {projects.map((project) => (
            <TableRow key={project.key}>
              <ContentCell>
                <Link
                  className="it__quality-profiles__project"
                  to={getProjectOverviewUrl(project.key)}
                >
                  {project.name}
                </Link>
              </ContentCell>
            </TableRow>
          ))}
        </Table>
        {projects.length > 0 && (
          <ListFooter
            count={projects.length}
            loadMore={() => {
              void fetchNextPage();
            }}
            loading={isFetchingNextPage}
            total={total}
          />
        )}
      </>
    );
  };

  return (
    // eslint-disable-next-line local-rules/use-metrickey-enum
    <section aria-label={translate('projects')} className="it__quality-profiles__projects">
      <div className="sw-flex sw-items-center sw-gap-3 sw-mb-6">
        {
          // eslint-disable-next-line local-rules/use-metrickey-enum
          <SubTitle className="sw-mb-0">
            <FormattedMessage id="projects" />
          </SubTitle>
        }
        {profile.actions?.associateProjects && (
          <Button
            className="it__quality-profiles__change-projects"
            isDisabled={hasNoActiveRules}
            onClick={() => {
              setFormOpen(true);
            }}
          >
            <FormattedMessage id="quality_profiles.change_projects" />
          </Button>
        )}
      </div>
      {profile.isDefault ? renderDefault() : renderProjects()}
      {formOpen && (
        <ChangeProjectsForm
          onClose={() => {
            setFormOpen(false);
          }}
          profile={profile}
        />
      )}
    </section>
  );
}

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

import { Divider } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { FlagMessage, Link } from '~design-system';
import { ComponentQualifier, isProject } from '~shared/types/component';
import SeverityFacet from '~sq-server-commons/components/facets/SeverityFacet';
import StandardSeverityFacet from '~sq-server-commons/components/facets/StandardSeverityFacet';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { isBranch, isPullRequest } from '~sq-server-commons/sonar-aligned/helpers/branch-like';
import { isPortfolioLike } from '~sq-server-commons/sonar-aligned/helpers/component';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { isApplication, isView } from '~sq-server-commons/types/component';
import { Feature } from '~sq-server-commons/types/features';
import {
  Facet,
  IssuesQuery,
  ReferencedComponent,
  ReferencedLanguage,
  ReferencedRule,
} from '~sq-server-commons/types/issues';
import { GlobalSettingKeys } from '~sq-server-commons/types/settings';
import { Component } from '~sq-server-commons/types/types';
import { UserBase } from '~sq-server-commons/types/users';
import { AssigneeFacet } from './AssigneeFacet';
import { AttributeCategoryFacet } from './AttributeCategoryFacet';
import { AuthorFacet } from './AuthorFacet';
import { CreationDateFacet } from './CreationDateFacet';
import { DirectoryFacet } from './DirectoryFacet';
import { FileFacet } from './FileFacet';
import { IssueStatusFacet } from './IssueStatusFacet';
import { LanguageFacet } from './LanguageFacet';
import { PeriodFilter } from './PeriodFilter';
import { PrioritizedRuleFacet } from './PrioritizedRuleFacet';
import { ProjectFacet } from './ProjectFacet';
import { RuleFacet } from './RuleFacet';
import { ScopeFacet } from './ScopeFacet';
import { SoftwareQualityFacet } from './SoftwareQualityFacet';
import { StandardFacet } from './StandardFacet';
import { TagFacet } from './TagFacet';
import { TypeFacet } from './TypeFacet';
import { VariantFacet } from './VariantFacet';

export interface Props {
  branchLike?: BranchLike;
  component: Component | undefined;
  createdAfterIncludesTime: boolean;
  facets: Record<string, Facet | undefined>;
  loadSearchResultCount: (property: string, changes: Partial<IssuesQuery>) => Promise<Facet>;
  loadingFacets: Record<string, boolean>;
  myIssues: boolean;
  onFacetToggle: (property: string) => void;
  onFilterChange: (changes: Partial<IssuesQuery>) => void;
  openFacets: Record<string, boolean>;
  query: IssuesQuery;
  referencedComponentsById: Record<string, ReferencedComponent>;
  referencedComponentsByKey: Record<string, ReferencedComponent>;
  referencedLanguages: Record<string, ReferencedLanguage>;
  referencedRules: Record<string, ReferencedRule>;
  referencedUsers: Record<string, UserBase>;
  showVariantsFilter: boolean;
}

export function Sidebar(props: Readonly<Props>) {
  const {
    component,
    facets,
    loadingFacets,
    openFacets,
    query,
    branchLike,
    showVariantsFilter,
    createdAfterIncludesTime,
  } = props;
  const { settings } = useAppState();
  const { currentUser } = useCurrentUser();
  const { hasFeature } = useAvailableFeatures();
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  const renderComponentFacets = () => {
    const hasFileOrDirectory =
      !isApplication(component?.qualifier) && !isPortfolioLike(component?.qualifier);

    if (!component || !hasFileOrDirectory) {
      return null;
    }

    const commonProps = {
      componentKey: component.key,
      loadSearchResultCount: props.loadSearchResultCount,
      onChange: props.onFilterChange,
      onToggle: props.onFacetToggle,
      query,
    };

    return (
      <>
        {showVariantsFilter && isProject(component?.qualifier) && (
          <>
            <Divider className="sw-my-2" />

            <VariantFacet
              fetching={loadingFacets.codeVariants === true}
              open={!!openFacets.codeVariants}
              stats={facets.codeVariants}
              values={query.codeVariants}
              {...commonProps}
            />
          </>
        )}

        {component.qualifier !== ComponentQualifier.Directory && (
          <>
            <Divider className="sw-my-2" />

            <DirectoryFacet
              branchLike={branchLike}
              directories={query.directories}
              fetching={loadingFacets.directories === true}
              open={!!openFacets.directories}
              stats={facets.directories}
              {...commonProps}
            />
          </>
        )}

        <Divider className="sw-my-2" />

        <FileFacet
          branchLike={branchLike}
          fetching={loadingFacets.files === true}
          files={query.files}
          open={!!openFacets.files}
          stats={facets.files}
          {...commonProps}
        />
      </>
    );
  };

  const disableDeveloperAggregatedInfo =
    settings[GlobalSettingKeys.DeveloperAggregatedInfoDisabled] === 'true';

  const branch =
    (isBranch(branchLike) && branchLike.name) ||
    (isPullRequest(branchLike) && branchLike.branch) ||
    undefined;

  const displayPeriodFilter = component !== undefined && !isPortfolioLike(component.qualifier);
  const displayProjectsFacet = !component || isView(component.qualifier);

  const needIssueSync = component?.needIssueSync;

  const secondLine = translate(
    `issues.facet.second_line.mode.${isStandardMode ? 'mqr' : 'standard'}`,
  );

  return (
    <>
      {displayPeriodFilter && (
        <PeriodFilter newCodeSelected={query.inNewCodePeriod} onChange={props.onFilterChange} />
      )}

      {!isStandardMode && !needIssueSync && (
        <>
          <SoftwareQualityFacet
            fetching={props.loadingFacets.impactSoftwareQualities === true}
            needIssueSync={needIssueSync}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.impactSoftwareQualities}
            qualities={query.impactSoftwareQualities}
            stats={facets.impactSoftwareQualities}
          />

          <Divider className="sw-my-2" />

          <SeverityFacet
            fetching={props.loadingFacets.impactSeverities === true}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.impactSeverities}
            stats={facets.impactSeverities}
            values={query.impactSeverities}
          />

          <Divider className="sw-my-2" />

          {query.types.length > 0 && (
            <>
              <TypeFacet
                fetching={props.loadingFacets.types === true}
                needIssueSync={needIssueSync}
                onChange={props.onFilterChange}
                onToggle={props.onFacetToggle}
                open={!!openFacets.types}
                secondLine={secondLine}
                stats={facets.types}
                types={query.types}
              />
              <Divider className="sw-my-2" />
            </>
          )}

          {query.severities.length > 0 && (
            <>
              <StandardSeverityFacet
                fetching={props.loadingFacets.severities === true}
                headerName={translate('issues.facet.severities')}
                onChange={props.onFilterChange}
                onToggle={props.onFacetToggle}
                open={!!openFacets.severities}
                secondLine={secondLine}
                stats={facets.severities}
                values={query.severities}
              />

              <Divider className="sw-my-2" />
            </>
          )}

          <AttributeCategoryFacet
            categories={query.cleanCodeAttributeCategories}
            fetching={props.loadingFacets.cleanCodeAttributeCategories === true}
            needIssueSync={needIssueSync}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.cleanCodeAttributeCategories}
            stats={facets.cleanCodeAttributeCategories}
          />

          <Divider className="sw-my-2" />
        </>
      )}

      {isStandardMode && (
        <>
          <TypeFacet
            fetching={props.loadingFacets.types === true}
            needIssueSync={needIssueSync}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.types}
            stats={facets.types}
            types={query.types}
          />
          <Divider className="sw-my-2" />

          {!needIssueSync && (
            <>
              <StandardSeverityFacet
                fetching={props.loadingFacets.severities === true}
                headerName={translate('issues.facet.severities')}
                onChange={props.onFilterChange}
                onToggle={props.onFacetToggle}
                open={!!openFacets.severities}
                stats={facets.severities}
                values={query.severities}
              />

              <Divider className="sw-my-2" />

              {query.impactSoftwareQualities.length > 0 && (
                <>
                  <SoftwareQualityFacet
                    fetching={props.loadingFacets.impactSoftwareQualities === true}
                    needIssueSync={needIssueSync}
                    onChange={props.onFilterChange}
                    onToggle={props.onFacetToggle}
                    open={!!openFacets.impactSoftwareQualities}
                    qualities={query.impactSoftwareQualities}
                    secondLine={secondLine}
                    stats={facets.impactSoftwareQualities}
                  />

                  <Divider className="sw-my-2" />
                </>
              )}

              {query.impactSeverities.length > 0 && (
                <>
                  <SeverityFacet
                    fetching={props.loadingFacets.impactSeverities === true}
                    onChange={props.onFilterChange}
                    onToggle={props.onFacetToggle}
                    open={!!openFacets.impactSeverities}
                    secondLine={secondLine}
                    stats={facets.impactSeverities}
                    values={query.impactSeverities}
                  />

                  <Divider className="sw-my-2" />
                </>
              )}
            </>
          )}
        </>
      )}

      {!needIssueSync && (
        <>
          <ScopeFacet
            fetching={props.loadingFacets.scopes === true}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.scopes}
            scopes={query.scopes}
            stats={facets.scopes}
          />

          <Divider className="sw-my-2" />

          <IssueStatusFacet
            fetching={props.loadingFacets.issueStatuses === true}
            issueStatuses={query.issueStatuses}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.issueStatuses}
            stats={facets.issueStatuses}
          />

          <Divider className="sw-my-2" />

          <StandardFacet
            cwe={query.cwe}
            cweOpen={!!openFacets.cwe}
            cweStats={facets.cwe}
            fetchingCwe={props.loadingFacets.cwe === true}
            fetchingOwaspTop10={props.loadingFacets.owaspTop10 === true}
            fetchingOwaspTop10-2021={props.loadingFacets['owaspTop10-2021'] === true}
            fetchingSonarSourceSecurity={props.loadingFacets.sonarsourceSecurity === true}
            loadSearchResultCount={props.loadSearchResultCount}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.standards}
            owaspTop10={query.owaspTop10}
            owaspTop10-2021={query['owaspTop10-2021']}
            owaspTop10-2021Open={!!openFacets['owaspTop10-2021']}
            owaspTop10-2021Stats={facets['owaspTop10-2021']}
            owaspTop10Open={!!openFacets.owaspTop10}
            owaspTop10Stats={facets.owaspTop10}
            query={query}
            sonarsourceSecurity={query.sonarsourceSecurity}
            sonarsourceSecurityOpen={!!openFacets.sonarsourceSecurity}
            sonarsourceSecurityStats={facets.sonarsourceSecurity}
          />

          <Divider className="sw-my-2" />

          <CreationDateFacet
            component={component}
            createdAfter={query.createdAfter}
            createdAfterIncludesTime={createdAfterIncludesTime}
            createdAt={query.createdAt}
            createdBefore={query.createdBefore}
            createdInLast={query.createdInLast}
            fetching={props.loadingFacets.createdAt === true}
            inNewCodePeriod={query.inNewCodePeriod}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.createdAt}
            stats={facets.createdAt}
          />

          <Divider className="sw-my-2" />

          <LanguageFacet
            fetching={props.loadingFacets.languages === true}
            loadSearchResultCount={props.loadSearchResultCount}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.languages}
            query={query}
            referencedLanguages={props.referencedLanguages}
            selectedLanguages={query.languages}
            stats={facets.languages}
          />

          <Divider className="sw-my-2" />

          <RuleFacet
            fetching={props.loadingFacets.rules === true}
            loadSearchResultCount={props.loadSearchResultCount}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!openFacets.rules}
            query={query}
            referencedRules={props.referencedRules}
            stats={facets.rules}
          />

          {!disableDeveloperAggregatedInfo && (
            <>
              <Divider className="sw-my-2" />

              <TagFacet
                branch={branch}
                component={component}
                fetching={props.loadingFacets.tags === true}
                loadSearchResultCount={props.loadSearchResultCount}
                onChange={props.onFilterChange}
                onToggle={props.onFacetToggle}
                open={!!openFacets.tags}
                query={query}
                stats={facets.tags}
                tags={query.tags}
              />

              {displayProjectsFacet && (
                <>
                  <Divider className="sw-my-2" />

                  <ProjectFacet
                    component={component}
                    fetching={props.loadingFacets.projects === true}
                    loadSearchResultCount={props.loadSearchResultCount}
                    onChange={props.onFilterChange}
                    onToggle={props.onFacetToggle}
                    open={!!openFacets.projects}
                    projects={query.projects}
                    query={query}
                    referencedComponents={props.referencedComponentsByKey}
                    stats={facets.projects}
                  />
                </>
              )}

              {renderComponentFacets()}

              {!props.myIssues && (
                <>
                  <Divider className="sw-my-2" />

                  <AssigneeFacet
                    assigned={query.assigned}
                    assignees={query.assignees}
                    fetching={props.loadingFacets.assignees === true}
                    loadSearchResultCount={props.loadSearchResultCount}
                    onChange={props.onFilterChange}
                    onToggle={props.onFacetToggle}
                    open={!!openFacets.assignees}
                    query={query}
                    referencedUsers={props.referencedUsers}
                    stats={facets.assignees}
                  />
                </>
              )}

              {currentUser.isLoggedIn && (
                <>
                  <Divider className="sw-my-2" />

                  <div className="sw-mb-4">
                    <AuthorFacet
                      author={query.author}
                      component={component}
                      fetching={props.loadingFacets.author === true}
                      loadSearchResultCount={props.loadSearchResultCount}
                      onChange={props.onFilterChange}
                      onToggle={props.onFacetToggle}
                      open={!!openFacets.author}
                      query={query}
                      stats={facets.author}
                    />
                  </div>
                </>
              )}
            </>
          )}
          {hasFeature(Feature.PrioritizedRules) && (
            <>
              <Divider className="sw-my-2" />

              <div className="sw-mb-4">
                <PrioritizedRuleFacet
                  fetching={props.loadingFacets.prioritizedRule === true}
                  onChange={props.onFilterChange}
                  onToggle={props.onFacetToggle}
                  open={!!openFacets.prioritizedRule}
                  stats={facets.prioritizedRule}
                  value={query.prioritizedRule ? true : undefined}
                />
              </div>
            </>
          )}
        </>
      )}

      {needIssueSync && (
        <>
          <Divider className="sw-my-2" />

          <FlagMessage className="sw-my-6" variant="info">
            <div>
              {translate('indexation.page_unavailable.description')}
              <span className="sw-ml-1">
                <FormattedMessage
                  id="indexation.filters_unavailable"
                  values={{
                    link: (
                      <Link to="https://docs.sonarsource.com/sonarqube/latest/instance-administration/reindexing/">
                        {translate('learn_more')}
                      </Link>
                    ),
                  }}
                />
              </span>
            </div>
          </FlagMessage>
        </>
      )}
    </>
  );
}

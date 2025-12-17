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
  Heading,
  Layout,
  LinkHighlight,
  MessageCallout,
  Spinner,
  Text,
  ToggleTip,
} from '@sonarsource/echoes-react';
import { difference, intersection } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { Card } from '~design-system';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import ListFooter from '~shared/components/controls/ListFooter';
import { KeyboardHint } from '~shared/components/KeyboardHint';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { LightComponent } from '~shared/types/component';
import { Metric } from '~shared/types/measures';
import { Location } from '~shared/types/router';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import {
  CCT_SOFTWARE_QUALITY_METRICS,
  LEAK_OLD_TAXONOMY_RATINGS,
  OLD_TAXONOMY_METRICS,
  OLD_TAXONOMY_RATINGS,
  SOFTWARE_QUALITY_RATING_METRICS,
} from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import {
  areCCTMeasuresComputed,
  areSoftwareQualityRatingsComputed,
} from '~sq-server-commons/helpers/measures';
import { getCodeUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Component, ComponentMeasure } from '~sq-server-commons/types/types';
import { getCodeMetrics, PortfolioMetrics } from '../utils';
import CodeBreadcrumbs from './CodeBreadcrumbs';
import Components from './Components';
import Search from './Search';
import SourceViewerWrapper from './SourceViewerWrapper';

interface Props {
  baseComponent?: ComponentMeasure;
  branchLike?: BranchLike;
  breadcrumbs: LightComponent[];
  component: Component;
  components?: ComponentMeasure[];
  handleGoToParent: () => void;
  handleHighlight: (highlighted: ComponentMeasure) => void;
  handleLoadMore: () => void;
  handleSearchClear: () => void;
  handleSearchResults: (searchResults: ComponentMeasure[]) => void;
  handleSelect: (component: ComponentMeasure) => void;
  handleSelectNewCode: (newCodeSelected: boolean) => void;
  highlighted?: ComponentMeasure;

  loading: boolean;
  location: Location;
  metrics: Record<string, Metric>;
  newCodeSelected: boolean;
  searchResults?: ComponentMeasure[];
  sourceViewer?: ComponentMeasure;
  total: number;
}

export default function CodeAppRenderer(props: Readonly<Props>) {
  const {
    branchLike,
    component,
    location,
    baseComponent,
    breadcrumbs,
    components = [],
    highlighted,
    loading,
    metrics,
    newCodeSelected,
    total,
    searchResults,
    sourceViewer,
  } = props;

  const intl = useIntl();
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const { canBrowseAllChildProjects, qualifier } = component;
  const showSearch = searchResults !== undefined;
  const hasComponents = components.length > 0 || searchResults !== undefined;
  const showBreadcrumbs =
    breadcrumbs.length > 1 && !showSearch && !frontEndEngineeringEnableSidebarNavigation;
  const showComponentList = sourceViewer === undefined && components.length > 0 && !showSearch;

  const { data: isStandardMode, isLoading: isLoadingStandardMode } =
    useStandardExperienceModeQuery();

  const getMetricKeys = (portfolioMetrics: PortfolioMetrics) =>
    intersection(
      getCodeMetrics(component.qualifier, branchLike, { portfolioMetrics }),
      Object.keys(metrics),
    );

  const aicaAgnosticMetricKeys = getMetricKeys(
    newCodeSelected ? PortfolioMetrics.NewCodeAicaAgnostic : PortfolioMetrics.AllCodeAicaAgnostic,
  );

  const aicaDisabledMetricKeys = getMetricKeys(
    newCodeSelected ? PortfolioMetrics.NewCodeAicaDisabled : PortfolioMetrics.AllCodeAicaDisabled,
  );

  const aicaEnabledMetricKeys = getMetricKeys(
    newCodeSelected ? PortfolioMetrics.NewCodeAicaEnabled : PortfolioMetrics.AllCodeAicaEnabled,
  );

  const allComponentsHaveSoftwareQualityMeasures = components.every((component) =>
    areCCTMeasuresComputed(component.measures),
  );
  const allComponentsHaveRatings = components.every((component) =>
    areSoftwareQualityRatingsComputed(component.measures),
  );

  const metricsBlacklist = [
    ...(allComponentsHaveSoftwareQualityMeasures && !isStandardMode
      ? OLD_TAXONOMY_METRICS
      : CCT_SOFTWARE_QUALITY_METRICS),
    ...(allComponentsHaveRatings && !isStandardMode
      ? [...OLD_TAXONOMY_RATINGS, ...LEAK_OLD_TAXONOMY_RATINGS]
      : SOFTWARE_QUALITY_RATING_METRICS),
  ];

  const getMetrics = (keys: string[]) =>
    difference(keys, metricsBlacklist).map((key) => metrics[key]);

  const aicaAgnosticMetrics = getMetrics(aicaAgnosticMetricKeys);
  const aicaDisabledMetrics = getMetrics(aicaDisabledMetricKeys);
  const aicaEnabledMetrics = getMetrics(aicaEnabledMetricKeys);

  let defaultTitle = intl.formatMessage({ id: 'code.page' });
  if (isApplication(baseComponent?.qualifier)) {
    defaultTitle = intl.formatMessage({ id: 'projects.page' });
  } else if (isPortfolioLike(baseComponent?.qualifier)) {
    defaultTitle = intl.formatMessage({ id: 'portfolio_breakdown.page' });
  }

  const isPortfolio = isPortfolioLike(qualifier);

  const breadcrumbsWithLinks = useMemo(
    () =>
      breadcrumbs.map((bc, index) => {
        let linkElement = bc.name;
        let selected: string | undefined = bc.key;
        if (index === 0) {
          linkElement = defaultTitle;
          selected = undefined;
        }
        if (index === breadcrumbs.length - 1) {
          return { linkElement, to: '' };
        }
        return { linkElement, to: getCodeUrl(component.key, branchLike, selected) };
      }),
    [breadcrumbs, defaultTitle, component.key, branchLike],
  );

  return (
    <ProjectPageTemplate
      breadcrumbs={breadcrumbsWithLinks}
      description={
        isPortfolio && (
          <Layout.ContentHeader.Description>
            <FormattedMessage
              id="portfolio_overview.intro"
              values={{
                link: (text) => (
                  <DocumentationLink
                    enableOpenInNewTab
                    highlight={LinkHighlight.Accent}
                    to={DocLink.PortfolioBreakdown}
                  >
                    {text}
                  </DocumentationLink>
                ),
              }}
            />
          </Layout.ContentHeader.Description>
        )
      }
      title={isDefined(sourceViewer) ? sourceViewer.name : defaultTitle}
      width="fluid"
    >
      <A11ySkipTarget anchor="code_main" />
      {isPortfolio && !frontEndEngineeringEnableSidebarNavigation && (
        <header className="sw-grid sw-grid-cols-3 sw-gap-12 sw-mb-4">
          <div className="sw-col-span-2">
            <Heading as="h1" hasMarginBottom>
              <FormattedMessage id="portfolio_breakdown.page" />
            </Heading>

            <div className="sw-typo-default">
              <FormattedMessage
                id="portfolio_overview.intro"
                values={{
                  link: (text) => (
                    <DocumentationLink
                      enableOpenInNewTab
                      highlight={LinkHighlight.Accent}
                      to={DocLink.PortfolioBreakdown}
                    >
                      {text}
                    </DocumentationLink>
                  ),
                }}
              />
            </div>
          </div>
        </header>
      )}

      {!canBrowseAllChildProjects && isPortfolio && (
        <MessageCallout className="it__portfolio_warning sw-mb-4" variety="warning">
          <FormattedMessage id="code_viewer.not_all_measures_are_shown" />
          <ToggleTip
            className="sw-ml-2"
            description={<FormattedMessage id="code_viewer.not_all_measures_are_shown.help" />}
          />
        </MessageCallout>
      )}

      <Spinner isLoading={loading || isLoadingStandardMode}>
        {(showComponentList || showSearch || hasComponents || showBreadcrumbs) && (
          <div className="sw-flex sw-justify-between sw-mb-2" id="code-page">
            <div className="sw-flex sw-flex-col sw-gap-4">
              {hasComponents && (
                <Search
                  branchLike={branchLike}
                  component={component}
                  newCodeSelected={newCodeSelected}
                  onNewCodeToggle={props.handleSelectNewCode}
                  onSearchClear={props.handleSearchClear}
                  onSearchResults={props.handleSearchResults}
                />
              )}

              {showBreadcrumbs && (
                <CodeBreadcrumbs
                  branchLike={branchLike}
                  breadcrumbs={breadcrumbs}
                  rootComponent={component}
                />
              )}
            </div>

            {(showComponentList || showSearch) && (
              <Text className="sw-flex sw-items-end sw-gap-4 sw-ml-6 sw-mb-50">
                <KeyboardHint
                  command={`${KeyboardKeys.DownArrow} ${KeyboardKeys.UpArrow}`}
                  title={intl.formatMessage({ id: 'component_measures.select_files' })}
                />

                <KeyboardHint
                  command={`${KeyboardKeys.LeftArrow} ${KeyboardKeys.RightArrow}`}
                  title={intl.formatMessage({ id: 'component_measures.navigate' })}
                />
              </Text>
            )}
          </div>
        )}

        {!hasComponents && sourceViewer === undefined && (
          <div className="sw-flex sw-align-center sw-flex-col sw-fixed sw-top-1/2">
            <Text as="div" isSubtle>
              <FormattedMessage
                id={`code_viewer.no_source_code_displayed_due_to_empty_analysis.${component.qualifier}`}
              />
            </Text>
          </div>
        )}

        {(showComponentList || showSearch) && (
          <Card className="sw-overflow-auto">
            {showComponentList && (
              <Components
                aicaDisabledMetrics={aicaDisabledMetrics}
                aicaEnabledMetrics={aicaEnabledMetrics}
                baseComponent={baseComponent}
                branchLike={branchLike}
                components={components}
                cycle
                metrics={aicaAgnosticMetrics}
                newCodeSelected={newCodeSelected}
                onEndOfList={props.handleLoadMore}
                onGoToParent={props.handleGoToParent}
                onHighlight={props.handleHighlight}
                onSelect={props.handleSelect}
                rootComponent={component}
                selected={highlighted}
                showAnalysisDate={isPortfolio}
              />
            )}
            {showSearch && (
              <Components
                aicaDisabledMetrics={[]}
                aicaEnabledMetrics={[]}
                branchLike={branchLike}
                components={searchResults}
                metrics={[]}
                onHighlight={props.handleHighlight}
                onSelect={props.handleSelect}
                rootComponent={component}
                selected={highlighted}
              />
            )}
          </Card>
        )}

        {showComponentList && (
          <ListFooter count={components.length} loadMore={props.handleLoadMore} total={total} />
        )}

        {sourceViewer !== undefined && !showSearch && (
          <SourceViewerWrapper
            branchLike={branchLike}
            component={sourceViewer.key}
            componentMeasures={sourceViewer.measures}
            isFile
            location={location}
            onGoToParent={props.handleGoToParent}
          />
        )}
      </Spinner>
    </ProjectPageTemplate>
  );
}

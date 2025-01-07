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

import { Heading, IconQuestionMark, LinkHighlight, Spinner, Text } from '@sonarsource/echoes-react';
import { difference, intersection } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Card, FlagMessage, KeyboardHint, LargeCenteredLayout } from '~design-system';
import A11ySkipTarget from '~sonar-aligned/components/a11y/A11ySkipTarget';
import HelpTooltip from '~sonar-aligned/components/controls/HelpTooltip';
import { isPortfolioLike } from '~sonar-aligned/helpers/component';
import { Breadcrumb } from '~sonar-aligned/types/component';
import { Location } from '~sonar-aligned/types/router';
import DocumentationLink from '../../../components/common/DocumentationLink';
import ListFooter from '../../../components/controls/ListFooter';
import {
  CCT_SOFTWARE_QUALITY_METRICS,
  LEAK_OLD_TAXONOMY_RATINGS,
  OLD_TAXONOMY_METRICS,
  OLD_TAXONOMY_RATINGS,
  SOFTWARE_QUALITY_RATING_METRICS,
} from '../../../helpers/constants';
import { DocLink } from '../../../helpers/doc-links';
import { KeyboardKeys } from '../../../helpers/keycodes';
import { translate } from '../../../helpers/l10n';
import {
  areCCTMeasuresComputed,
  areSoftwareQualityRatingsComputed,
} from '../../../helpers/measures';
import { useStandardExperienceModeQuery } from '../../../queries/mode';
import { BranchLike } from '../../../types/branch-like';
import { isApplication } from '../../../types/component';
import { Component, ComponentMeasure, Dict, Metric } from '../../../types/types';
import { getCodeMetrics, PortfolioMetrics } from '../utils';
import CodeBreadcrumbs from './CodeBreadcrumbs';
import Components from './Components';
import Search from './Search';
import SourceViewerWrapper from './SourceViewerWrapper';

interface Props {
  baseComponent?: ComponentMeasure;
  branchLike?: BranchLike;
  breadcrumbs: Breadcrumb[];
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
  metrics: Dict<Metric>;
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
  const { canBrowseAllChildProjects, qualifier } = component;

  const showSearch = searchResults !== undefined;

  const hasComponents = components.length > 0 || searchResults !== undefined;

  const showBreadcrumbs = breadcrumbs.length > 1 && !showSearch;

  const showComponentList = sourceViewer === undefined && components.length > 0 && !showSearch;

  const intl = useIntl();

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

  let defaultTitle = translate('code.page');
  if (isApplication(baseComponent?.qualifier)) {
    defaultTitle = translate('projects.page');
  } else if (isPortfolioLike(baseComponent?.qualifier)) {
    defaultTitle = translate('portfolio_breakdown.page');
  }

  const isPortfolio = isPortfolioLike(qualifier);

  return (
    <LargeCenteredLayout className="sw-py-8 sw-typo-lg" id="code-page">
      <Helmet defer={false} title={sourceViewer !== undefined ? sourceViewer.name : defaultTitle} />
      <A11ySkipTarget anchor="code_main" />
      {isPortfolio && (
        <header className="sw-grid sw-grid-cols-3 sw-gap-12 sw-mb-4">
          <div className="sw-col-span-2">
            <Heading as="h1" hasMarginBottom>
              {translate('portfolio_breakdown.page')}
            </Heading>

            <div className="sw-typo-default">
              {intl.formatMessage(
                { id: 'portfolio_overview.intro' },
                {
                  link: (text) => (
                    <DocumentationLink
                      shouldOpenInNewTab
                      to={DocLink.PortfolioBreakdown}
                      highlight={LinkHighlight.Accent}
                    >
                      {text}
                    </DocumentationLink>
                  ),
                },
              )}
            </div>
          </div>
        </header>
      )}

      {!canBrowseAllChildProjects && isPortfolio && (
        <FlagMessage variant="warning" className="it__portfolio_warning sw-mb-4">
          {translate('code_viewer.not_all_measures_are_shown')}
          <HelpTooltip
            className="sw-ml-2"
            overlay={translate('code_viewer.not_all_measures_are_shown.help')}
          >
            <IconQuestionMark />
          </HelpTooltip>
        </FlagMessage>
      )}

      <Spinner isLoading={loading || isLoadingStandardMode}>
        <div className="sw-flex sw-justify-between">
          <div>
            {hasComponents && (
              <Search
                branchLike={branchLike}
                className="sw-mb-4"
                component={component}
                newCodeSelected={newCodeSelected}
                onNewCodeToggle={props.handleSelectNewCode}
                onSearchClear={props.handleSearchClear}
                onSearchResults={props.handleSearchResults}
              />
            )}

            {!hasComponents && sourceViewer === undefined && (
              <div className="sw-flex sw-align-center sw-flex-col sw-fixed sw-top-1/2">
                <Text isSubdued>
                  {translate(
                    'code_viewer.no_source_code_displayed_due_to_empty_analysis',
                    component.qualifier,
                  )}
                </Text>
              </div>
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
            <div className="sw-flex sw-items-end sw-typo-default">
              <KeyboardHint
                className="sw-mr-4 sw-ml-6"
                command={`${KeyboardKeys.DownArrow} ${KeyboardKeys.UpArrow}`}
                title={translate('component_measures.select_files')}
              />

              <KeyboardHint
                command={`${KeyboardKeys.LeftArrow} ${KeyboardKeys.RightArrow}`}
                title={translate('component_measures.navigate')}
              />
            </div>
          )}
        </div>

        {(showComponentList || showSearch) && (
          <Card className="sw-mt-2 sw-overflow-auto">
            {showComponentList && (
              <Components
                aicaDisabledMetrics={aicaDisabledMetrics}
                aicaEnabledMetrics={aicaEnabledMetrics}
                baseComponent={baseComponent}
                branchLike={branchLike}
                components={components}
                cycle
                metrics={aicaAgnosticMetrics}
                onEndOfList={props.handleLoadMore}
                onGoToParent={props.handleGoToParent}
                onHighlight={props.handleHighlight}
                onSelect={props.handleSelect}
                rootComponent={component}
                selected={highlighted}
                newCodeSelected={newCodeSelected}
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
          <div className="sw-mt-2">
            <SourceViewerWrapper
              branchLike={branchLike}
              component={sourceViewer.key}
              componentMeasures={sourceViewer.measures}
              isFile
              location={location}
              onGoToParent={props.handleGoToParent}
            />
          </div>
        )}
      </Spinner>
    </LargeCenteredLayout>
  );
}

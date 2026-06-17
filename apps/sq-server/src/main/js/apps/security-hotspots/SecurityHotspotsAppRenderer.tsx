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

import { Layout, Link, LinkHighlight, MessageCallout, Spinner } from '@sonarsource/echoes-react';
import { isEmpty } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isBranch } from '~shared/helpers/branch-like';
import { ComponentQualifier } from '~shared/types/component';
import { StandardsInformation, StandardsInformationKey } from '~shared/types/security';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import {
  HotspotFilters,
  HotspotStatusFilter,
  RawHotspot,
} from '~sq-server-commons/types/security-hotspots';
import { Component, StandardSecurityCategories } from '~sq-server-commons/types/types';
import EmptyHotspotsPage from './components/EmptyHotspotsPage';
import HotspotList from './components/HotspotList';
import HotspotListMeta from './components/HotspotListMeta';
import HotspotSidebarHeader from './components/HotspotSidebarHeader';
import HotspotSimpleList from './components/HotspotSimpleList';
import HotspotFilterByStatus from './components/HotspotStatusFilter';
import HotspotViewer from './components/HotspotViewer';

export interface SecurityHotspotsAppRendererProps {
  branchLike?: BranchLike;
  component?: Component;
  filterByCWE?: string;
  filterByCategory?: {
    category: string;
    standard: StandardsInformationKey;
  };
  filterByFile?: string;
  filters: HotspotFilters;
  hotspots: RawHotspot[];
  hotspotsReviewedMeasure?: string;
  hotspotsTotal: number;
  isStaticListOfHotspots: boolean;
  loading: boolean;
  loadingMeasure: boolean;
  loadingMore: boolean;
  onChangeFilters: (filters: Partial<HotspotFilters>) => void;
  onHotspotClick: (hotspot: RawHotspot) => void;
  onLoadMore: () => void;
  onLocationClick: (index?: number) => void;
  onShowAllHotspots: VoidFunction;
  onSwitchStatusFilter: (option: HotspotStatusFilter) => void;
  onUpdateHotspot: (hotspotKey: string) => Promise<void>;
  securityCategories: StandardSecurityCategories;
  selectedHotspot?: RawHotspot;
  selectedHotspotLocation?: number;
  standards: StandardsInformation;
}

export default function SecurityHotspotsAppRenderer(props: SecurityHotspotsAppRendererProps) {
  const {
    branchLike,
    component,
    filterByCategory,
    filterByCWE,
    filterByFile,
    filters,
    hotspots,
    hotspotsReviewedMeasure,
    hotspotsTotal,
    isStaticListOfHotspots,
    loading,
    loadingMeasure,
    loadingMore,
    onChangeFilters,
    onShowAllHotspots,
    securityCategories,
    selectedHotspot,
    selectedHotspotLocation,
    standards,
  } = props;

  const intl = useIntl();
  const deprecationDocUrl = useDocUrl(DocLink.DeprecatedFeatures);

  if (component === undefined) {
    return null;
  }

  const isProject = component.qualifier === ComponentQualifier.Project;

  function getTranslationEmptyRootKey() {
    let translationRoot;

    if (!isEmpty(filterByFile)) {
      translationRoot = 'no_hotspots_for_file';
    } else if (isStaticListOfHotspots) {
      translationRoot = 'no_hotspots_for_keys';
    } else if (
      filters.assignedToMe ||
      (isBranch(branchLike) && filters.inNewCodePeriod) ||
      filters.status !== HotspotStatusFilter.TO_REVIEW
    ) {
      translationRoot = 'no_hotspots_for_filters';
    } else {
      translationRoot = 'no_hotspots';
    }

    return translationRoot;
  }

  return (
    <ProjectPageTemplate
      asideLeft={
        <Layout.AsideLeft
          aria-label={intl.formatMessage({ id: 'hotspots.list' })}
          className="sw-pt-0"
          role="region"
          size="large"
        >
          {isProject && (
            <HotspotSidebarHeader
              branchLike={branchLike}
              filters={filters}
              hotspotsReviewedMeasure={hotspotsReviewedMeasure}
              isStaticListOfHotspots={isStaticListOfHotspots}
              loadingMeasure={loadingMeasure}
              onChangeFilters={onChangeFilters}
            />
          )}

          <div className="it__hotspot-list">
            <HotspotFilterByStatus
              filters={filters}
              isStaticListOfHotspots={isStaticListOfHotspots}
              onChangeFilters={onChangeFilters}
              onShowAllHotspots={onShowAllHotspots}
            />
            <HotspotListMeta
              emptyTranslationKey={getTranslationEmptyRootKey()}
              hasSelectedHotspot={Boolean(selectedHotspot)}
              hotspotsTotal={hotspotsTotal}
              isStaticListOfHotspots={isStaticListOfHotspots}
              loading={loading}
              statusFilter={filters.status}
            />
            <Spinner className="sw-mt-3" isLoading={loading}>
              {hotspots.length > 0 && selectedHotspot && (
                <>
                  {filterByCategory || filterByCWE || filterByFile ? (
                    <HotspotSimpleList
                      filterByCWE={filterByCWE}
                      filterByCategory={filterByCategory}
                      filterByFile={filterByFile}
                      hotspots={hotspots}
                      hotspotsTotal={hotspotsTotal}
                      loadingMore={loadingMore}
                      onHotspotClick={props.onHotspotClick}
                      onLoadMore={props.onLoadMore}
                      onLocationClick={props.onLocationClick}
                      selectedHotspot={selectedHotspot}
                      selectedHotspotLocation={selectedHotspotLocation}
                      standards={standards}
                    />
                  ) : (
                    <HotspotList
                      hotspots={hotspots}
                      hotspotsTotal={hotspotsTotal}
                      loadingMore={loadingMore}
                      onHotspotClick={props.onHotspotClick}
                      onLoadMore={props.onLoadMore}
                      onLocationClick={props.onLocationClick}
                      securityCategories={securityCategories}
                      selectedHotspot={selectedHotspot}
                      selectedHotspotLocation={selectedHotspotLocation}
                    />
                  )}
                </>
              )}
            </Spinner>
          </div>
        </Layout.AsideLeft>
      }
      description={
        <MessageCallout
          className="sw-w-full"
          title={intl.formatMessage({ id: 'hotspots.deprecated_feature_warning.title' })}
          variety="warning"
        >
          <FormattedMessage
            id="hotspots.deprecated_feature_warning.description"
            values={{
              link: (text) => (
                <Link
                  enableOpenInNewTab
                  highlight={LinkHighlight.CurrentColor}
                  to={deprecationDocUrl}
                >
                  {text}
                </Link>
              ),
            }}
          />
        </MessageCallout>
      }
      pageClassName="it__security-hotspots-page"
      title={intl.formatMessage({ id: 'hotspots.page' })}
    >
      <A11ySkipTarget anchor="security_hotspots_main" />

      {hotspots.length === 0 || !selectedHotspot ? (
        <EmptyHotspotsPage
          emptyTranslationKey={getTranslationEmptyRootKey()}
          filterByFile={Boolean(filterByFile)}
          filtered={
            filters.assignedToMe ||
            (isBranch(branchLike) && filters.inNewCodePeriod) ||
            filters.status !== HotspotStatusFilter.TO_REVIEW
          }
          isStaticListOfHotspots={isStaticListOfHotspots}
        />
      ) : (
        <HotspotViewer
          component={component}
          hotspotKey={selectedHotspot.key}
          hotspotsReviewedMeasure={hotspotsReviewedMeasure}
          onLocationClick={props.onLocationClick}
          onSwitchStatusFilter={props.onSwitchStatusFilter}
          onUpdateHotspot={props.onUpdateHotspot}
          selectedHotspotLocation={selectedHotspotLocation}
          standards={standards}
        />
      )}
    </ProjectPageTemplate>
  );
}

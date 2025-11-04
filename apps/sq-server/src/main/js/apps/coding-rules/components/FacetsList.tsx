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

import { Divider } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { CodingRulesQuery } from '~sq-server-commons/types/coding-rules';
import { Feature } from '~sq-server-commons/types/features';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import { Facets, OpenFacets } from '~sq-server-commons/utils/coding-rules-query';
import { LanguageFacet } from '../../issues/sidebar/LanguageFacet';
import { StandardFacet } from '../../issues/sidebar/StandardFacet';
import AttributeCategoryFacet from './AttributeCategoryFacet';
import AvailableSinceFacet from './AvailableSinceFacet';
import InheritanceFacet from './InheritanceFacet';
import PrioritizedRulesFacet from './PrioritizedRulesFacet';
import ProfileFacet from './ProfileFacet';
import RepositoryFacet from './RepositoryFacet';
import RuleSeverityFacet from './RuleSeverityFacet';
import SecurityHotspotsFacet from './SecurityHotspotFacet';
import SoftwareQualityFacet from './SoftwareQualityFacet';
import StatusFacet from './StatusFacet';
import TagFacet from './TagFacet';
import TemplateFacet from './TemplateFacet';
import TypeFacet from './TypeFacet';

export interface FacetsListProps {
  facets?: Facets;
  hideProfileFacet?: boolean;
  onFacetToggle: (facet: string) => void;
  onFilterChange: (changes: Partial<CodingRulesQuery>) => void;
  openFacets: OpenFacets;
  query: CodingRulesQuery;
  referencedProfiles: Record<string, BaseProfile>;
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
  selectedProfile?: BaseProfile;
}

const MAX_INITIAL_LANGUAGES = 5;

export default function FacetsList(props: Readonly<FacetsListProps>) {
  const { hasFeature } = useAvailableFeatures();
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const languageDisabled = !props.hideProfileFacet && props.query.profile !== undefined;

  const inheritanceDisabled =
    props.query.compareToProfile !== undefined || !props.selectedProfile?.isInherited;

  const showPrioritizedRuleFacet = hasFeature(Feature.PrioritizedRules);

  const intl = useIntl();

  return (
    <>
      <LanguageFacet
        disabled={languageDisabled}
        disabledHelper={intl.formatMessage({ id: 'coding_rules.filters.language.inactive' })}
        maxInitialItems={MAX_INITIAL_LANGUAGES}
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.languages}
        selectedLanguages={props.query.languages}
        stats={props.facets?.languages}
      />

      {isStandardMode && (
        <>
          <Divider className="sw-my-2" />

          <TypeFacet
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.types}
            stats={props.facets?.types}
            values={props.query.types}
          />
        </>
      )}

      {!isStandardMode && (
        <>
          <Divider className="sw-my-2" />

          <SoftwareQualityFacet
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.impactSoftwareQualities}
            stats={props.facets?.impactSoftwareQualities}
            values={props.query.impactSoftwareQualities}
          />
        </>
      )}

      {!isStandardMode && (
        <>
          <Divider className="sw-my-2" />

          <SecurityHotspotsFacet
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.types}
            stats={props.facets?.types}
            values={props.query.types}
          />
        </>
      )}

      <>
        <Divider className="sw-my-2" />
        <RuleSeverityFacet
          facets={props.facets}
          onChange={props.onFilterChange}
          onToggle={props.onFacetToggle}
          openFacets={props.openFacets}
          query={props.query}
        />
      </>

      {!isStandardMode && (
        <>
          <Divider className="sw-my-2" />

          <AttributeCategoryFacet
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.cleanCodeAttributeCategories}
            stats={props.facets?.cleanCodeAttributeCategories}
            values={props.query.cleanCodeAttributeCategories}
          />
        </>
      )}

      <Divider className="sw-my-2" />

      <TagFacet
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.tags}
        stats={props.facets?.tags}
        values={props.query.tags}
      />

      <Divider className="sw-my-2" />

      <RepositoryFacet
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.repositories}
        referencedRepositories={props.referencedRepositories}
        stats={props.facets?.repositories}
        values={props.query.repositories}
      />

      <Divider className="sw-my-2" />

      <StatusFacet
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.statuses}
        stats={props.facets?.statuses}
        values={props.query.statuses}
      />

      <Divider className="sw-my-2" />

      <AvailableSinceFacet
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.availableSince}
        value={props.query.availableSince}
      />

      <Divider className="sw-my-2" />

      <StandardFacet
        cwe={props.query.cwe}
        cweOpen={!!props.openFacets.cwe}
        cweStats={props.facets?.cwe}
        fetchingCwe={false}
        fetchingOwaspMobileTop10-2024={false}
        fetchingOwaspTop10={false}
        fetchingOwaspTop10-2021={false}
        fetchingSonarSourceSecurity={false}
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.standards}
        owaspMobileTop10-2024={props.query['owaspMobileTop10-2024']}
        owaspMobileTop10-2024Open={!!props.openFacets['owaspMobileTop10-2024']}
        owaspMobileTop10-2024Stats={props.facets?.['owaspMobileTop10-2024']}
        owaspTop10={props.query.owaspTop10}
        owaspTop10-2021={props.query['owaspTop10-2021']}
        owaspTop10-2021Open={!!props.openFacets['owaspTop10-2021']}
        owaspTop10-2021Stats={props.facets?.['owaspTop10-2021']}
        owaspTop10Open={!!props.openFacets.owaspTop10}
        owaspTop10Stats={props.facets?.owaspTop10}
        query={props.query}
        sonarsourceSecurity={props.query.sonarsourceSecurity}
        sonarsourceSecurityOpen={!!props.openFacets.sonarsourceSecurity}
        sonarsourceSecurityStats={props.facets?.sonarsourceSecurity}
      />

      <Divider className="sw-my-2" />

      <TemplateFacet
        onChange={props.onFilterChange}
        onToggle={props.onFacetToggle}
        open={!!props.openFacets.template}
        value={props.query.template}
      />
      {!props.hideProfileFacet && (
        <>
          <Divider className="sw-my-2" />
          <ProfileFacet
            activation={props.query.activation}
            compareToProfile={props.query.compareToProfile}
            languages={props.query.languages}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.profile}
            referencedProfiles={props.referencedProfiles}
            value={props.query.profile}
          />
          <Divider className="sw-my-2" />
          <InheritanceFacet
            disabled={inheritanceDisabled}
            onChange={props.onFilterChange}
            onToggle={props.onFacetToggle}
            open={!!props.openFacets.inheritance}
            value={props.query.inheritance}
          />
          {showPrioritizedRuleFacet && (
            <>
              <Divider className="sw-my-2" />
              <PrioritizedRulesFacet
                disabled={props.selectedProfile === undefined}
                onChange={props.onFilterChange}
                onToggle={props.onFacetToggle}
                open={!!props.openFacets.prioritizedRule}
                value={props.query.prioritizedRule}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

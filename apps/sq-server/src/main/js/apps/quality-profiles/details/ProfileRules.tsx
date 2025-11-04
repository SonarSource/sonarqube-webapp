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

import styled from '@emotion/styled';
import { Button, ButtonVariety, Heading, Spinner } from '@sonarsource/echoes-react';
import { keyBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContentCell, NumericalCell, Table, TableRow, themeColor } from '~design-system';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { isDefined } from '~shared/helpers/types';
import { StaleTime } from '~shared/queries/common';
import { CodeAttributeCategory, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { RuleTypes } from '~shared/types/rules';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { useGetQualityProfile } from '~sq-server-commons/queries/quality-profiles';
import { useSearchRulesQuery } from '~sq-server-commons/queries/rules';
import DocHelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/DocHelpTooltip';
import { SearchRulesResponse } from '~sq-server-commons/types/coding-rules';
import { Profile } from '~sq-server-commons/types/quality-profiles';
import { RulesFacetName } from '~sq-server-commons/types/rules';
import ProfileRulesDeprecatedWarning from './ProfileRulesDeprecatedWarning';
import ProfileRulesRow from './ProfileRulesRow';
import ProfileRulesSonarWayComparison from './ProfileRulesSonarWayComparison';

interface Props {
  profile: Profile;
}

interface ByType {
  count: number | null;
  val: string;
}

export default function ProfileRules({ profile }: Readonly<Props>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const activateMoreUrl = getRulesUrl({ qprofile: profile.key, activation: 'false' });
  const { actions = {} } = profile;
  const intl = useIntl();

  const { data: allRulesPaginated, isLoading: isAllRulesLoading } = useSearchRulesQuery(
    {
      ps: 1,
      languages: profile.language,
      facets: isStandardMode
        ? `${RulesFacetName.Types}`
        : `${RulesFacetName.CleanCodeAttributeCategories},${RulesFacetName.ImpactSoftwareQualities}`,
    },
    { staleTime: StaleTime.LIVE },
  );
  const allRules = allRulesPaginated?.pages[0] ?? null;

  const { data: activatedRulesPaginated, isLoading: isActivatedRulesLoading } = useSearchRulesQuery(
    {
      ps: 1,
      activation: 'true',
      facets: isStandardMode
        ? `${RulesFacetName.Types}`
        : `${RulesFacetName.CleanCodeAttributeCategories},${RulesFacetName.ImpactSoftwareQualities}`,
      qprofile: profile.key,
    },
    { enabled: !!allRules, staleTime: StaleTime.LIVE },
  );
  const activatedRules = activatedRulesPaginated?.pages[0] ?? null;

  const { data: sonarWayDiff, isLoading: isShowProfileLoading } = useGetQualityProfile(
    { compareToSonarWay: true, profile },
    { enabled: !profile.isBuiltIn, select: (data) => data.compareToSonarWay },
  );

  const findFacet = React.useCallback((response: SearchRulesResponse, property: string) => {
    const facet = response.facets?.find((f) => f.property === property);
    return facet ? facet.values : [];
  }, []);

  const extractFacetData = React.useCallback(
    (facetName: string, response: SearchRulesResponse | null | undefined) => {
      if (!response) {
        return {};
      }

      return keyBy<ByType>(findFacet(response, facetName), 'val');
    },
    [findFacet],
  );

  const totalByCctCategory = extractFacetData(
    RulesFacetName.CleanCodeAttributeCategories,
    allRules,
  );
  const countsByCctCategory = extractFacetData(
    RulesFacetName.CleanCodeAttributeCategories,
    activatedRules,
  );
  const totalBySoftwareQuality = extractFacetData(RulesFacetName.ImpactSoftwareQualities, allRules);
  const countsBySoftwareImpact = extractFacetData(
    RulesFacetName.ImpactSoftwareQualities,
    activatedRules,
  );
  const totalByTypes = extractFacetData(RulesFacetName.Types, allRules);
  const countsByTypes = extractFacetData(RulesFacetName.Types, activatedRules);

  return (
    <section aria-label={translate('rules')} className="it__quality-profiles__rules">
      <Spinner isLoading={isActivatedRulesLoading || isAllRulesLoading || isShowProfileLoading}>
        <Heading as="h2" className="sw-mb-4">
          {translate('quality_profile.rules.breakdown')}
        </Heading>

        {isStandardMode && (
          <Table
            columnCount={3}
            columnWidths={['50%', '25%', '25%']}
            header={
              <StyledTableRowHeader>
                <ContentCell className="sw-font-semibold sw-pl-4">{translate('type')}</ContentCell>
                <NumericalCell className="sw-font-regular">{translate('active')}</NumericalCell>
                <NumericalCell className="sw-pr-4 sw-font-regular">
                  {translate('inactive')}
                </NumericalCell>
              </StyledTableRowHeader>
            }
            noHeaderTopBorder
            noSidePadding
            withRoundedBorder
          >
            {RuleTypes.filter((type) => type !== 'UNKNOWN').map((type) => (
              <ProfileRulesRow
                count={countsByTypes[type]?.count}
                key={type}
                qprofile={profile.key}
                title={translate('issue.type', type, 'plural')}
                total={totalByTypes[type]?.count}
                type={type}
              />
            ))}
          </Table>
        )}

        {!isStandardMode && (
          <>
            <Table
              className="sw-mb-4"
              columnCount={3}
              columnWidths={['50%', '25%', '25%']}
              header={
                <StyledTableRowHeader>
                  <ContentCell className="sw-font-semibold sw-pl-4">
                    {translate('quality_profile.rules.software_qualities_title')}
                  </ContentCell>
                  <NumericalCell className="sw-font-regular">{translate('active')}</NumericalCell>
                  <NumericalCell className="sw-pr-4 sw-font-regular">
                    {translate('inactive')}
                  </NumericalCell>
                </StyledTableRowHeader>
              }
              noHeaderTopBorder
              noSidePadding
              withRoundedBorder
            >
              {Object.values(SoftwareQuality).map((quality) => (
                <ProfileRulesRow
                  count={countsBySoftwareImpact[quality]?.count}
                  key={quality}
                  propertyName={RulesFacetName.ImpactSoftwareQualities}
                  propertyValue={quality}
                  qprofile={profile.key}
                  title={intl.formatMessage({ id: SOFTWARE_QUALITY_LABELS[quality] })}
                  total={totalBySoftwareQuality[quality]?.count}
                />
              ))}
            </Table>

            <Table
              columnCount={3}
              columnWidths={['50%', '25%', '25%']}
              header={
                <StyledTableRowHeader>
                  <ContentCell className="sw-font-semibold sw-pl-4">
                    {translate('quality_profile.rules.cct_categories_title')}
                  </ContentCell>
                  <NumericalCell className="sw-font-regular">{translate('active')}</NumericalCell>
                  <NumericalCell className="sw-pr-4 sw-font-regular">
                    {translate('inactive')}
                  </NumericalCell>
                </StyledTableRowHeader>
              }
              noHeaderTopBorder
              noSidePadding
              withRoundedBorder
            >
              {Object.values(CodeAttributeCategory).map((category) => (
                <ProfileRulesRow
                  count={countsByCctCategory[category]?.count}
                  key={category}
                  propertyName={RulesFacetName.CleanCodeAttributeCategories}
                  propertyValue={category}
                  qprofile={profile.key}
                  title={translate('rule.clean_code_attribute_category', category)}
                  total={totalByCctCategory[category]?.count}
                />
              ))}
            </Table>
          </>
        )}

        <div className="sw-mt-6 sw-flex sw-flex-col sw-gap-4 sw-items-start">
          {profile.activeDeprecatedRuleCount > 0 && (
            <ProfileRulesDeprecatedWarning
              activeDeprecatedRules={profile.activeDeprecatedRuleCount}
              profile={profile.key}
            />
          )}

          {isDefined(sonarWayDiff) && sonarWayDiff.missingRuleCount > 0 && (
            <ProfileRulesSonarWayComparison
              language={profile.language}
              profile={profile.key}
              sonarWayMissingRules={sonarWayDiff.missingRuleCount}
              sonarway={sonarWayDiff.profile}
            />
          )}

          {actions.edit && !profile.isBuiltIn && (
            <Button
              className="it__quality-profiles__activate-rules"
              to={activateMoreUrl}
              variety="primary"
            >
              <FormattedMessage id="quality_profiles.activate_more" />
            </Button>
          )}

          {/* if a user is allowed to `copy` a profile if they are a global admin */}
          {/* this user could potentially activate more rules if the profile was not built-in */}
          {/* in such cases it's better to show the button but disable it with a tooltip */}
          {actions.copy && profile.isBuiltIn && (
            <DocHelpTooltip content={translate('quality_profiles.activate_more.help.built_in')}>
              <Button
                className="it__quality-profiles__activate-rules"
                isDisabled
                variety={ButtonVariety.Primary}
              >
                {translate('quality_profiles.activate_more')}
              </Button>
            </DocHelpTooltip>
          )}
        </div>
      </Spinner>
    </section>
  );
}

const StyledTableRowHeader = styled(TableRow)`
  background-color: ${themeColor('breakdownHeaderBackground')};
`;

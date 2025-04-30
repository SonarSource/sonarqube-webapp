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

import styled from '@emotion/styled';
import React from 'react';
import { LightLabel, themeBorder } from '~design-system';
import { RuleDetails } from '~shared/types/rules';
import { CleanCodeAttributePill } from '~sq-server-shared/components/shared/CleanCodeAttributePill';
import SoftwareImpactPillList from '~sq-server-shared/components/shared/SoftwareImpactPillList';
import { translate } from '~sq-server-shared/helpers/l10n';
import { isDefined } from '~sq-server-shared/helpers/types';
import { useStandardExperienceModeQuery } from '~sq-server-shared/queries/mode';
import { IssueSeverity } from '~sq-server-shared/types/issues';

interface Props {
  ruleDetails: RuleDetails;
}

export default function RuleDetailsHeaderSide({ ruleDetails }: Readonly<Props>) {
  const hasCleanCodeAttribute =
    ruleDetails.cleanCodeAttributeCategory && ruleDetails.cleanCodeAttribute;
  const hasSoftwareImpact = isDefined(ruleDetails.impacts) && ruleDetails.impacts.length > 0;
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  if (!hasCleanCodeAttribute && !hasSoftwareImpact) {
    return null;
  }

  return (
    <StyledSection className="sw-flex sw-flex-col sw-pl-4 sw-gap-6 sw-max-w-[250px]">
      {hasSoftwareImpact && (
        <RuleHeaderInfo
          title={
            isStandardMode ? translate('type') : translate('coding_rules.software_qualities.label')
          }
        >
          <SoftwareImpactPillList
            className="sw-flex-wrap"
            issueSeverity={ruleDetails.severity as IssueSeverity}
            issueType={ruleDetails.type}
            softwareImpacts={ruleDetails.impacts}
            type="rule"
          />
        </RuleHeaderInfo>
      )}

      {ruleDetails.cleanCodeAttributeCategory &&
        ruleDetails.cleanCodeAttribute &&
        !isStandardMode && (
          <RuleHeaderInfo title={translate('coding_rules.cct_attribute.label')}>
            <CleanCodeAttributePill
              cleanCodeAttribute={ruleDetails.cleanCodeAttribute}
              cleanCodeAttributeCategory={ruleDetails.cleanCodeAttributeCategory}
              type="rule"
            />
          </RuleHeaderInfo>
        )}
    </StyledSection>
  );
}

interface RuleHeaderMetaItemProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

function RuleHeaderInfo({ children, title, ...props }: Readonly<RuleHeaderMetaItemProps>) {
  return (
    <div {...props}>
      <LightLabel as="div" className="sw-text-xs sw-font-semibold sw-mb-1">
        {title}
      </LightLabel>
      {children}
    </div>
  );
}

const StyledSection = styled.div`
  border-left: ${themeBorder('default', 'pageBlockBorder')};
`;

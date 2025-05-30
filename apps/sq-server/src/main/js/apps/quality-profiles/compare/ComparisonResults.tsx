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

import { LinkStandalone } from '@sonarsource/echoes-react';
import { isEqual } from 'lodash';
import { useIntl } from 'react-intl';
import { ActionCell, ContentCell, Table, TableRowInteractive } from '~design-system';
import { SoftwareQualityImpact } from '~shared/types/clean-code-taxonomy';
import { CompareResponse, RuleCompare } from '~sq-server-commons/api/quality-profiles';
import IssueSeverityIcon from '~sq-server-commons/components/icon-mappers/IssueSeverityIcon';
import { CleanCodeAttributePill } from '~sq-server-commons/components/shared/CleanCodeAttributePill';
import SoftwareImpactPillList from '~sq-server-commons/components/shared/SoftwareImpactPillList';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { IssueSeverity } from '~sq-server-commons/types/issues';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ComparisonResultActivation from './ComparisonResultActivation';
import ComparisonResultDeactivation from './ComparisonResultDeactivation';
import ComparisonResultsSummary from './ComparisonResultsSummary';

type Params = Record<string, string>;

interface Props extends CompareResponse {
  canDeactivateInheritedRules: boolean;
  leftProfile: BaseProfile;
  refresh: () => Promise<void>;
  rightProfile?: BaseProfile;
}

export default function ComparisonResults(props: Readonly<Props>) {
  const {
    leftProfile,
    rightProfile,
    inLeft,
    left,
    right,
    inRight,
    modified,
    canDeactivateInheritedRules,
  } = props;

  const intl = useIntl();

  const emptyComparison = !inLeft.length && !inRight.length && !modified.length;

  const canEdit = (profile: BaseProfile) => !profile.isBuiltIn && profile.actions?.edit;

  const renderLeft = () => {
    if (inLeft.length === 0) {
      return null;
    }

    const canRenderSecondColumn = leftProfile && canEdit(leftProfile);
    return (
      <Table
        columnCount={2}
        columnWidths={['50%', 'auto']}
        header={
          <TableRowInteractive>
            <ContentCell>
              {intl.formatMessage(
                {
                  id: 'quality_profiles.x_rules_only_in',
                },
                { count: inLeft.length, profile: left.name },
              )}
            </ContentCell>
            {canRenderSecondColumn && (
              <ContentCell aria-label={intl.formatMessage({ id: 'actions' })}>&nbsp;</ContentCell>
            )}
          </TableRowInteractive>
        }
        noSidePadding
      >
        {inLeft.map((rule) => (
          <TableRowInteractive key={`left-${rule.key}`}>
            <ContentCell>
              <RuleCell rule={rule} />
            </ContentCell>
            {canRenderSecondColumn && (
              <ContentCell className="sw-px-0">
                <ComparisonResultDeactivation
                  canDeactivateInheritedRules={canDeactivateInheritedRules}
                  key={rule.key}
                  onDone={props.refresh}
                  profile={leftProfile}
                  ruleKey={rule.key}
                />
              </ContentCell>
            )}
          </TableRowInteractive>
        ))}
      </Table>
    );
  };

  const renderRight = () => {
    if (inRight.length === 0) {
      return null;
    }

    const renderFirstColumn = leftProfile && canEdit(leftProfile);

    return (
      <Table
        columnCount={2}
        columnWidths={['50%', 'auto']}
        header={
          <TableRowInteractive>
            <ContentCell aria-label={intl.formatMessage({ id: 'actions' })}>&nbsp;</ContentCell>
            <ContentCell className="sw-pl-4">
              {intl.formatMessage(
                {
                  id: 'quality_profiles.x_rules_only_in',
                },
                { count: inRight.length, profile: right.name },
              )}
            </ContentCell>
          </TableRowInteractive>
        }
        noSidePadding
      >
        {inRight.map((rule) => (
          <TableRowInteractive key={`right-${rule.key}`}>
            <ActionCell className="sw-px-0">
              {renderFirstColumn && (
                <ComparisonResultActivation
                  key={rule.key}
                  onDone={props.refresh}
                  profile={leftProfile}
                  ruleKey={rule.key}
                />
              )}
            </ActionCell>
            <ContentCell className="sw-pl-4">
              <RuleCell rule={rule} />
            </ContentCell>
          </TableRowInteractive>
        ))}
      </Table>
    );
  };

  const renderModified = () => {
    if (modified.length === 0) {
      return null;
    }

    return (
      <Table
        caption={
          <>
            {intl.formatMessage(
              { id: 'quality_profiles.x_rules_have_different_configuration' },
              { count: modified.length },
            )}
          </>
        }
        columnCount={2}
        columnWidths={['50%', 'auto']}
        header={
          <TableRowInteractive>
            <ContentCell>{left.name}</ContentCell>
            <ContentCell className="sw-pl-4">{right.name}</ContentCell>
          </TableRowInteractive>
        }
        noSidePadding
      >
        {modified.map((rule) => (
          <TableRowInteractive key={`modified-${rule.key}`}>
            <ContentCell>
              <div>
                <RuleCell impacts={rule.left.impacts} rule={rule} severity={rule.left.severity} />
                <Parameters params={rule.left.params} />
              </div>
            </ContentCell>
            <ContentCell className="sw-pl-4">
              <div>
                <RuleCell impacts={rule.right.impacts} rule={rule} severity={rule.right.severity} />
                <Parameters params={rule.right.params} />
              </div>
            </ContentCell>
          </TableRowInteractive>
        ))}
      </Table>
    );
  };

  return (
    <div className="sw-mt-8">
      {emptyComparison ? (
        intl.formatMessage({ id: 'quality_profile.empty_comparison' })
      ) : (
        <>
          <ComparisonResultsSummary
            additionalCount={inLeft.length}
            comparedProfileName={rightProfile?.name}
            fewerCount={inRight.length}
            profileName={leftProfile.name}
          />
          {renderLeft()}
          {renderRight()}
          {renderModified()}
        </>
      )}
    </div>
  );
}

type RuleCellProps = {
  impacts?: SoftwareQualityImpact[];
  rule: RuleCompare;
  severity?: string;
};

function RuleCell({ rule, severity, impacts }: Readonly<RuleCellProps>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const shouldRenderSeverity =
    isStandardMode &&
    Boolean(severity) &&
    rule.left?.severity &&
    rule.right?.severity &&
    !isEqual(rule.left.severity, rule.right.severity);
  const shouldRenderImpacts =
    rule.impacts ||
    (rule.left?.impacts && rule.right?.impacts && !isEqual(rule.left.impacts, rule.right.impacts));

  return (
    <div>
      {shouldRenderSeverity && <IssueSeverityIcon severity={severity as IssueSeverity} />}
      <LinkStandalone className="sw-ml-1" to={getRulesUrl({ rule_key: rule.key, open: rule.key })}>
        {rule.name}
      </LinkStandalone>
      {!isStandardMode && (rule.cleanCodeAttributeCategory || shouldRenderImpacts) && (
        <ul className="sw-mt-3 sw-flex sw-items-center">
          {rule.cleanCodeAttributeCategory && (
            <li>
              <CleanCodeAttributePill
                cleanCodeAttributeCategory={rule.cleanCodeAttributeCategory}
              />
            </li>
          )}
          {((impacts && impacts.length > 0) || rule.impacts) && (
            <li>
              <SoftwareImpactPillList
                className="sw-ml-2"
                softwareImpacts={impacts ?? rule.impacts ?? []}
              />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function Parameters({ params }: Readonly<{ params?: Params }>) {
  if (!params) {
    return null;
  }

  return (
    <ul>
      {Object.keys(params).map((key) => (
        <li className="sw-mt-2 sw-break-all" key={key}>
          <code className="sw-typo-default">
            {key}
            {': '}
            {params[key]}
          </code>
        </li>
      ))}
    </ul>
  );
}

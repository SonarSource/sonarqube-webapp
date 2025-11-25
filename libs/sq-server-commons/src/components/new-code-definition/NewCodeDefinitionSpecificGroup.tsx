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
  Badge,
  BadgeVariety,
  Divider,
  Label,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageVariety,
  RadioButtonGroup,
  Select,
  Text,
  TextInput,
  TextSize,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNewCodeDefinitionDaysBanner } from '~adapters/queries/newCodeDefinition';
import DateTimeFormatter from '~shared/components/intl/DateTimeFormatter';
import { isDefined } from '~shared/helpers/types';
import { parseDate } from '../../helpers/dates';
import { DocLink } from '../../helpers/doc-links';
import { useDocUrl } from '../../helpers/docs';
import {
  NUMBER_OF_DAYS_MAX_VALUE,
  NUMBER_OF_DAYS_MIN_VALUE,
} from '../../helpers/new-code-definition';
import { useAllProjectAnalysesQuery } from '../../queries/project-analyses';
import { Branch } from '../../types/branch-like';
import { NewCodeDefinitionType } from '../../types/new-code-definition';
import DocumentationLink from '../common/DocumentationLink';
import { NewCodeDefinitionLevels } from './utils';

export interface NewCodeDefinitionSpecificGroupProps {
  analysis?: string;
  ariaLabelledBy: string;
  branch?: string;
  branchList?: Branch[];
  branchesEnabled?: boolean;
  className?: string;
  isValid?: boolean;
  numberOfDaysInput?: string;
  onNumberOfDaysChange?: (value: string) => void;
  onReferenceBranchChange?: (value: string) => void;
  onTypeChange?: (type: NewCodeDefinitionType) => void;
  previousNonCompliantValue?: string;
  projectKey?: string;
  referenceBranchInput?: string;
  settingsLevel: NewCodeDefinitionLevels;
  typeValue?: NewCodeDefinitionType;
  updatedAt?: number;
}

export default function NewCodeDefinitionSpecificGroup({
  className,
  branchesEnabled,
  numberOfDaysInput,
  typeValue,
  branchList = [],
  ariaLabelledBy,
  analysis,
  isValid,
  updatedAt,
  onNumberOfDaysChange,
  onReferenceBranchChange,
  settingsLevel,
  branch,
  projectKey,
  referenceBranchInput,
  previousNonCompliantValue,
  onTypeChange,
}: Readonly<NewCodeDefinitionSpecificGroupProps>) {
  const intl = useIntl();
  const { shouldShowBanner, dismissBanner } = useNewCodeDefinitionDaysBanner({
    projectKey,
    updatedAt,
    previousNonCompliantValue,
  });
  const getDocUrl = useDocUrl();

  const specificAnalysisDate = useSpecificAnalysisDate({
    analysisKey: analysis,
    projectKey,
    branch,
    enabled: !branchesEnabled && typeValue === NewCodeDefinitionType.SpecificAnalysis,
  });

  return (
    <RadioButtonGroup
      ariaLabelledBy={ariaLabelledBy}
      className={className}
      onChange={onTypeChange}
      options={[
        // Previous version option
        {
          label: intl.formatMessage({
            id: 'new_code_definition.specific_setting.previous_version.label',
          }),
          helpText: (
            <>
              <FormattedMessage
                id="new_code_definition.specific_setting.previous_version.description"
                values={{ b: HighlightedSmallText }}
              />
              <Divider className="sw-mt-4 sw-mb-2 -sw-ml-6" />
            </>
          ),
          value: NewCodeDefinitionType.PreviousVersion,
        },

        // Number of days option
        {
          label: intl.formatMessage({
            id: 'new_code_definition.specific_setting.number_of_days.label',
          }),
          helpText: (
            <>
              <FormattedMessage
                id="new_code_definition.specific_setting.number_of_days.description"
                values={{ b: HighlightedSmallText }}
              />
              {typeValue === NewCodeDefinitionType.NumberOfDays && (
                <>
                  <TextInput
                    isRequired
                    label={
                      <Label className="sw-mt-3 sw-inline-block">
                        <FormattedMessage id="new_code_definition.specific_setting.number_of_days.input.label" />
                      </Label>
                    }
                    max={NUMBER_OF_DAYS_MAX_VALUE}
                    messageInvalid={
                      <FormattedMessage
                        id="new_code_definition.specific_setting.number_of_days.input.error"
                        values={{ min: NUMBER_OF_DAYS_MIN_VALUE, max: NUMBER_OF_DAYS_MAX_VALUE }}
                      />
                    }
                    min={NUMBER_OF_DAYS_MIN_VALUE}
                    onChange={(event) => {
                      onNumberOfDaysChange?.(event.target.value);
                    }}
                    type="number"
                    validation={isValid ? 'none' : 'invalid'}
                    value={numberOfDaysInput}
                    width="large"
                  />
                  {shouldShowBanner && (
                    <MessageCallout
                      className="sw-mt-4"
                      onDismiss={dismissBanner}
                      variety={MessageVariety.Info}
                    >
                      <FormattedMessage
                        id="new_code_definition.auto_update.ncd_page.message"
                        tagName="span"
                        values={{
                          previousDays: previousNonCompliantValue,
                          days: numberOfDaysInput,
                          date: isDefined(updatedAt) && new Date(updatedAt).toLocaleDateString(),
                          link: (
                            <DocumentationLink to={DocLink.NewCodeDefinition}>
                              <FormattedMessage id="learn_more" />
                            </DocumentationLink>
                          ),
                        }}
                      />
                    </MessageCallout>
                  )}
                </>
              )}
              <Divider className="sw-mt-4 sw-mb-2 -sw-ml-6" />
            </>
          ),
          value: NewCodeDefinitionType.NumberOfDays,
        },
        // Reference branch option
        ...(branchesEnabled
          ? [
              {
                label: intl.formatMessage({
                  id: 'new_code_definition.specific_setting.reference_branch.label',
                }),
                helpText: (
                  <>
                    <FormattedMessage
                      id="new_code_definition.specific_setting.reference_branch.description"
                      values={{ b: HighlightedSmallText }}
                    />
                    {typeValue === NewCodeDefinitionType.ReferenceBranch && (
                      <>
                        {settingsLevel === NewCodeDefinitionLevels.NewProject ? (
                          <MessageCallout className="sw-mt-2" variety={MessageVariety.Info}>
                            <FormattedMessage id="new_code_definition.reference_branch.notice" />
                          </MessageCallout>
                        ) : (
                          <Select
                            data={branchList
                              .filter(
                                (b) =>
                                  settingsLevel !== NewCodeDefinitionLevels.Branch ||
                                  // branch cannot reference itself
                                  b.name !== branch,
                              )
                              .map(branchToOption)}
                            helpText={
                              settingsLevel !== NewCodeDefinitionLevels.Branch ? (
                                <FormattedMessage id="new_code_definition.specific_setting.reference_branch.input.help.main" />
                              ) : null
                            }
                            isRequired
                            label={
                              <Label className="sw-mt-3 sw-inline-block">
                                <FormattedMessage id="new_code_definition.specific_setting.reference_branch.input.label" />
                              </Label>
                            }
                            onChange={(val) => onReferenceBranchChange?.(val ?? '')}
                            value={referenceBranchInput}
                            width="large"
                          />
                        )}
                      </>
                    )}
                  </>
                ),
                value: NewCodeDefinitionType.ReferenceBranch,
              },
            ]
          : []),

        // Specific analysis option
        ...(typeValue === NewCodeDefinitionType.SpecificAnalysis
          ? [
              {
                label: intl.formatMessage({
                  id: 'new_code_definition.specific_setting.specific_analysis.label',
                }),
                helpText: (
                  <>
                    <FormattedMessage
                      id="new_code_definition.specific_setting.specific_analysis.description"
                      values={{ b: HighlightedSmallText }}
                    />
                    {specificAnalysisDate && (
                      <Text as="p" className="sw-mt-3">
                        <Text isHighlighted>
                          <FormattedMessage id="new_code_definition.specific_setting.specific_analysis.label" />
                        </Text>
                        :
                        <span className="sw-ml-1">
                          <DateTimeFormatter date={specificAnalysisDate} />
                        </span>
                      </Text>
                    )}
                    <MessageCallout
                      className="sw-mt-3"
                      title={intl.formatMessage({
                        id: 'new_code_definition.specific_setting.specific_analysis.warning.label',
                      })}
                      variety={MessageVariety.Warning}
                    >
                      <Text>
                        <FormattedMessage id="new_code_definition.specific_setting.specific_analysis.warning.description" />
                      </Text>
                      <Link
                        className="sw-ml-1"
                        enableOpenInNewTab
                        highlight={LinkHighlight.CurrentColor}
                        to={getDocUrl(DocLink.NewCodeDefinition)}
                      >
                        <FormattedMessage id="learn_more_in_doc" />
                      </Link>
                    </MessageCallout>
                  </>
                ),
                value: NewCodeDefinitionType.SpecificAnalysis,
                isDisabled: true,
              },
            ]
          : []),
      ]}
      value={typeValue}
    />
  );
}

function HighlightedSmallText(text: React.ReactNode) {
  return (
    <Text isHighlighted isSubtle size={TextSize.Small}>
      {text}
    </Text>
  );
}

function branchToOption(b: Branch) {
  return {
    label: b.name,
    value: b.name,
    suffix: b.isMain ? (
      <Badge variety={BadgeVariety.Neutral}>
        <FormattedMessage id="main" />
      </Badge>
    ) : null,
  };
}

function useSpecificAnalysisDate({
  analysisKey,
  projectKey,
  enabled,
  branch,
}: {
  analysisKey?: string;
  branch?: string;
  enabled?: boolean;
  projectKey?: string;
}) {
  const { data: analysis } = useAllProjectAnalysesQuery(
    { componentKey: projectKey, branchParams: { branch } },
    {
      select: (data) => data.find((a) => a.key === analysisKey),
      enabled: Boolean(enabled) && isDefined(analysisKey) && isDefined(projectKey),
    },
  );

  return analysis?.date ? parseDate(analysis?.date) : '';
}

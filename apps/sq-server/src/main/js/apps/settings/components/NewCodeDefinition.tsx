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

import { Button, ButtonGroup, ButtonVariety, Spinner } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import NewCodeDefinitionDaysOption from '~sq-server-commons/components/new-code-definition/NewCodeDefinitionDaysOption';
import NewCodeDefinitionPreviousVersionOption from '~sq-server-commons/components/new-code-definition/NewCodeDefinitionPreviousVersionOption';
import { NewCodeDefinitionLevels } from '~sq-server-commons/components/new-code-definition/utils';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  getNumberOfDaysDefaultValue,
  isNewCodeDefinitionCompliant,
} from '~sq-server-commons/helpers/new-code-definition';
import {
  useNewCodeDefinitionMutation,
  useNewCodeDefinitionQuery,
} from '~sq-server-commons/queries/newCodeDefinition';
import { NewCodeDefinitionType } from '~sq-server-commons/types/new-code-definition';

export default function NewCodeDefinition() {
  const [numberOfDays, setNumberOfDays] = React.useState(getNumberOfDaysDefaultValue());
  const [selectedNewCodeDefinitionType, setSelectedNewCodeDefinitionType] = React.useState<
    NewCodeDefinitionType | undefined
  >(undefined);

  const { data: newCodeDefinition, isLoading } = useNewCodeDefinitionQuery();
  const { isPending: isSaving, mutate: postNewCodeDefinition } = useNewCodeDefinitionMutation();

  const resetNewCodeDefinition = useCallback(() => {
    setSelectedNewCodeDefinitionType(newCodeDefinition?.type);
    setNumberOfDays(getNumberOfDaysDefaultValue(newCodeDefinition));
  }, [newCodeDefinition]);

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const type = selectedNewCodeDefinitionType;
    const value = type === NewCodeDefinitionType.NumberOfDays ? numberOfDays : undefined;

    postNewCodeDefinition({
      type,
      value,
    });
  };

  useEffect(() => {
    resetNewCodeDefinition();
  }, [resetNewCodeDefinition]);

  const isValid =
    selectedNewCodeDefinitionType !== NewCodeDefinitionType.NumberOfDays ||
    isNewCodeDefinitionCompliant({ type: NewCodeDefinitionType.NumberOfDays, value: numberOfDays });

  const isFormTouched =
    selectedNewCodeDefinitionType === NewCodeDefinitionType.NumberOfDays
      ? numberOfDays !== newCodeDefinition?.value
      : selectedNewCodeDefinitionType !== newCodeDefinition?.type;

  return (
    <>
      <h2
        className="settings-sub-category-name settings-definition-name"
        title={translate('settings.new_code_period.title')}
      >
        {translate('settings.new_code_period.title')}
      </h2>

      <ul className="settings-sub-categories-list">
        <li>
          <ul className="settings-definitions-list">
            <li>
              <div className="settings-definition">
                <div className="settings-definition-left">
                  <div className="small">
                    <p className="sw-mb-2">{translate('settings.new_code_period.description0')}</p>
                    <p className="sw-mb-2">{translate('settings.new_code_period.description1')}</p>
                    <p className="sw-mb-2">{translate('settings.new_code_period.description2')}</p>

                    <p className="sw-mb-2">
                      <FormattedMessage
                        id="settings.new_code_period.description3"
                        values={{
                          link: (
                            <DocumentationLink to={DocLink.NewCodeDefinition}>
                              {translate('settings.new_code_period.description3.link')}
                            </DocumentationLink>
                          ),
                        }}
                      />
                    </p>

                    <p className="sw-mt-4">
                      <strong aria-hidden id="new_code_period_label">
                        {translate('settings.new_code_period.question')}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="settings-definition-right">
                  <Spinner isLoading={isLoading}>
                    <form className="sw-flex sw-flex-col sw-items-stretch" onSubmit={onSubmit}>
                      <fieldset>
                        <legend className="sw-sr-only">
                          {translate('settings.new_code_period.question')}
                        </legend>
                        <div role="radiogroup">
                          <NewCodeDefinitionPreviousVersionOption
                            isDefault
                            onSelect={setSelectedNewCodeDefinitionType}
                            selected={
                              selectedNewCodeDefinitionType ===
                              NewCodeDefinitionType.PreviousVersion
                            }
                          />
                          <NewCodeDefinitionDaysOption
                            className="sw-mt-2 sw-mb-4"
                            currentDaysValue={
                              newCodeDefinition?.type === NewCodeDefinitionType.NumberOfDays
                                ? newCodeDefinition?.value
                                : undefined
                            }
                            days={numberOfDays}
                            isValid={isValid}
                            onChangeDays={setNumberOfDays}
                            onSelect={setSelectedNewCodeDefinitionType}
                            previousNonCompliantValue={newCodeDefinition?.previousNonCompliantValue}
                            projectKey={newCodeDefinition?.projectKey}
                            selected={
                              selectedNewCodeDefinitionType === NewCodeDefinitionType.NumberOfDays
                            }
                            settingLevel={NewCodeDefinitionLevels.Global}
                            updatedAt={newCodeDefinition?.updatedAt}
                          />
                        </div>
                      </fieldset>

                      <div
                        aria-atomic="true"
                        aria-live="polite"
                        aria-relevant="additions"
                        className="sw-mt-4"
                      >
                        {isFormTouched && (
                          <p className={classNames('sw-mb-2')}>
                            {translate('baseline.next_analysis_notice')}
                          </p>
                        )}
                        <Spinner className="sw-mr-2" isLoading={isSaving} />
                        {!isSaving && (
                          <ButtonGroup>
                            <Button
                              isDisabled={!isFormTouched || !isValid}
                              type="submit"
                              variety={ButtonVariety.Primary}
                            >
                              {translate('save')}
                            </Button>
                            <Button isDisabled={!isFormTouched} onClick={resetNewCodeDefinition}>
                              {translate('cancel')}
                            </Button>
                          </ButtonGroup>
                        )}
                      </div>
                    </form>
                  </Spinner>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </>
  );
}

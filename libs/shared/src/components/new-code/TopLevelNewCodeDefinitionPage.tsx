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
  Button,
  ButtonVariety,
  Divider,
  FormFieldWidth,
  Heading,
  Link,
  LinkHighlight,
  MessageCallout,
  MessageInline,
  MessageVariety,
  RadioButtonGroup,
  Spinner,
  Text,
  TextInput,
  TextSize,
} from '@sonarsource/echoes-react';
import { clone } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import {
  useNewCodeDefinitionDaysBanner,
  useNewCodeDefinitionMutation,
  useNewCodeDefinitionQuery,
} from '~adapters/queries/newCodeDefinition';
import { NewCodeDefinition, NewCodeDefinitionType } from '../../types/new-code-definition';

function isValidDays(days: string): boolean {
  const num = Number.parseInt(days, 10);
  return !Number.isNaN(num) && num >= 1 && num <= 90;
}

function isValidDefinition(definition: NewCodeDefinition): boolean {
  switch (definition.type) {
    case NewCodeDefinitionType.PreviousVersion:
      return true;

    case NewCodeDefinitionType.NumberOfDays:
      return isValidDays(definition.value);

    default:
      return false;
  }
}

export function TopLevelNewCodeDefinitionPage() {
  const intl = useIntl();
  const { data, isLoading } = useNewCodeDefinitionQuery();
  const docUrl = useSharedDocUrl();

  const { isPending, mutate } = useNewCodeDefinitionMutation();

  const { shouldShowBanner, dismissBanner } = useNewCodeDefinitionDaysBanner({
    previousNonCompliantValue: data?.previousNonCompliantValue,
    updatedAt: data?.updatedAt,
  });

  const [newCodeDefinition, setNewCodeDefinition] = useState<NewCodeDefinition | undefined>(data);

  const [numberOfDays, setNumberOfDays] = useState(
    data?.type === NewCodeDefinitionType.NumberOfDays ? data.value : '30',
  );

  const [selectedType, setSelectedType] = useState<NewCodeDefinitionType>(
    data?.type || NewCodeDefinitionType.PreviousVersion,
  );

  useEffect(() => {
    if (data) {
      setNewCodeDefinition(data);
      setNumberOfDays(data.type === NewCodeDefinitionType.NumberOfDays ? data.value : '30');
      setSelectedType(data.type);
    }
  }, [data]);

  const handleTypeChange = useCallback(
    (type: NewCodeDefinitionType) => {
      let value: string = type;

      if (type === NewCodeDefinitionType.NumberOfDays) {
        value = numberOfDays;
      }

      const definition: NewCodeDefinition = {
        type,
        value,
        isValid: isValidDefinition({ type, value, isValid: true }),
      };

      setSelectedType(type);
      setNewCodeDefinition(definition);
    },
    [numberOfDays],
  );

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = e.target.value;

    const definition: NewCodeDefinition = {
      type: NewCodeDefinitionType.NumberOfDays,
      value: days,
      isValid: isValidDefinition({
        type: NewCodeDefinitionType.NumberOfDays,
        value: days,
        isValid: true,
      }),
    };

    setNumberOfDays(days);
    setNewCodeDefinition(definition);
  };

  const handleCancel = () => {
    setNewCodeDefinition(clone(data));
    setNumberOfDays(data?.type === NewCodeDefinitionType.NumberOfDays ? data.value : '30');
    setSelectedType(data?.type || NewCodeDefinitionType.PreviousVersion);
  };

  const handleSubmit = () => {
    if (!newCodeDefinition?.isValid) {
      return;
    }

    mutate(newCodeDefinition);
  };

  const hasChanged =
    newCodeDefinition?.type !== data?.type || newCodeDefinition?.value !== data?.value;

  const isSaveButtonDisabled = isPending || !hasChanged || !newCodeDefinition?.isValid;

  return (
    <Spinner isLoading={isLoading}>
      <form className="sw-space-y-8">
        {/* New Code Definition Selection */}
        <div className="sw-space-y-4">
          <Heading as="h2" size="medium">
            <FormattedMessage id="new_code_definition.question" />
          </Heading>

          <div className="sw-space-y-6">
            <div>
              <RadioButtonGroup
                id="new-code-definition-type"
                onChange={(value) => {
                  handleTypeChange(value as NewCodeDefinitionType);
                }}
                options={[
                  {
                    label: intl.formatMessage({ id: 'new_code_definition.previous_version' }),
                    value: NewCodeDefinitionType.PreviousVersion,
                    helpText: (
                      <>
                        <div>
                          <Text isSubtle size={TextSize.Small}>
                            {intl.formatMessage({
                              id: 'new_code_definition.previous_version.description',
                            })}{' '}
                            {intl.formatMessage(
                              {
                                id: 'new_code_definition.previous_version.usecase',
                              },
                              {
                                b: (text) => (
                                  <Text isHighlighted isSubtle size={TextSize.Small}>
                                    {text}
                                  </Text>
                                ),
                              },
                            )}
                          </Text>
                        </div>

                        <Divider className="sw-mt-4 sw-mb-2 -sw-ml-6" />
                      </>
                    ),
                  },
                  {
                    label: intl.formatMessage({ id: 'new_code_definition.number_days' }),
                    value: NewCodeDefinitionType.NumberOfDays,
                    helpText: (
                      <div className="sw-space-y-3">
                        <Text isSubtle size={TextSize.Small}>
                          {intl.formatMessage({
                            id: 'new_code_definition.number_days.description',
                          })}{' '}
                          {intl.formatMessage(
                            {
                              id: 'new_code_definition.number_days.usecase',
                            },
                            {
                              b: (text) => (
                                <Text isHighlighted isSubtle size={TextSize.Small}>
                                  {text}
                                </Text>
                              ),
                            },
                          )}
                        </Text>

                        {selectedType === NewCodeDefinitionType.NumberOfDays && (
                          <div className="sw-space-y-2">
                            <div className="sw-max-w-600">
                              <TextInput
                                isRequired
                                label={intl.formatMessage({
                                  id: 'new_code_definition.number_days.specify_days',
                                })}
                                max={90}
                                messageInvalid={
                                  <FormattedMessage
                                    id="new_code_definition.number_days.invalid"
                                    values={{ 0: 1, 1: 90 }}
                                  />
                                }
                                min={1}
                                onChange={handleDaysChange}
                                type="number"
                                validation={isValidDays(numberOfDays) ? 'none' : 'invalid'}
                                value={numberOfDays}
                                width={FormFieldWidth.Large}
                              />
                            </div>

                            {shouldShowBanner && (
                              <MessageCallout
                                className="sw-mt-4"
                                onDismiss={dismissBanner}
                                variety={MessageVariety.Info}
                              >
                                <FormattedMessage
                                  id="new_code_definition.auto_update.ncd_page.message"
                                  values={{
                                    previousDays: data?.previousNonCompliantValue,
                                    days: numberOfDays,
                                    date:
                                      data?.updatedAt &&
                                      new Date(data.updatedAt).toLocaleDateString(),
                                    link: (
                                      <Link
                                        enableOpenInNewTab
                                        highlight={LinkHighlight.CurrentColor}
                                        to={docUrl(SharedDocLink.NewCodeDefinition)}
                                      >
                                        <FormattedMessage id="learn_more" />
                                      </Link>
                                    ),
                                  }}
                                />
                              </MessageCallout>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
                value={selectedType}
              />
            </div>
          </div>
        </div>

        {/* Change Notice and Actions */}
        {hasChanged && (
          <div>
            <div className="sw-flex sw-items-center sw-gap-4">
              <Button
                className="js-submit-new-code"
                isDisabled={isSaveButtonDisabled}
                onClick={handleSubmit}
                variety={ButtonVariety.Primary}
              >
                <FormattedMessage id="save" />
              </Button>

              <Button isDisabled={isPending || !hasChanged} onClick={handleCancel}>
                <FormattedMessage id="cancel" />
              </Button>

              <Spinner isLoading={isPending} />
            </div>

            <MessageInline className="sw-mt-2" variety="info">
              <Text>
                <FormattedMessage id="new_code_definition.change_notice" />
              </Text>
            </MessageInline>
          </div>
        )}
      </form>
    </Spinner>
  );
}

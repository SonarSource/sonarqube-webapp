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

import { SelectionCards, Text, TextSize } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getNewCodeDefinition } from '../../api/newCodeDefinition';
import {
  getNumberOfDaysDefaultValue,
  isNewCodeDefinitionCompliant,
} from '../../helpers/new-code-definition';
import {
  NewCodeDefinition,
  NewCodeDefinitiondWithCompliance,
  NewCodeDefinitionType,
} from '../../types/new-code-definition';
import NewCodeDefinitionSpecificGroup from './NewCodeDefinitionSpecificGroup';
import { NewCodeDefinitionLevels } from './utils';

interface Props {
  onNcdChanged: (ncd: NewCodeDefinitiondWithCompliance) => void;
}

export default function NewCodeDefinitionSelector(props: Props) {
  const intl = useIntl();
  const { onNcdChanged } = props;

  const [globalNcd, setGlobalNcd] = React.useState<NewCodeDefinition>();
  const [selectedNcdType, setSelectedNcdType] = React.useState<NewCodeDefinitionType>();
  const [days, setDays] = React.useState<string>('');

  React.useEffect(() => {
    const numberOfDays = getNumberOfDaysDefaultValue(globalNcd);
    setDays(numberOfDays);
  }, [globalNcd]);

  const isCompliant = React.useMemo(
    () =>
      !!selectedNcdType &&
      isNewCodeDefinitionCompliant({
        type: selectedNcdType,
        value: days,
      }),
    [selectedNcdType, days],
  );

  const handleNcdChanged = React.useCallback(
    (newNcdType: NewCodeDefinitionType) => {
      if (newNcdType && newNcdType !== selectedNcdType) {
        setSelectedNcdType(newNcdType);
      }
    },
    [selectedNcdType],
  );

  React.useEffect(() => {
    function fetchGlobalNcd() {
      getNewCodeDefinition().then(setGlobalNcd, noop);
    }

    fetchGlobalNcd();
  }, []);

  React.useEffect(() => {
    if (selectedNcdType) {
      const type =
        selectedNcdType === NewCodeDefinitionType.Inherited ? undefined : selectedNcdType;
      const value = selectedNcdType === NewCodeDefinitionType.NumberOfDays ? days : undefined;
      onNcdChanged({ isCompliant, type, value });
    }
  }, [selectedNcdType, days, isCompliant, onNcdChanged]);

  const getNcdSelectionValue = () => {
    if (selectedNcdType) {
      return selectedNcdType !== NewCodeDefinitionType.Inherited ? 'specific' : 'general';
    }

    return '';
  };

  return (
    <div>
      <SelectionCards
        ariaLabelledBy="selection-cards-label"
        onChange={(value: 'general' | 'specific') => {
          handleNcdChanged(
            value === 'specific'
              ? NewCodeDefinitionType.NumberOfDays
              : NewCodeDefinitionType.Inherited,
          );
        }}
        options={[
          {
            value: 'general',
            label: intl.formatMessage({ id: 'project_baseline.global_setting' }),
            helpText: (
              <FormattedMessage
                id="project_baseline.global_setting.description"
                values={{
                  default: (
                    <FormattedMessage
                      id={
                        globalNcd?.type === NewCodeDefinitionType.NumberOfDays
                          ? 'new_code_definition.number_days'
                          : 'new_code_definition.previous_version'
                      }
                    />
                  ),
                }}
              />
            ),
          },
          {
            value: 'specific',
            label: intl.formatMessage({ id: 'project_baseline.specific_setting' }),
            helpText: (
              <span id="specific-definition-label">
                <FormattedMessage
                  id="project_baseline.specific_setting.description"
                  values={{
                    b: (text) => (
                      <Text isHighlighted size={TextSize.Small}>
                        {text}
                      </Text>
                    ),
                  }}
                />
              </span>
            ),
          },
        ]}
        value={getNcdSelectionValue()}
      />

      {selectedNcdType && selectedNcdType !== NewCodeDefinitionType.Inherited && (
        <NewCodeDefinitionSpecificGroup
          ariaLabelledBy="specific-definition-label"
          branchesEnabled
          className="sw-mt-6"
          isValid={isCompliant}
          numberOfDaysInput={days}
          onNumberOfDaysChange={setDays}
          onReferenceBranchChange={noop}
          onTypeChange={handleNcdChanged}
          settingsLevel={NewCodeDefinitionLevels.NewProject}
          typeValue={selectedNcdType}
        />
      )}
    </div>
  );
}

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
  Form,
  MessageCallout,
  MessageVariety,
  ModalForm,
  RadioButtonGroup,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import { Component } from '~sq-server-commons/types/types';
import BuiltInQualityProfileBadge from '../../quality-profiles/components/BuiltInQualityProfileBadge';
import { USE_SYSTEM_DEFAULT } from '../constants';
import ProfileSelect from './ProfileSelect';

export interface SetQualityProfileModalProps {
  availableProfiles: BaseProfile[];
  component: Component;
  currentProfile: BaseProfile;
  onClose: () => void;
  onSubmit: (newKey: string | undefined, oldKey: string) => Promise<void>;
  usesDefault: boolean;
}

enum RadioOption {
  Default = 'default',
  Specific = 'specific',
}

export default function SetQualityProfileModal(props: SetQualityProfileModalProps) {
  const { availableProfiles, component, currentProfile, usesDefault } = props;
  const intl = useIntl();

  const [selected, setSelected] = React.useState(
    usesDefault ? USE_SYSTEM_DEFAULT : currentProfile.key,
  );

  const defaultProfile = availableProfiles.find((p) => p.isDefault);

  if (defaultProfile === undefined) {
    // defaultProfile cannot be undefined
    return undefined;
  }

  const hasSelectedSysDefault = selected === USE_SYSTEM_DEFAULT;
  const hasChanged = usesDefault ? !hasSelectedSysDefault : selected !== currentProfile.key;
  const needsReanalysis = !component.qualityProfiles?.some((p) =>
    hasSelectedSysDefault ? p.key === defaultProfile.key : p.key === selected,
  );

  const onFormSubmit = () => {
    return props.onSubmit(hasSelectedSysDefault ? undefined : selected, currentProfile.key);
  };

  return (
    <ModalForm
      content={
        <Form.Section className="sw-pt-6 sw-pb-4">
          <RadioButtonGroup
            ariaLabel={intl.formatMessage(
              { id: 'project_quality_profile.change_lang_X_profile' },
              { 0: currentProfile.languageName },
            )}
            onChange={(radioVal: RadioOption) => {
              if (radioVal === RadioOption.Default) {
                setSelected(USE_SYSTEM_DEFAULT);
              } else {
                setSelected(currentProfile.key);
              }
            }}
            options={[
              {
                value: RadioOption.Default,
                label: intl.formatMessage({ id: 'project_quality_profile.always_use_default' }),
                helpText: (
                  <span className="sw-block sw-pb-4">
                    <FormattedMessage id="current_noun" />: {defaultProfile?.name}
                    {defaultProfile?.isBuiltIn && (
                      <BuiltInQualityProfileBadge className="sw-ml-2" />
                    )}
                  </span>
                ),
              },
              {
                value: RadioOption.Specific,
                label: intl.formatMessage({
                  id: 'project_quality_profile.always_use_specific',
                }),
                helpText: (
                  <ProfileSelect
                    ariaLabel={intl.formatMessage({
                      id: 'project_quality_profile.always_use_specific',
                    })}
                    className="sw-mt-4"
                    isDisabled={hasSelectedSysDefault}
                    onChange={(value: string) => {
                      setSelected(value);
                    }}
                    profiles={availableProfiles}
                    value={!hasSelectedSysDefault ? selected : currentProfile.key}
                  />
                ),
              },
            ]}
            value={hasSelectedSysDefault ? RadioOption.Default : RadioOption.Specific}
          />

          {needsReanalysis && (
            <MessageCallout className="sw-mt-4" variety={MessageVariety.Info}>
              <FormattedMessage id="project_quality_profile.requires_new_analysis" />
            </MessageCallout>
          )}
        </Form.Section>
      }
      isDefaultOpen
      isSubmitDisabled={!hasChanged}
      onClose={props.onClose}
      onSubmit={onFormSubmit}
      secondaryButtonLabel={<FormattedMessage id="cancel" />}
      submitButtonLabel={<FormattedMessage id="save" />}
      title={intl.formatMessage(
        { id: 'project_quality_profile.change_lang_X_profile' },
        { 0: currentProfile.languageName },
      )}
    />
  );
}

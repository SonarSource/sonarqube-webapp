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

import {
  Button,
  ButtonGroup,
  ButtonVariety,
  Heading,
  SelectionCards,
  Spinner,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { FlagMessage } from '~design-system';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import {
  useStandardExperienceModeQuery,
  useUpdateModeMutation,
} from '~sq-server-commons/queries/mode';
import { useQualityGatesQuery } from '~sq-server-commons/queries/quality-gates';
import { Mode as ModeE } from '~sq-server-commons/types/mode';
import { SettingsKey } from '~sq-server-commons/types/settings';

const MODE_HEADING_ID = 'settings-mode-title';

enum ModeOption {
  Standard = 'standard',
  MQR = 'mqr',
}

export function Mode() {
  const intl = useIntl();
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();
  const [changedMode, setChangedMode] = React.useState(false);
  const { mutate: setMode, isPending } = useUpdateModeMutation();
  const { data: { qualitygates } = {}, isLoading: loadingGates } = useQualityGatesQuery({
    enabled: changedMode,
  });

  const QGCheckKey = isStandardMode ? 'hasStandardConditions' : 'hasMQRConditions';
  const hasQGConditionsFromOtherMode = changedMode && qualitygates?.some((qg) => qg[QGCheckKey]);

  const handleSave = () => {
    // we need to invert because on BE we store isMQRMode
    setMode(isStandardMode ? ModeE.MQR : ModeE.Standard, {
      onSuccess: () => {
        setChangedMode(false);
      },
    });
  };

  /*
   * - Standard, but changed => MQR
   * - Standard and not changed => Standard
   * - not Standard, but changed => Standard
   * - not Standard and not changed => MQR
   *
   * So if the two are the same (true & true or false & false), we're in MQR
   */
  const selectedMode = changedMode === isStandardMode ? ModeOption.MQR : ModeOption.Standard;

  return (
    <>
      <Heading as="h2" className="sw-mb-4" id={MODE_HEADING_ID}>
        {intl.formatMessage({ id: 'settings.mode.title' })}
      </Heading>
      <Text>
        <FormattedMessage
          id="settings.mode.description.line1"
          values={{
            mqrLink: (
              <DocumentationLink to={DocLink.ModeMQR}>
                {intl.formatMessage({ id: 'settings.mode.mqr.name' })}
              </DocumentationLink>
            ),
            standardLink: (
              <DocumentationLink to={DocLink.ModeStandard}>
                {intl.formatMessage({ id: 'settings.mode.standard.name' })}
              </DocumentationLink>
            ),
          }}
        />
      </Text>
      <br />
      <br />
      <Text as="div" className="sw-max-w-full sw-mb-6">
        {intl.formatMessage({ id: 'settings.mode.description.line2' })}
      </Text>
      <Spinner isLoading={isLoading}>
        <SelectionCards
          alignment="horizontal"
          ariaLabelledBy={MODE_HEADING_ID}
          isDisabled={isPending}
          onChange={(v) => {
            setChangedMode((v === ModeOption.Standard) !== Boolean(isStandardMode));
          }}
          options={[
            {
              value: ModeOption.Standard,
              label: intl.formatMessage({ id: 'settings.mode.standard.name' }),
              helpText: (
                <div>
                  <Text>
                    {intl.formatMessage({ id: 'settings.mode.standard.description.line1' })}
                  </Text>
                  <br />
                  <br />
                  <Text>
                    {intl.formatMessage({ id: 'settings.mode.standard.description.line2' })}
                  </Text>
                </div>
              ),
            },
            {
              value: ModeOption.MQR,
              label: intl.formatMessage({ id: 'settings.mode.mqr.name' }),
              helpText: (
                <div>
                  <Text>{intl.formatMessage({ id: 'settings.mode.mqr.description.line1' })}</Text>
                  <br />
                  <br />
                  <Text>{intl.formatMessage({ id: 'settings.mode.mqr.description.line2' })}</Text>
                </div>
              ),
            },
          ]}
          value={selectedMode}
        />
      </Spinner>
      <Text as="div" className="sw-mt-6" isSubdued>
        <FormattedMessage id="settings.key_x" values={{ '0': SettingsKey.MQRMode }} />
      </Text>
      {changedMode && (
        <div className="sw-mt-6">
          <Spinner
            isLoading={loadingGates}
            label={intl.formatMessage({ id: 'settings.mode.checking_instance' })}
          >
            <ButtonGroup>
              <Button
                aria-label={intl.formatMessage(
                  { id: 'settings.mode.save' },
                  { isStandardMode: !isStandardMode },
                )}
                isDisabled={isPending}
                isLoading={isPending}
                onClick={handleSave}
                variety={ButtonVariety.Primary}
              >
                {intl.formatMessage({ id: 'save' })}
              </Button>

              <Button
                isDisabled={isPending}
                onClick={() => {
                  setChangedMode(false);
                }}
              >
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
            </ButtonGroup>
            <div>
              {hasQGConditionsFromOtherMode ? (
                <FlagMessage className="sw-mt-6" variant="info">
                  {intl.formatMessage(
                    { id: 'settings.mode.instance_conditions_from_other_mode' },
                    { isStandardMode: isStandardMode && changedMode },
                  )}
                </FlagMessage>
              ) : (
                <Text className="sw-mt-2" size={TextSize.Small}>
                  {intl.formatMessage({ id: 'settings.mode.save.warning' })}
                </Text>
              )}
            </div>
          </Spinner>
        </div>
      )}
    </>
  );
}

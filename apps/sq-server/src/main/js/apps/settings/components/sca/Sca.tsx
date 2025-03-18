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

import { Button, ButtonVariety, Checkbox, Heading, ModalAlert } from '@sonarsource/echoes-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import {
  useGetScaFeatureEnablementQuery,
  useUpdateScaFeatureEnablementMutation,
} from '~sq-server-shared/queries/sca';
import { Feature } from '~sq-server-shared/types/features';

const SCA_TERMS_URL = 'https://www.sonarsource.com/legal/advanced-security-terms/';

function Sca() {
  const [isEnabled, setIsEnabled] = useState(false);

  const { hasFeature } = useAvailableFeatures();

  const { data: isScaEnabled = false, isLoading: isLoadingFeatureEnablement } =
    useGetScaFeatureEnablementQuery();
  const { mutate: mutateFeatureEnablement, isPending } = useUpdateScaFeatureEnablementMutation();

  const onChangeIsEnabled = () => {
    setIsEnabled((prevIsEnabled) => !prevIsEnabled);
  };
  const onCancel = () => {
    setIsEnabled(isScaEnabled);
  };
  const onSubmit = () => {
    mutateFeatureEnablement(isEnabled);
  };

  const isLoading = isLoadingFeatureEnablement || isPending;
  const isDisabled = isLoading || isEnabled === isScaEnabled;

  useEffect(() => {
    setIsEnabled(isScaEnabled);
  }, [isScaEnabled]);

  if (!hasFeature(Feature.ScaAvailable)) {
    return null;
  }

  return (
    <div>
      <Heading as="h2" hasMarginBottom>
        <FormattedMessage id="property.sca.admin.title" />
      </Heading>
      <p>
        <FormattedMessage id="property.sca.admin.description" />
      </p>
      <Checkbox
        checked={isEnabled}
        className="sw-my-6"
        helpText={
          <FormattedMessage
            id="property.sca.admin.acceptTerm.label"
            values={{
              terms: (
                <Link target="_blank" to={SCA_TERMS_URL}>
                  <FormattedMessage id="property.sca.admin.acceptTerm.terms" />
                </Link>
              ),
            }}
          />
        }
        label={<FormattedMessage id="property.sca.admin.checkbox.label" />}
        onCheck={onChangeIsEnabled}
      />
      <div>
        <div className="sw-flex sw-mt-6">
          <Button
            isDisabled={isDisabled}
            isLoading={isLoading}
            onClick={onSubmit}
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="save" />
          </Button>
          <ModalAlert
            description={<FormattedMessage id="property.sca.cancel.modal.description" />}
            primaryButton={
              <Button onClick={onCancel} variety={ButtonVariety.Primary}>
                <FormattedMessage id="confirm" />
              </Button>
            }
            secondaryButtonLabel={
              <FormattedMessage id="property.sca.cancel.modal.continue_editing" />
            }
            title={<FormattedMessage id="property.sca.cancel.modal.title" />}
          >
            <Button className="sw-ml-3" isDisabled={isDisabled} variety={ButtonVariety.Default}>
              <FormattedMessage id="cancel" />
            </Button>
          </ModalAlert>
        </div>
      </div>
    </div>
  );
}

export default Sca;

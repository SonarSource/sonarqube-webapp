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

import { Checkbox, Heading, Text } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { Feature } from '~sq-server-commons/types/features';
import { usePurchasableFeature } from '../../utils';

export function AdvancedSast() {
  const asastEnabled = useAvailableFeatures().hasFeature(Feature.AdvancedSAST);
  const advancedSastFeature = usePurchasableFeature(Feature.AdvancedSAST);

  if (!advancedSastFeature?.isAvailable) {
    return null;
  }

  return (
    <div>
      <Heading as="h3" hasMarginBottom>
        <FormattedMessage id="property.asast.admin.title" />
      </Heading>
      <Text as="p">
        <FormattedMessage id="property.asast.admin.description" />
      </Text>
      <Checkbox
        checked={asastEnabled}
        className="sw-mt-6"
        isDisabled
        label={<FormattedMessage id="property.asast.admin.checkbox.label" />}
        onCheck={noop}
      />
    </div>
  );
}

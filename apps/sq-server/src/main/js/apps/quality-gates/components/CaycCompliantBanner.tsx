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

import { Heading, IconCheck, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { CardWithPrimaryBackground } from '~design-system';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { OPTIMIZED_CAYC_CONDITIONS } from '~sq-server-commons/helpers/quality-gates';
import QGRecommendedIcon from './QGRecommendedIcon';

export default function CaycCompliantBanner() {
  return (
    <CardWithPrimaryBackground className="sw-mt-9 sw-p-8">
      <div className="sw-flex sw-items-center sw-mb-2">
        <QGRecommendedIcon className="sw-mr-2" />
        <Heading as="h3" className="sw-m-0">
          {translate('quality_gates.cayc.banner.title')}
        </Heading>
      </div>

      <div className="sw-my-2">
        <FormattedMessage
          id="quality_gates.cayc.banner.description"
          values={{
            link: (text) => (
              <DocumentationLink shouldOpenInNewTab to={DocLink.CaYC}>
                {text}
              </DocumentationLink>
            ),
          }}
        />
      </div>
      <ul className="sw-typo-default sw-flex sw-flex-col sw-gap-2">
        {Object.values(OPTIMIZED_CAYC_CONDITIONS).map((condition) => (
          <li key={condition.metric}>
            <IconCheck className="sw-mr-1 sw-pt-1/2" color="echoes-color-icon-success" />
            <Text isSubdued>{translate(`metric.${condition.metric}.description.positive`)}</Text>
          </li>
        ))}
      </ul>
    </CardWithPrimaryBackground>
  );
}

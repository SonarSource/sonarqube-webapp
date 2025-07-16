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
  Heading,
  LinkHighlight,
  PromotedSection,
  PromotedSectionVariety,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { LockIllustration } from '~sq-server-commons/components/illustrations/LockIllustration';
import { DocLink } from '~sq-server-commons/helpers/doc-links';

export function AiCodeFixPromotionMessage() {
  const { formatMessage } = useIntl();

  return (
    <div>
      <Heading as="h2" hasMarginBottom>
        <FormattedMessage id="property.aicodefix.admin.promotion.title" />
      </Heading>

      <PromotedSection
        actions={
          <DocumentationLink
            enableOpenInNewTab
            highlight={LinkHighlight.Default}
            standalone
            to={DocLink.AiCodeFixEnabling}
          >
            <FormattedMessage id="property.aicodefix.admin.promotion.more_about_ai_fix_suggestions" />
          </DocumentationLink>
        }
        badgeText={formatMessage({ id: 'property.aicodefix.admin.promotion.enterprise_only' })}
        className="sw-inline-block"
        headerText={formatMessage({ id: 'property.aicodefix.admin.promotion.subtitle' })}
        illustration={<LockIllustration height={84} width={84} />}
        text={
          <Text>
            {formatMessage({ id: 'property.aicodefix.admin.promotion.content' })}{' '}
            {formatMessage({ id: 'property.aicodefix.admin.promotion.content_2' })}
          </Text>
        }
        variety={PromotedSectionVariety.Highlight}
      />
    </div>
  );
}

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

import { FormattedMessage } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DismissableAlert } from '~sq-server-commons/components/ui/DismissableAlert';
import { DocLink } from '~sq-server-commons/helpers/doc-links';

export default function AutodetectAIBanner() {
  const messageId = 'notification.autodetect.ai.message';
  return (
    <DismissableAlert alertKey={'sonarqube.dismissed_' + messageId} variant="info">
      <FormattedMessage
        id={messageId}
        values={{
          link: (text) => (
            <DocumentationLink className="sw-ml-1" shouldOpenInNewTab to={DocLink.AiCodeDetection}>
              {text}
            </DocumentationLink>
          ),
        }}
      />
    </DismissableAlert>
  );
}

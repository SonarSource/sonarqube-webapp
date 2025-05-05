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

import { Link } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { sendTelemetryInfo, SubscriptionType } from '~sq-server-commons/api/fix-suggestions';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DismissableAlert } from '~sq-server-commons/components/ui/DismissableAlert';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGetSubscriptionTypeQuery } from '~sq-server-commons/queries/fix-suggestions';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { AiCodeFixFeatureEnablement } from '~sq-server-commons/types/fix-suggestions';
import { Permissions } from '~sq-server-commons/types/permissions';
import { SettingsKey } from '~sq-server-commons/types/settings';

const ENABLE_AI_CODEFIX = 'property.aicodefix.admin.promotion.link';
const LEARN_MORE = 'learn_more';

function createAiCodeFixSectionLink() {
  return {
    link: (
      <Link
        className="sw-ml-1"
        onClick={sendTelemetryInfo('ENABLE')}
        to="/admin/settings?category=ai_codefix"
      >
        {translate(ENABLE_AI_CODEFIX)}
      </Link>
    ),
  };
}

function createEnableAiCodeFixDocLink(prop: string) {
  return {
    link: (
      <DocumentationLink
        className="sw-ml-1"
        onClick={sendTelemetryInfo('LEARN_MORE')}
        to={DocLink.AiCodeFixEnabling}
      >
        {translate(prop)}
      </DocumentationLink>
    ),
  };
}

export default function EnableAiCodeFixMessage() {
  const { data } = useGetSubscriptionTypeQuery();
  const { currentUser } = useCurrentUser();
  const { data: aiCodeFixFeatureEnablement } = useGetValueQuery({
    key: SettingsKey.CodeSuggestion,
  });

  const subscriptionType: SubscriptionType | undefined = data?.subscriptionType;

  if (!subscriptionType) {
    return null;
  }

  const enablement =
    (aiCodeFixFeatureEnablement?.value as AiCodeFixFeatureEnablement) ||
    AiCodeFixFeatureEnablement.disabled;
  const isActive = enablement !== 'DISABLED';
  const isEarlyAccess = subscriptionType === 'EARLY_ACCESS';
  const isPaid = subscriptionType === 'PAID';
  const isNotPaid = subscriptionType === 'NOT_PAID';

  let link = createAiCodeFixSectionLink();
  let messageId = null;

  const isAdmin = currentUser.permissions?.global.includes(Permissions.Admin);

  if (isEarlyAccess && isAdmin && !isActive) {
    messageId = 'notification.aicodefix.ea.admin.message';
  } else if (isAdmin && isPaid && !isActive) {
    messageId = 'notification.aicodefix.ga.paid.inactive.admin.message';
  } else if (isAdmin && isNotPaid && isActive) {
    messageId = 'notification.aicodefix.ga.unpaid.active.admin.message';
  } else if (isAdmin && isNotPaid && !isActive) {
    messageId = 'notification.aicodefix.ga.unpaid.inactive.admin.message';
  } else if (!isAdmin && isNotPaid && isActive) {
    messageId = 'notification.aicodefix.ga.unpaid.active.user.message';
    link = createEnableAiCodeFixDocLink(LEARN_MORE);
  } else {
    return null;
  }

  return (
    <DismissableAlert alertKey={'sonarqube.dismissed_' + messageId} variant="info">
      <FormattedMessage id={messageId} values={link} />
    </DismissableAlert>
  );
}

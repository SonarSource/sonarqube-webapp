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
import { sendTelemetryInfo } from '~sq-server-commons/api/fix-suggestions';
import { DismissableAlert } from '~sq-server-commons/components/ui/DismissableAlert';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { useCurrentUser } from '~sq-server-commons/context/current-user/CurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getPlansPricingUrl } from '~sq-server-commons/helpers/urls';
import { useGetValueQuery } from '~sq-server-commons/queries/settings';
import { Feature } from '~sq-server-commons/types/features';
import { AiCodeFixFeatureEnablement } from '~sq-server-commons/types/fix-suggestions';
import { Permissions } from '~sq-server-commons/types/permissions';
import { SettingsKey } from '~sq-server-commons/types/settings';

function EnableAiCodeFixMessage(props: Readonly<WithAvailableFeaturesProps>) {
  const { currentUser } = useCurrentUser();
  const { data: aiCodeFixFeatureEnablement } = useGetValueQuery({
    key: SettingsKey.CodeSuggestion,
  });

  const hasAICodeFix = props.hasFeature(Feature.FixSuggestions);
  const hasAICodeFixMarketing = props.hasFeature(Feature.FixSuggestionsMarketing);

  const enablement =
    (aiCodeFixFeatureEnablement?.value as AiCodeFixFeatureEnablement) ||
    AiCodeFixFeatureEnablement.disabled;
  const isActive = enablement !== 'DISABLED';
  let message = null;
  let messageId = null;

  const isAdmin = currentUser.permissions?.global.includes(Permissions.Admin);

  if (isAdmin && hasAICodeFix && !isActive) {
    messageId = 'notification.aicodefix.ga.paid.inactive.admin.message';
    message = (
      <FormattedMessage
        id={messageId}
        values={{
          link: (
            <Link
              className="sw-ml-1"
              onClick={sendTelemetryInfo('ENABLE')}
              to="/admin/settings?category=ai_codefix"
            >
              {translate('property.aicodefix.admin.promotion.link')}
            </Link>
          ),
        }}
      />
    );
  } else if (isAdmin && hasAICodeFixMarketing && isActive) {
    messageId = 'notification.aicodefix.ga.unpaid.active.admin.message';
    message = (
      <FormattedMessage
        id={messageId}
        values={{
          link: (
            <Link className="sw-ml-1" shouldOpenInNewTab to={getPlansPricingUrl()}>
              {translate('property.aicodefix.admin.unpaid.promotion.link')}
            </Link>
          ),
        }}
      />
    );
  } else if (!isAdmin && hasAICodeFixMarketing && isActive) {
    messageId = 'notification.aicodefix.ga.unpaid.active.user.message';
    message = <FormattedMessage id={messageId} />;
  } else {
    return null;
  }

  return (
    <DismissableAlert alertKey={'sonarqube.dismissed_' + messageId} variant="info">
      {message}
    </DismissableAlert>
  );
}

export default withAvailableFeatures(EnableAiCodeFixMessage);

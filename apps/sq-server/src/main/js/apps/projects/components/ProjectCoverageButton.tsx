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

import { Button, ButtonVariety, IconDataUsage, TeachingBubble } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Image } from '~adapters/components/common/Image';
import { AnnouncementBubble } from '~shared/components/feature-communication/AnnouncementBubble';
import { hasGlobalPermission } from '~sq-server-commons/helpers/users';
import { Permissions } from '~sq-server-commons/types/permissions';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';

interface Props {
  currentUser: CurrentUser;
}

export const ONBOARDING_DASHBOARD_PATH = '/admin/onboarding-dashboard';

/**
 * Links system admins to the onboarding dashboard. Hidden for non-admins.
 * Wrapped in a one-time TeachingBubble tour, dismissed forever (server-side, via the standard
 * dismiss-notice mechanism) once the user closes it or follows the button itself.
 */
export default function ProjectCoverageButton({ currentUser }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const isSystemAdmin = hasGlobalPermission(currentUser, Permissions.Admin);

  if (!isSystemAdmin) {
    return null;
  }

  return (
    <AnnouncementBubble
      description={<FormattedMessage id="projects.coverage.spotlight.content" />}
      dismissSetting={NoticeType.PROJECT_COVERAGE_TOUR}
      footer={
        <TeachingBubble.CloseButton variety={ButtonVariety.Default}>
          <FormattedMessage id="projects.coverage.spotlight.close" />
        </TeachingBubble.CloseButton>
      }
      illustration={
        <Image
          alt={formatMessage({ id: 'projects.coverage.spotlight.image_alt' })}
          src="/images/promotion/project-coverage-tour.png"
          width={300}
        />
      }
      isOpen
      title={<FormattedMessage id="projects.coverage.spotlight.title" />}
    >
      <Button
        prefix={<IconDataUsage />}
        to={ONBOARDING_DASHBOARD_PATH}
        variety={ButtonVariety.Default}
      >
        <FormattedMessage id="projects.coverage" />
      </Button>
    </AnnouncementBubble>
  );
}

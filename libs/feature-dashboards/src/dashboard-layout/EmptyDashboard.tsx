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

import { Button, ButtonVariety, EmptyState, IconDashboard, Link } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';

interface Props {
  canEdit: boolean;
  editDescriptionDocUrl: string;
  editModeButtonLabelKey?: string;
  isEditing: boolean;
  nonEditDescriptionDocUrl: string;
  setIsEditing: (isEditing: boolean) => void;
}

export function EmptyDashboard({
  canEdit,
  editDescriptionDocUrl,
  editModeButtonLabelKey = 'dashboard.add_widgets',
  isEditing,
  nonEditDescriptionDocUrl,
  setIsEditing,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const showEditButton = canEdit && !isEditing;

  const titleKey = canEdit ? 'dashboard.empty.title' : 'dashboard.empty.title_non_member';

  const descriptionKey = canEdit
    ? 'dashboard.empty.description'
    : 'dashboard.empty.description_non_member';
  const learnMoreKey = canEdit
    ? 'dashboard.empty.learn_more'
    : 'dashboard.empty.learn_more_non_member';

  const descriptionDocUrl = canEdit ? editDescriptionDocUrl : nonEditDescriptionDocUrl;

  return (
    <div className="sw-flex sw-h-full sw-justify-center">
      <EmptyState
        action={
          showEditButton ? (
            <Button
              onClick={() => {
                setIsEditing(true);
              }}
              variety={ButtonVariety.Default}
            >
              {formatMessage({ id: editModeButtonLabelKey })}
            </Button>
          ) : undefined
        }
        className="sw-my-24"
        graphic={<IconDashboard />}
        link={
          <Link enableOpenInNewTab to={descriptionDocUrl}>
            {formatMessage({ id: learnMoreKey })}
          </Link>
        }
        text={formatMessage({ id: descriptionKey })}
        title={formatMessage({ id: titleKey })}
      />
    </div>
  );
}

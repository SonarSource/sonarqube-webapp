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

import { Link, TeachingBubble } from '@sonarsource/echoes-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { AnnouncementBubble } from '~shared/components/feature-communication/AnnouncementBubble';
import { QualityGate } from '../../types/types';
import { NoticeType } from '../../types/users';

interface Props {
  children: ReactElement;
  isNewCode?: boolean;
  qualityGate?: QualityGate;
}

export default function ZeroNewIssuesSimplificationGuide(props: Readonly<Props>) {
  const { children, isNewCode, qualityGate } = props;

  if (!qualityGate || !isNewCode) {
    return children;
  }

  return (
    <AnnouncementBubble
      description={
        <FormattedMessage
          id="overview.quality_gates.conditions.condition_simplification_tour.content"
          values={{
            p: (text) => <p>{text}</p>,
            link: (text) => <Link to={`/quality_gates/show/${qualityGate.name}`}>{text}</Link>,
            qualityGateName: qualityGate.name,
          }}
        />
      }
      dismissSetting={NoticeType.OVERVIEW_ZERO_NEW_ISSUES_SIMPLIFICATION}
      footer={
        <TeachingBubble.CloseButton>
          <FormattedMessage id="dismiss" />
        </TeachingBubble.CloseButton>
      }
      isOpen
      side="right"
      title={
        <FormattedMessage id="overview.quality_gates.conditions.condition_simplification_tour.title" />
      }
    >
      {children}
    </AnnouncementBubble>
  );
}

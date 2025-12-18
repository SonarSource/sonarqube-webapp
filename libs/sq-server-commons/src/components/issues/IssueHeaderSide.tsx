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

import { Spinner, Text } from '@sonarsource/echoes-react';
import React from 'react';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { translate } from '../../helpers/l10n';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import { IssueSeverity } from '../../types/issues';
import { Issue } from '../../types/types';
import { CleanCodeAttributePill } from '../shared/CleanCodeAttributePill';
import SoftwareImpactPillList from '../shared/SoftwareImpactPillList';

interface Props {
  issue: Issue;
  onSetSeverity?: ((severity: IssueSeverity) => Promise<void>) &
    ((severity: SoftwareImpactSeverity, quality: SoftwareQuality) => Promise<void>);
}

export default function IssueHeaderSide({ issue, onSetSeverity }: Readonly<Props>) {
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();
  return (
    <div className="sw-self-start">
      <Spinner isLoading={isLoading}>
        <div className="sw-flex sw-flex-col sw-gap-300 sw-pl-2 sw-max-w-[250px]">
          <IssueHeaderInfo
            data-guiding-id="issue-2"
            title={isStandardMode ? translate('type') : translate('issue.software_qualities.label')}
          >
            <SoftwareImpactPillList
              className="sw-flex-wrap"
              issueSeverity={issue.severity as IssueSeverity}
              issueType={issue.type}
              onSetSeverity={onSetSeverity}
              softwareImpacts={issue.impacts}
            />
          </IssueHeaderInfo>

          {!isStandardMode && (
            <IssueHeaderInfo title={translate('issue.cct_attribute.label')}>
              <CleanCodeAttributePill
                cleanCodeAttribute={issue.cleanCodeAttribute}
                cleanCodeAttributeCategory={issue.cleanCodeAttributeCategory}
              />
            </IssueHeaderInfo>
          )}
        </div>
      </Spinner>
    </div>
  );
}

interface IssueHeaderMetaItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title: string;
}

function IssueHeaderInfo({
  children,
  title,
  className,
  ...props
}: Readonly<IssueHeaderMetaItemProps>) {
  return (
    <div className={className} {...props}>
      <Text as="div" className="sw-mb-1" isHighlighted isSubtle size="small">
        {title}
      </Text>
      {children}
    </div>
  );
}

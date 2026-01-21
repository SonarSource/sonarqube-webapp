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

import {
  BadgeSeverity,
  BadgeSeverityLevel,
  DropdownMenu,
  DropdownMenuAlign,
  Popover,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { IssueSeverity, IssueType } from '../../types/issues';
import { getIssueTypeIcon } from '../icon-mappers/IssueTypeIcon';

export interface Props {
  className?: string;
  issueType: string;
  onSetSeverity?: (severity: IssueSeverity) => Promise<void>;
  severity: IssueSeverity;
  tooltipMessageId?: string;
}

export default function IssueTypePill(props: Readonly<Props>) {
  const { className, severity, issueType, onSetSeverity, tooltipMessageId } = props;
  const intl = useIntl();
  const [updatingSeverity, setUpdatingSeverity] = useState(false);
  const variant = {
    [IssueSeverity.Blocker]: BadgeSeverityLevel.Blocker,
    [IssueSeverity.Critical]: BadgeSeverityLevel.Critical,
    [IssueSeverity.Major]: BadgeSeverityLevel.Major,
    [IssueSeverity.Minor]: BadgeSeverityLevel.Minor,
    [IssueSeverity.Info]: BadgeSeverityLevel.Info,
  }[severity];

  const formattedIssueType = intl.formatMessage({ id: `issue.type.${issueType}` });

  const handleSetSeverity = async (severity: IssueSeverity) => {
    setUpdatingSeverity(true);
    await onSetSeverity?.(severity);
    setUpdatingSeverity(false);
  };

  if (onSetSeverity) {
    return (
      <DropdownMenu
        align={DropdownMenuAlign.Start}
        items={Object.values(IssueSeverity).map((severityItem) => (
          <DropdownMenu.ItemButtonCheckable
            isChecked={severityItem === severity}
            isDisabled={severityItem === severity}
            key={severityItem}
            onClick={() => handleSetSeverity(severityItem)}
          >
            <div className="sw-flex sw-items-center sw-gap-2">
              <SoftwareImpactSeverityIcon severity={severityItem} />
              {intl.formatMessage({ id: `severity.${severityItem}` })}
            </div>
          </DropdownMenu.ItemButtonCheckable>
        ))}
      >
        <BadgeSeverity
          IconLeft={getIssueTypeIcon(issueType)}
          ariaLabel={intl.formatMessage(
            {
              id: tooltipMessageId ?? 'issue.type.severity.button.change',
            },
            {
              severity: intl.formatMessage({ id: `severity.${severity}` }),
              type: formattedIssueType,
            },
          )}
          className={className}
          data-guiding-id="issue-3"
          isLoading={updatingSeverity}
          quality={formattedIssueType}
          severity={variant}
          variety="dropdown"
        />
      </DropdownMenu>
    );
  }

  return (
    <Popover
      description={
        issueType === IssueType.SecurityHotspot
          ? ''
          : intl.formatMessage({ id: `severity.${severity}.description` })
      }
    >
      <BadgeSeverity
        IconLeft={getIssueTypeIcon(issueType)}
        ariaLabel={intl.formatMessage(
          {
            id: tooltipMessageId ?? 'issue.type.severity.button.popover',
          },
          {
            severity: intl.formatMessage({ id: `severity.${severity}` }),
            type: formattedIssueType,
          },
        )}
        className={className}
        data-guiding-id="issue-3"
        isLoading={updatingSeverity}
        quality={formattedIssueType}
        severity={variant}
      />
    </Popover>
  );
}

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

import classNames from 'classnames';
import { SoftwareImpactPillList as SharedSoftwareImpactPillList } from '~shared/components/issues/SoftwareImpactPillList';
import {
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from '~shared/types/clean-code-taxonomy';
import { IssueSeverity } from '~shared/types/issues';
import { DocLink } from '../../helpers/doc-links';
import { useDocUrl } from '../../helpers/docs';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import IssueTypePill from './IssueTypePill';

interface SoftwareImpactPillListProps {
  ariaLabel?: string;
  className?: string;
  'data-guiding-id'?: string;
  issueSeverity?: IssueSeverity;
  issueType?: string;
  onSetSeverity?: ((severity: IssueSeverity) => Promise<void>) &
    ((severity: SoftwareImpactSeverity, quality: SoftwareQuality) => Promise<void>);
  softwareImpacts?: SoftwareQualityImpact[];
  tooltipMessageId?: string;
  type?: Parameters<typeof SharedSoftwareImpactPillList>[0]['type'];
}

export default function SoftwareImpactPillList({
  ariaLabel,
  softwareImpacts,
  onSetSeverity,
  issueSeverity,
  issueType,
  tooltipMessageId,
  type,
  className,
  'data-guiding-id': dataGuidingId,
}: Readonly<SoftwareImpactPillListProps>) {
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const learnMoreUrl = useDocUrl(DocLink.MQRSeverity);

  if (isStandardMode) {
    return (
      <ul className={classNames('sw-flex sw-gap-2', className)} data-guiding-id={dataGuidingId}>
        {issueType && issueSeverity && (
          <IssueTypePill
            issueType={issueType}
            onSetSeverity={onSetSeverity}
            severity={issueSeverity}
            tooltipMessageId={tooltipMessageId}
          />
        )}
      </ul>
    );
  }

  if ((softwareImpacts?.length ?? 0) > 0) {
    return (
      <SharedSoftwareImpactPillList
        ariaLabel={ariaLabel}
        className={className}
        data-guiding-id={dataGuidingId}
        learnMoreUrl={learnMoreUrl}
        onSetSeverity={onSetSeverity}
        softwareImpacts={softwareImpacts}
        tooltipMessageId={tooltipMessageId}
        type={type}
      />
    );
  }

  if (issueType === 'SECURITY_HOTSPOT') {
    return (
      <ul className={classNames('sw-flex sw-gap-2', className)} data-guiding-id={dataGuidingId}>
        <IssueTypePill issueType={issueType} severity={issueSeverity ?? IssueSeverity.Info} />
      </ul>
    );
  }

  return null;
}

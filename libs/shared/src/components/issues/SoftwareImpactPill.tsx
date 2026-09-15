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
  Link,
  Popover,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SOFTWARE_QUALITY_LABELS } from '../../helpers/l10n';
import { SoftwareImpactSeverity, SoftwareQuality } from '../../types/clean-code-taxonomy';
import SoftwareImpactSeverityIcon from '../icon-mappers/SoftwareImpactSeverityIcon';

export interface Props {
  className?: string;
  learnMoreUrl?: string;
  onSetSeverity?: (severity: SoftwareImpactSeverity, quality: SoftwareQuality) => Promise<void>;
  quality: SoftwareQuality;
  severity: SoftwareImpactSeverity;
  tooltipMessageId?: string;
  type?: 'issue' | 'rule';
}

export default function SoftwareImpactPill(props: Readonly<Props>) {
  const intl = useIntl();

  const {
    className,
    severity,
    quality,
    type = 'issue',
    learnMoreUrl,
    onSetSeverity,
    tooltipMessageId,
  } = props;

  const qualityName = intl.formatMessage({ id: SOFTWARE_QUALITY_LABELS[quality] });
  const [updatingSeverity, setUpdatingSeverity] = useState(false);

  const variant = {
    [SoftwareImpactSeverity.Blocker]: BadgeSeverityLevel.Blocker,
    [SoftwareImpactSeverity.High]: BadgeSeverityLevel.High,
    [SoftwareImpactSeverity.Medium]: BadgeSeverityLevel.Medium,
    [SoftwareImpactSeverity.Low]: BadgeSeverityLevel.Low,
    [SoftwareImpactSeverity.Info]: BadgeSeverityLevel.Info,
  }[severity];

  const handleSetSeverity = async (newSeverity: SoftwareImpactSeverity) => {
    setUpdatingSeverity(true);
    await onSetSeverity?.(newSeverity, quality);
    setUpdatingSeverity(false);
  };

  if (onSetSeverity && type === 'issue') {
    return (
      <DropdownMenu
        align={DropdownMenuAlign.Start}
        items={Object.values(SoftwareImpactSeverity).map((impactSeverity) => (
          <DropdownMenu.ItemButtonCheckable
            isChecked={impactSeverity === severity}
            isDisabled={impactSeverity === severity}
            key={impactSeverity}
            onClick={() => handleSetSeverity(impactSeverity)}
          >
            <div className="sw-flex sw-items-center sw-gap-2">
              <SoftwareImpactSeverityIcon severity={impactSeverity} />
              <FormattedMessage id={`severity_impact.${impactSeverity}`} />
            </div>
          </DropdownMenu.ItemButtonCheckable>
        ))}
      >
        <BadgeSeverity
          ariaLabel={intl.formatMessage(
            { id: tooltipMessageId ?? 'software_impact.button.change' },
            {
              severity: intl.formatMessage({ id: `severity_impact.${severity}` }),
              quality: qualityName,
            },
          )}
          className={className}
          data-guiding-id="issue-3"
          data-spotlight-id="issue-3"
          isLoading={updatingSeverity}
          quality={qualityName}
          severity={variant}
          variety="dropdown"
        />
      </DropdownMenu>
    );
  }

  return (
    <Popover
      description={
        <>
          <FormattedMessage
            id={`${type}.impact.severity.tooltip`}
            values={{
              severity: intl.formatMessage({ id: `severity_impact.${severity}` }).toLowerCase(),
              quality: quality.toLowerCase(),
            }}
          />
          <p className="sw-mt-2">
            <span className="sw-mr-1">
              {intl.formatMessage({ id: 'severity_impact.help.line1' })}
            </span>
            <FormattedMessage id="severity_impact.help.line2" />
          </p>
        </>
      }
      footer={
        learnMoreUrl ? (
          <Link enableOpenInNewTab to={learnMoreUrl}>
            <FormattedMessage id="learn_more" />
          </Link>
        ) : undefined
      }
      title={
        <FormattedMessage
          id="severity_impact.title"
          values={{ x: intl.formatMessage({ id: `severity_impact.${severity}` }) }}
        />
      }
    >
      <BadgeSeverity
        ariaLabel={intl.formatMessage(
          { id: tooltipMessageId ?? 'software_impact.button' },
          {
            severity: intl.formatMessage({
              id: `severity_impact.${severity}`,
            }),
            quality: qualityName,
          },
        )}
        className={className}
        data-guiding-id="issue-3"
        data-spotlight-id="issue-3"
        quality={qualityName}
        severity={variant}
      />
    </Popover>
  );
}

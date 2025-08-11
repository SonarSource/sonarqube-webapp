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

import {
  BadgeSeverity,
  BadgeSeverityLevel,
  DropdownMenu,
  DropdownMenuAlign,
  Popover,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IMPACT_SEVERITIES } from '../../helpers/constants';
import { DocLink } from '../../helpers/doc-links';
import { translate } from '../../helpers/l10n';
import DocumentationLink from '../common/DocumentationLink';

export interface Props {
  className?: string;
  onSetSeverity?: (severity: SoftwareImpactSeverity, quality: SoftwareQuality) => Promise<void>;
  severity: SoftwareImpactSeverity;
  softwareQuality: SoftwareQuality;
  tooltipMessageId?: string;
  type?: 'issue' | 'rule';
}

export default function SoftwareImpactPill(props: Props) {
  const {
    className,
    severity,
    softwareQuality,
    type = 'issue',
    tooltipMessageId,
    onSetSeverity,
  } = props;
  const intl = useIntl();
  const quality = intl.formatMessage({ id: `software_quality.${softwareQuality}` });
  const [updatingSeverity, setUpdatingSeverity] = useState(false);

  const variant = {
    [SoftwareImpactSeverity.Blocker]: BadgeSeverityLevel.Blocker,
    [SoftwareImpactSeverity.High]: BadgeSeverityLevel.High,
    [SoftwareImpactSeverity.Medium]: BadgeSeverityLevel.Medium,
    [SoftwareImpactSeverity.Low]: BadgeSeverityLevel.Low,
    [SoftwareImpactSeverity.Info]: BadgeSeverityLevel.Info,
  }[severity];

  const handleSetSeverity = async (severity: SoftwareImpactSeverity, quality: SoftwareQuality) => {
    setUpdatingSeverity(true);
    await onSetSeverity?.(severity, quality);
    setUpdatingSeverity(false);
  };

  if (onSetSeverity && type === 'issue') {
    return (
      <DropdownMenu
        align={DropdownMenuAlign.Start}
        items={IMPACT_SEVERITIES.map((impactSeverity) => (
          <DropdownMenu.ItemButtonCheckable
            isChecked={impactSeverity === severity}
            isDisabled={impactSeverity === severity}
            key={impactSeverity}
            onClick={() => handleSetSeverity(impactSeverity, softwareQuality)}
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
            {
              id: tooltipMessageId ?? `software_impact.button.change`,
            },
            {
              severity: intl.formatMessage({
                id: `severity_impact.${severity}`,
              }),
              quality,
            },
          )}
          className={className}
          data-guiding-id="issue-3"
          isLoading={updatingSeverity}
          quality={quality}
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
              severity: translate('severity_impact', severity).toLowerCase(),
              quality: quality.toLowerCase(),
            }}
          />
          <div className="sw-mt-2">
            {intl.formatMessage(
              { id: `severity_impact.help.description` },
              {
                p1: (text) => <p>{text}</p>,
                p: (text) => (type === 'issue' ? <p className="sw-mt-2">{text}</p> : ''),
              },
            )}
          </div>
        </>
      }
      footer={
        <DocumentationLink enableOpenInNewTab standalone to={DocLink.MQRSeverity}>
          {translate('severity_impact.help.link')}
        </DocumentationLink>
      }
      title={intl.formatMessage(
        { id: 'severity_impact.title' },
        { x: translate('severity_impact', severity) },
      )}
    >
      <BadgeSeverity
        ariaLabel={intl.formatMessage(
          {
            id: tooltipMessageId ?? 'software_impact.button.popover',
          },
          {
            severity: intl.formatMessage({ id: `severity_impact.${severity}` }),
            quality,
          },
        )}
        className={className}
        data-guiding-id="issue-3"
        isLoading={updatingSeverity}
        quality={quality}
        severity={variant}
      />
    </Popover>
  );
}

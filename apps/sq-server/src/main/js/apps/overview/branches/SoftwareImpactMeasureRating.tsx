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

import { RatingBadgeRating, RatingBadgeSize } from '@sonarsource/echoes-react';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey } from '~shared/types/metrics';
import RatingTooltipContent from '~sq-server-commons/components/measure/RatingTooltipContent';
import RatingComponent from '~sq-server-commons/context/metrics/RatingComponent';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Branch } from '~sq-server-commons/types/branch-like';

export interface SoftwareImpactMeasureRatingProps {
  branch?: Branch;
  componentKey: string;
  ratingMetricKey: MetricKey;
  softwareQuality: SoftwareQuality;
}

export function SoftwareImpactMeasureRating(props: Readonly<SoftwareImpactMeasureRatingProps>) {
  const { ratingMetricKey, componentKey, softwareQuality, branch } = props;
  const { data: isStandardMode = false } = useStandardExperienceModeQuery();

  const intl = useIntl();

  const getSoftwareImpactRatingTooltip = useCallback(
    (rating: RatingBadgeRating, value: string | undefined) => {
      if (rating === undefined) {
        return null;
      }

      if (isStandardMode && value !== undefined) {
        return <RatingTooltipContent metricKey={ratingMetricKey} value={value} />;
      }

      function ratingToWorseSeverity(rating: string): SoftwareImpactSeverity {
        return (
          {
            B: SoftwareImpactSeverity.Low,
            C: SoftwareImpactSeverity.Medium,
            D: SoftwareImpactSeverity.High,
            E: SoftwareImpactSeverity.High,
          }[rating] ?? SoftwareImpactSeverity.Low
        );
      }

      const maintainabilityMessageId =
        softwareQuality === SoftwareQuality.Maintainability
          ? `.${SoftwareQuality.Maintainability}`
          : '';

      const softwareQualityLabel = intl.formatMessage({
        id: SOFTWARE_QUALITY_LABELS[softwareQuality],
      });
      const severityLabel = intl.formatMessage({
        id: `overview.measures.software_impact.severity.${ratingToWorseSeverity(
          rating,
        )}.improve_tooltip`,
      });

      return intl.formatMessage(
        {
          id:
            rating === 'A'
              ? `overview.measures.software_impact.improve_rating_tooltip${maintainabilityMessageId}.A`
              : `overview.measures.software_impact.improve_rating_tooltip${maintainabilityMessageId}`,
        },
        {
          softwareQuality: softwareQualityLabel,
          _softwareQuality: softwareQualityLabel.toLowerCase(),
          ratingLabel: rating,
          severity: severityLabel,
        },
      );
    },
    [intl, softwareQuality],
  );

  const getLabel = useCallback(
    (rating: RatingBadgeRating) =>
      intl.formatMessage(
        {
          id: 'overview.project.software_impact.has_rating',
        },
        {
          softwareQuality: intl.formatMessage({ id: SOFTWARE_QUALITY_LABELS[softwareQuality] }),
          rating,
        },
      ),
    [intl, softwareQuality],
  );

  return (
    <RatingComponent
      branchLike={branch}
      className="sw-text-sm"
      componentKey={componentKey}
      getLabel={getLabel}
      getTooltip={getSoftwareImpactRatingTooltip}
      ratingMetric={ratingMetricKey}
      size={RatingBadgeSize.Medium}
    />
  );
}

export default SoftwareImpactMeasureRating;

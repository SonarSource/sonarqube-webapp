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

import { Heading, Text } from '@sonarsource/echoes-react';
import { sortBy } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { DiscreetLink, Link } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { MetricType } from '~shared/types/metrics';
import { Rule, RuleActivationAdvanced } from '~shared/types/rules';
import { toShortISO8601String } from '~sq-server-commons/helpers/dates';
import { translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { getRulesUrl } from '~sq-server-commons/helpers/urls';
import { useListRulesQuery } from '~sq-server-commons/queries/rules';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';

const RULES_LIMIT = 10;

interface ExtendedRule extends Rule {
  activations: number;
}

export function EvolutionRules() {
  const intl = useIntl();

  const periodStartDate = React.useMemo(() => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    return toShortISO8601String(startDate);
  }, []);

  const { data } = useListRulesQuery({
    asc: false,
    available_since: periodStartDate,
    f: 'name,langName,actives',
    ps: RULES_LIMIT,
    s: 'createdAt',
  });

  const latestRulesTotal = data?.paging.total;
  const latestRules = data ? sortBy(parseRules(data.rules, data.actives), 'langName') : undefined;

  if (!(isDefined(latestRulesTotal) && latestRulesTotal !== 0) || !latestRules) {
    return null;
  }

  return (
    <section aria-label={intl.formatMessage({ id: 'quality_profiles.latest_new_rules' })}>
      <Heading as="h2" hasMarginBottom>
        {intl.formatMessage({ id: 'quality_profiles.latest_new_rules' })}
      </Heading>

      <ul className="sw-flex sw-flex-col sw-gap-4 sw-typo-default">
        {latestRules.map((rule) => (
          <li className="sw-flex sw-flex-col sw-gap-1" key={rule.key}>
            <div className="sw-truncate">
              <DiscreetLink to={getRulesUrl({ rule_key: rule.key })}>{rule.name}</DiscreetLink>
            </div>

            <Text className="sw-truncate" isSubtle>
              {rule.activations
                ? translateWithParameters(
                    'quality_profiles.latest_new_rules.activated',
                    rule.langName!,
                    rule.activations,
                  )
                : translateWithParameters(
                    'quality_profiles.latest_new_rules.not_activated',
                    rule.langName!,
                  )}
            </Text>
          </li>
        ))}
      </ul>

      {latestRulesTotal > RULES_LIMIT && (
        <div className="sw-mt-6 sw-typo-semibold">
          <Link to={getRulesUrl({ available_since: periodStartDate })}>
            {intl.formatMessage(
              { id: 'quality_profiles.latest_new_rules.see_all_x' },
              { count: formatMeasure(latestRulesTotal, MetricType.ShortInteger) },
            )}
          </Link>
        </div>
      )}
    </section>
  );
}

function parseRules(
  rules: Rule[],
  actives?: Record<string, RuleActivationAdvanced[]>,
): ExtendedRule[] {
  return rules.map((rule) => {
    const activations = actives?.[rule.key]?.length ?? 0;

    return { ...rule, activations };
  });
}

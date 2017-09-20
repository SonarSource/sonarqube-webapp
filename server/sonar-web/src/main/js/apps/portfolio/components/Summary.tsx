/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
import * as React from 'react';
import { Link } from 'react-router';
import LanguageDistributionContainer from '../../../components/charts/LanguageDistributionContainer';
import Measure from '../../../components/measure/Measure';
import { translate } from '../../../helpers/l10n';
import { getComponentDrilldownUrl } from '../../../helpers/urls';

interface Props {
  component: { description?: string; key: string };
  measures: { [key: string]: string | undefined };
}

export default function Summary({ component, measures }: Props) {
  const projects = measures['projects'];
  const ncloc = measures['ncloc'];
  const nclocDistribution = measures['ncloc_language_distribution'];

  return (
    <section id="portfolio-summary" className="portfolio-section portfolio-section-summary">
      {component.description && <div className="big-spacer-bottom">{component.description}</div>}

      <ul className="portfolio-grid">
        <li>
          <div className="portfolio-measure-secondary-value">
            <Link to={getComponentDrilldownUrl(component.key, 'projects')}>
              <Measure
                measure={{ metric: { key: 'projects', type: 'SHORT_INT' }, value: projects }}
              />
            </Link>
          </div>
          {translate('projects')}
        </li>
        <li>
          <div className="portfolio-measure-secondary-value">
            <Link to={getComponentDrilldownUrl(component.key, 'ncloc')}>
              <Measure measure={{ metric: { key: 'ncloc', type: 'SHORT_INT' }, value: ncloc }} />
            </Link>
          </div>
          {translate('metric.ncloc.name')}
        </li>
      </ul>

      {nclocDistribution && (
        <div className="huge-spacer-top" style={{ width: 260 }}>
          <LanguageDistributionContainer distribution={nclocDistribution} />
        </div>
      )}
    </section>
  );
}

/*
 * SonarQube :: Web
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
import React from 'react';

import ComponentName from './ComponentName';
import ComponentMeasure from './ComponentMeasure';
import ComponentDetach from './ComponentDetach';
import ComponentPin from './ComponentPin';


const Component = ({ component, previous, coverageMetric, onBrowse }) => {
  let componentAction = null;

  switch (component.qualifier) {
    case 'FIL':
    case 'UTS':
      componentAction = <ComponentPin component={component}/>;
      break;
    default:
      componentAction = <ComponentDetach component={component}/>;
  }

  return (
      <tr>
        <td className="thin nowrap">
          <span className="spacer-right">
            {componentAction}
          </span>
        </td>
        <td className="code-name-cell">
          <ComponentName
              component={component}
              previous={previous}
              onBrowse={onBrowse}/>
        </td>
        <td className="thin nowrap text-right">
          <div className="code-components-cell">
            <ComponentMeasure
                component={component}
                metricKey="ncloc"
                metricType="SHORT_INT"/>
          </div>
        </td>
        <td className="thin nowrap text-right">
          <div className="code-components-cell">
            <ComponentMeasure
                component={component}
                metricKey="sqale_index"
                metricType="SHORT_WORK_DUR"/>
          </div>
        </td>
        <td className="thin nowrap text-right">
          <div className="code-components-cell">
            <ComponentMeasure
                component={component}
                metricKey="violations"
                metricType="SHORT_INT"/>
          </div>
        </td>
        <td className="thin nowrap text-right">
          <div className="code-components-cell">
            <ComponentMeasure
                component={component}
                metricKey={coverageMetric}
                metricType="PERCENT"/>
          </div>
        </td>
        <td className="thin nowrap text-right">
          <div className="code-components-cell">
            <ComponentMeasure
                component={component}
                metricKey="duplicated_lines_density"
                metricType="PERCENT"/>
          </div>
        </td>
      </tr>
  );
};


export default Component;

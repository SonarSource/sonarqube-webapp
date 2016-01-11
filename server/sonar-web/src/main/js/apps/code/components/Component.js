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
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import ComponentName from './ComponentName';
import ComponentMeasure from './ComponentMeasure';
import ComponentDetach from './ComponentDetach';
import ComponentPin from './ComponentPin';


const TOP_OFFSET = 200;
const BOTTOM_OFFSET = 10;


class Component extends React.Component {
  componentDidMount () {
    this.handleUpdate();
  }

  componentDidUpdate () {
    this.handleUpdate();
  }

  handleUpdate () {
    const { selected } = this.props;
    if (selected) {
      setTimeout(() => {
        this.handleScroll();
      }, 0);
    }
  }

  handleScroll () {
    const node = ReactDOM.findDOMNode(this);
    const position = node.getBoundingClientRect();
    const { top, bottom } = position;
    if (bottom > window.innerHeight - BOTTOM_OFFSET) {
      window.scrollTo(0, bottom - window.innerHeight + window.scrollY + BOTTOM_OFFSET);
    } else if (top < TOP_OFFSET) {
      window.scrollTo(0, top + window.scrollY - TOP_OFFSET);
    }
  }

  render () {
    const { component, selected, previous, coverageMetric, onBrowse } = this.props;

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
        <tr className={classNames({ 'selected': selected })}>
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
  }
}


function mapStateToProps (state, ownProps) {
  return {
    selected: state.current.searchSelectedItem === ownProps.component
  };
}

export default connect(mapStateToProps)(Component);

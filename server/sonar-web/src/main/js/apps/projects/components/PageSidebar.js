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
import React from 'react';
import { Link } from 'react-router';
import CoverageFilter from '../filters/CoverageFilter';
import DuplicationsFilter from '../filters/DuplicationsFilter';
import SizeFilter from '../filters/SizeFilter';
import QualityGateFilter from '../filters/QualityGateFilter';
import ReliabilityFilter from '../filters/ReliabilityFilter';
import SecurityFilter from '../filters/SecurityFilter';
import MaintainabilityFilter from '../filters/MaintainabilityFilter';

export default class PageSidebar extends React.Component {
  static propTypes = {
    query: React.PropTypes.object.isRequired
  };

  render () {
    const isFiltered = Object.keys(this.props.query).some(key => this.props.query[key] != null);

    return (
        <div className="search-navigator-facets-list">
          <div className="projects-facets-header clearfix">
            {isFiltered && (
                <div className="projects-facets-reset">
                  <Link to="/projects" className="button button-red">
                    Clear All Filters
                  </Link>
                </div>
            )}

            <h3>Filters</h3>
          </div>

          <QualityGateFilter query={this.props.query}/>
          <ReliabilityFilter query={this.props.query}/>
          <SecurityFilter query={this.props.query}/>
          <MaintainabilityFilter query={this.props.query}/>
          <CoverageFilter query={this.props.query}/>
          <DuplicationsFilter query={this.props.query}/>
          <SizeFilter query={this.props.query}/>
        </div>
    );
  }
}

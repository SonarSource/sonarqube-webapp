/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import { sortBy, uniq, without } from 'lodash';
import { formatFacetStat, Query, ReferencedComponent } from '../utils';
import { searchProjects, getTree } from '../../../api/components';
import { Component } from '../../../app/types';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import FacetFooter from '../../../components/facet/FacetFooter';
import Organization from '../../../components/shared/Organization';
import QualifierIcon from '../../../components/icons-components/QualifierIcon';
import { translate } from '../../../helpers/l10n';
import DeferredSpinner from '../../../components/common/DeferredSpinner';

interface Props {
  component: Component | undefined;
  loading?: boolean;
  fetching: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  organization: { key: string } | undefined;
  projects: string[];
  referencedComponents: { [componentKey: string]: ReferencedComponent };
  stats: { [x: string]: number } | undefined;
}

export default class ProjectFacet extends React.PureComponent<Props> {
  property = 'projects';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { projects } = this.props;
    if (multiple) {
      const newValue = sortBy(
        projects.includes(itemValue) ? without(projects, itemValue) : [...projects, itemValue]
      );
      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: projects.includes(itemValue) && projects.length < 2 ? [] : [itemValue]
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  handleSearch = (query: string) => {
    const { component, organization } = this.props;
    if (component && ['VW', 'SVW', 'APP'].includes(component.qualifier)) {
      return getTree(component.key, { ps: 50, q: query, qualifiers: 'TRK' }).then(response =>
        response.components.map((component: any) => ({
          label: component.name,
          organization: component.organization,
          value: component.refId
        }))
      );
    }

    return searchProjects({
      ps: 50,
      filter: query ? `query = "${query}"` : '',
      organization: organization && organization.key
    }).then(response =>
      response.components.map(component => ({
        label: component.name,
        organization: component.organization,
        value: component.id
      }))
    );
  };

  handleSelect = (option: { value: string }) => {
    const { projects } = this.props;
    this.props.onChange({ [this.property]: uniq([...projects, option.value]) });
  };

  getStat(project: string) {
    const { stats } = this.props;
    return stats ? stats[project] : undefined;
  }

  getProjectName(project: string) {
    const { referencedComponents } = this.props;
    return referencedComponents[project] ? referencedComponents[project].name : project;
  }

  renderName(project: string) {
    const { organization, referencedComponents } = this.props;
    return referencedComponents[project] ? (
      <span>
        <QualifierIcon className="little-spacer-right" qualifier="TRK" />
        {!organization && (
          <Organization link={false} organizationKey={referencedComponents[project].organization} />
        )}
        {referencedComponents[project].name}
      </span>
    ) : (
      <span>
        <QualifierIcon className="little-spacer-right" qualifier="TRK" />
        {project}
      </span>
    );
  }

  renderOption = (option: { label: string; organization: string }) => {
    return (
      <span>
        <Organization link={false} organizationKey={option.organization} />
        {option.label}
      </span>
    );
  };

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const projects = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetItemsList>
        {projects.map(project => (
          <FacetItem
            active={this.props.projects.includes(project)}
            key={project}
            loading={this.props.loading}
            name={this.renderName(project)}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(project))}
            tooltip={this.props.projects.length === 1 && !this.props.projects.includes(project)}
            value={project}
          />
        ))}
      </FacetItemsList>
    );
  }

  renderFooter() {
    if (!this.props.stats) {
      return null;
    }

    return (
      <FacetFooter
        minimumQueryLength={3}
        onSearch={this.handleSearch}
        onSelect={this.handleSelect}
        renderOption={this.renderOption}
      />
    );
  }

  render() {
    const values = this.props.projects.map(project => this.getProjectName(project));
    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={values}
        />
        <DeferredSpinner loading={this.props.fetching} />
        {this.props.open && this.renderList()}
        {this.props.open && this.renderFooter()}
      </FacetBox>
    );
  }
}

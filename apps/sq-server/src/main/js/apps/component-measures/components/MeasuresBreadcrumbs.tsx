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

import { LinkHighlight, LinkStandalone } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { Breadcrumbs, ClipboardIconButton } from '~design-system';
import { ComponentQualifier } from '~shared/types/component';
import { getBreadcrumbs } from '~sq-server-shared/api/components';
import { isSameBranchLike } from '~sq-server-shared/helpers/branch-like';
import { KeyboardKeys } from '~sq-server-shared/helpers/keycodes';
import { translate } from '~sq-server-shared/helpers/l10n';
import { collapsePath, limitComponentName } from '~sq-server-shared/helpers/path';
import { getBranchLikeQuery } from '~sq-server-shared/sonar-aligned/helpers/branch-like';
import { BranchLike } from '~sq-server-shared/types/branch-like';
import { isProject } from '~sq-server-shared/types/component';
import { Component, ComponentMeasure, ComponentMeasureIntern } from '~sq-server-shared/types/types';

interface Props {
  backToFirst: boolean;
  branchLike?: BranchLike;
  className?: string;
  component: ComponentMeasure;
  handleSelect: (component: ComponentMeasureIntern) => void;
  rootComponent: Component;
}

interface State {
  breadcrumbs: ComponentMeasure[];
}

export default class MeasuresBreadcrumbs extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { breadcrumbs: [] };

  componentDidMount() {
    this.mounted = true;
    this.fetchBreadcrumbs();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.component !== prevProps.component ||
      !isSameBranchLike(prevProps.branchLike, this.props.branchLike)
    ) {
      this.fetchBreadcrumbs();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === KeyboardKeys.LeftArrow) {
      event.preventDefault();
      const { breadcrumbs } = this.state;
      if (breadcrumbs.length > 1) {
        const idx = this.props.backToFirst ? 0 : breadcrumbs.length - 2;
        this.props.handleSelect(breadcrumbs[idx]);
      }
    }
  };

  fetchBreadcrumbs = () => {
    const { branchLike, component, rootComponent } = this.props;
    const isRoot = component.key === rootComponent.key;
    if (isRoot) {
      if (this.mounted) {
        this.setState({ breadcrumbs: [component] });
      }
      return;
    }
    getBreadcrumbs({ component: component.key, ...getBranchLikeQuery(branchLike) }).then(
      (breadcrumbs) => {
        if (this.mounted) {
          this.setState({ breadcrumbs });
        }
      },
      () => {},
    );
  };

  render() {
    const { breadcrumbs } = this.state;
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

    if (breadcrumbs.length <= 0) {
      return null;
    }

    return (
      <Breadcrumbs
        actions={
          !isProject(lastBreadcrumb.qualifier) &&
          lastBreadcrumb.path && <ClipboardIconButton copyValue={lastBreadcrumb.path} />
        }
        ariaLabel={translate('breadcrumbs')}
        className={classNames(this.props.className)}
        maxWidth={500}
      >
        {breadcrumbs.map((component) => (
          <LinkStandalone
            highlight={LinkHighlight.Subdued}
            key={component.key}
            onClick={() => {
              this.props.handleSelect(component);
            }}
            shouldBlurAfterClick
            shouldPreventDefault
            to="#"
          >
            {component.qualifier === ComponentQualifier.Directory
              ? collapsePath(component.name, 15)
              : limitComponentName(component.name)}
          </LinkStandalone>
        ))}
      </Breadcrumbs>
    );
  }
}

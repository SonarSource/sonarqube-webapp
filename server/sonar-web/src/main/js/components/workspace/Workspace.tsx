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
import * as PropTypes from 'prop-types';
import { omit, uniqBy } from 'lodash';
import { WorkspaceContext, ComponentDescriptor, RuleDescriptor } from './context';
import WorkspaceNav from './WorkspaceNav';
import WorkspacePortal from './WorkspacePortal';
import { lazyLoad } from '../lazyLoad';
import './styles.css';

const WorkspaceRuleViewer = lazyLoad(() => import('./WorkspaceRuleViewer'));
const WorkspaceComponentViewer = lazyLoad(() => import('./WorkspaceComponentViewer'));

interface State {
  components: ComponentDescriptor[];
  height: number;
  maximized?: boolean;
  open: { component?: string; rule?: string };
  rules: RuleDescriptor[];
}

const MIN_HEIGHT = 0.05;
const MAX_HEIGHT = 0.85;
const INITIAL_HEIGHT = 300;

const STORAGE_KEY = 'sonarqube-workspace';
const TYPE_KEY = '__type__';

export default class Workspace extends React.PureComponent<{}, State> {
  mounted = false;

  static childContextTypes = {
    workspace: PropTypes.object
  };

  constructor(props: {}) {
    super(props);
    this.state = { height: INITIAL_HEIGHT, open: {}, ...this.loadWorkspace() };
  }

  getChildContext = (): { workspace: WorkspaceContext } => {
    return { workspace: { openComponent: this.openComponent, openRule: this.openRule } };
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate(_: {}, prevState: State) {
    if (prevState.components !== this.state.components || prevState.rules !== this.state.rules) {
      this.saveWorkspace();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadWorkspace = () => {
    try {
      const data: any[] = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '');
      const components: ComponentDescriptor[] = data.filter(x => x[TYPE_KEY] === 'component');
      const rules: RuleDescriptor[] = data.filter(x => x[TYPE_KEY] === 'rule');
      return { components, rules };
    } catch {
      // fail silently
      return { components: [], rules: [] };
    }
  };

  saveWorkspace = () => {
    const data = [
      // do not save line number, next time the file is open, it should be open on the first line
      ...this.state.components.map(x => omit({ ...x, [TYPE_KEY]: 'component' }, 'line')),
      ...this.state.rules.map(x => ({ ...x, [TYPE_KEY]: 'rule' }))
    ];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // fail silently
    }
  };

  openComponent = (component: ComponentDescriptor) => {
    this.setState((state: State): Partial<State> => ({
      components: uniqBy([...state.components, component], component => component.key),
      open: { component: component.key }
    }));
  };

  reopenComponent = (componentKey: string) => {
    this.setState({ open: { component: componentKey } });
  };

  openRule = (rule: RuleDescriptor) => {
    this.setState((state: State): Partial<State> => ({
      open: { rule: rule.key },
      rules: uniqBy([...state.rules, rule], rule => rule.key)
    }));
  };

  reopenRule = (ruleKey: string) => {
    this.setState({ open: { rule: ruleKey } });
  };

  closeComponent = (componentKey: string) => {
    this.setState((state: State): Partial<State> => ({
      components: state.components.filter(x => x.key !== componentKey),
      open: {
        ...state.open,
        component: state.open.component === componentKey ? undefined : state.open.component
      }
    }));
  };

  closeRule = (ruleKey: string) => {
    this.setState((state: State): Partial<State> => ({
      rules: state.rules.filter(x => x.key !== ruleKey),
      open: {
        ...state.open,
        rule: state.open.rule === ruleKey ? undefined : state.open.rule
      }
    }));
  };

  handleComponentLoad = (details: { key: string; name: string; qualifier: string }) => {
    if (this.mounted) {
      const { key, name, qualifier } = details;
      this.setState((state: State): Partial<State> => ({
        components: state.components.map(
          component => (component.key === key ? { ...component, name, qualifier } : component)
        )
      }));
    }
  };

  handleRuleLoad = (details: { key: string; name: string }) => {
    if (this.mounted) {
      const { key, name } = details;
      this.setState((state: State): Partial<State> => ({
        rules: state.rules.map(rule => (rule.key === key ? { ...rule, name } : rule))
      }));
    }
  };

  collapse = () => {
    this.setState({ open: {} });
  };

  maximize = () => {
    this.setState({ maximized: true });
  };

  minimize = () => {
    this.setState({ maximized: false });
  };

  resize = (deltaY: number) => {
    const minHeight = window.innerHeight * MIN_HEIGHT;
    const maxHeight = window.innerHeight * MAX_HEIGHT;
    this.setState((state: State): Partial<State> => ({
      height: Math.min(maxHeight, Math.max(minHeight, state.height - deltaY))
    }));
  };

  render() {
    const { components, open, rules } = this.state;

    const openComponent = open.component && components.find(x => x.key === open.component);
    const openRule = open.rule && rules.find(x => x.key === open.rule);

    const height = this.state.maximized ? window.innerHeight * MAX_HEIGHT : this.state.height;

    return (
      <>
        {this.props.children}
        <WorkspacePortal>
          <WorkspaceNav
            components={components}
            onComponentClose={this.closeComponent}
            onComponentOpen={this.reopenComponent}
            onRuleClose={this.closeRule}
            onRuleOpen={this.reopenRule}
            open={this.state.open}
            rules={this.state.rules}
          />
          {openComponent && (
            <WorkspaceComponentViewer
              component={openComponent}
              height={height}
              maximized={this.state.maximized}
              onClose={this.closeComponent}
              onCollapse={this.collapse}
              onLoad={this.handleComponentLoad}
              onMaximize={this.maximize}
              onMinimize={this.minimize}
              onResize={this.resize}
            />
          )}
          {openRule && (
            <WorkspaceRuleViewer
              height={height}
              maximized={this.state.maximized}
              onClose={this.closeRule}
              onCollapse={this.collapse}
              onLoad={this.handleRuleLoad}
              onMaximize={this.maximize}
              onMinimize={this.minimize}
              onResize={this.resize}
              rule={openRule}
            />
          )}
        </WorkspacePortal>
      </>
    );
  }
}

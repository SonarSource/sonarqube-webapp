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

import { withTheme } from '@emotion/react';
import { toast } from '@sonarsource/echoes-react';
import { QueryClient } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Route } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { Theme } from '~design-system';
import { withRouter } from '~shared/components/hoc/withRouter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { Extension as TypeExtension } from '~shared/types/common';
import { Location, Router } from '~shared/types/router';
import { DefaultExtensionPageTemplate } from '~sq-server-commons/components/ui/DefaultExtensionPageTemplate';
import { DefaultExtensionWrapper } from '~sq-server-commons/components/ui/DefaultExtensionWrapper';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { getExtension } from '~sq-server-commons/helpers/extensions';
import { getCurrentL10nBundle } from '~sq-server-commons/helpers/l10nBundle';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { withQueryClient } from '~sq-server-commons/queries/withQueryClientHoc';
import { AppState } from '~sq-server-commons/types/appstate';
import { ExtensionStartMethod } from '~sq-server-commons/types/extension';
import { Feature } from '~sq-server-commons/types/features';
import { CurrentUser, HomePage } from '~sq-server-commons/types/users';
import GlobalAdminPageExtension from './GlobalAdminPageExtension';
import ProjectAdminPageExtension from './ProjectAdminPageExtension';

export interface ExtensionProps extends WrappedComponentProps {
  appState: AppState;
  availableFeatures?: Feature[];
  currentUser: CurrentUser;
  extension: TypeExtension;
  location: Location;
  options?: Record<string, unknown>;
  queryClient: QueryClient;
  router: Router;
  theme: Theme;
  updateCurrentUserHomepage: (homepage: HomePage) => void;
  usesSidebarNavigation?: boolean;
}

interface State {
  extensionElement?: React.ReactElement<unknown>;
}

// Maps internal SonarSource extension keys to their page templates.
// Different page contexts (project, global) will need different templates.
// Only extension keys listed here will receive ExtensionPageTemplate and usesSidebarNavigation.
export const EXTENSION_PAGE_TEMPLATES: Record<string, React.ComponentType | undefined> = {
  'developer-server/application-console': ProjectPageTemplate,
  'governance/application_report': ProjectPageTemplate,
  'governance/console': ProjectPageTemplate,
  'governance/portfolios': GlobalPageTemplate,
  'governance/report': ProjectPageTemplate,
  'governance/views_console': GlobalPageTemplate,
  'securityreport/securityreport': ProjectPageTemplate,
};

export const projectAdminExtensionMigratedRoutes = () =>
  Object.entries(EXTENSION_PAGE_TEMPLATES)
    .filter(([, template]) => template === ProjectPageTemplate)
    .map(([extensionKey]) => (
      <Route
        element={<ProjectAdminPageExtension />}
        key={extensionKey}
        path={`admin/extension/${extensionKey}`}
      />
    ));

// Generates routes for global admin extensions that use GlobalPageTemplate.
export const globalAdminExtensionMigratedRoutes = () =>
  Object.entries(EXTENSION_PAGE_TEMPLATES)
    .filter(([extensionKey, template]) => {
      // Filter out governance/portfolios as it has a custom route at /portfolios
      return template === GlobalPageTemplate && extensionKey !== 'governance/portfolios';
    })
    .map(([extensionKey]) => (
      <Route
        element={<GlobalAdminPageExtension />}
        key={extensionKey}
        path={`extension/${extensionKey}`}
      />
    ));

class Extension extends React.PureComponent<ExtensionProps, State> {
  container?: HTMLElement | null;
  state: State = {};
  stop?: Function;

  componentDidMount() {
    this.startExtension();
  }

  componentDidUpdate(prevProps: ExtensionProps) {
    if (prevProps.extension.key !== this.props.extension.key) {
      this.stopExtension();
      this.startExtension();
    } else if (!isEqual(prevProps.location, this.props.location)) {
      this.startExtension();
    }
  }

  componentWillUnmount() {
    this.stopExtension();
  }

  handleStart = (start: ExtensionStartMethod, receivesExtensionPageTemplate: boolean) => {
    const { queryClient, theme, usesSidebarNavigation } = this.props;

    const isInternalExtension = this.props.extension.key in EXTENSION_PAGE_TEMPLATES;
    const InternalExtensionPageTemplate = EXTENSION_PAGE_TEMPLATES[this.props.extension.key];

    // Extensions using the new layout receive a page template and usesSidebarNavigation
    const usesNewLayout = isInternalExtension || receivesExtensionPageTemplate;

    const ExtensionPageTemplate =
      InternalExtensionPageTemplate ??
      (receivesExtensionPageTemplate ? DefaultExtensionPageTemplate : undefined);

    const result = start({
      appState: this.props.appState,
      availableFeatures: this.props.availableFeatures,
      baseUrl: getBaseUrl(),
      currentUser: this.props.currentUser,
      el: this.container,
      ...(ExtensionPageTemplate && { ExtensionPageTemplate }),
      intl: this.props.intl,
      l10nBundle: getCurrentL10nBundle(),
      location: this.props.location,
      queryClient,
      router: this.props.router,
      theme,
      // See SONAR-16207 and core-extension-enterprise-server/src/main/js/portfolios/components/Header.tsx
      // for more information on why we're passing this as a prop to an extension.
      updateCurrentUserHomepage: this.props.updateCurrentUserHomepage,
      ...(usesNewLayout && { usesSidebarNavigation }),
      ...this.props.options,
    });

    if (result) {
      if (React.isValidElement(result)) {
        // Legacy extensions get wrapped in DefaultExtensionWrapper (provides PageGrid + footer)
        const wrappedResult = usesNewLayout ? (
          result
        ) : (
          <DefaultExtensionWrapper>{result}</DefaultExtensionWrapper>
        );

        this.setState({
          extensionElement: wrappedResult,
        });
      } else if (typeof result === 'function') {
        this.stop = result;
      }
    }
  };

  handleFailure = () => {
    toast.error({
      description: <FormattedMessage id="page_extension_failed" />,
      duration: 'short',
    });
  };

  startExtension() {
    getExtension(this.props.extension.key).then((extension) => {
      if (extension) {
        this.handleStart(extension.start, extension.receivesExtensionPageTemplate);
      } else {
        this.handleFailure();
      }
    }, this.handleFailure);
  }

  stopExtension() {
    if (this.stop) {
      this.stop();
      this.stop = undefined;
    } else {
      this.setState({ extensionElement: undefined });
    }
  }

  render() {
    return (
      // sw-contents (display: contents) makes this wrapper transparent to CSS Grid layout.
      // This allows extensions to render Layout components (AsideLeft, PageGrid) that need to be
      // direct grid children of ContentGrid (which is rendered by ComponentContainer).
      // Without display: contents, this div would break the grid-area placement.
      <div className="sw-contents">
        <Helmet title={this.props.extension.name} />

        {this.state.extensionElement ?? <div ref={(container) => (this.container = container)} />}
      </div>
    );
  }
}

function ExtensionWithAvailableFeaturesHoC(
  props: Readonly<Omit<ExtensionProps, 'availableFeatures' | 'usesSidebarNavigation'>>,
) {
  const availableFeatures = React.useContext(AvailableFeaturesContext);
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  return (
    <Extension
      {...props}
      availableFeatures={availableFeatures}
      usesSidebarNavigation={frontEndEngineeringEnableSidebarNavigation ?? false}
    />
  );
}

export default injectIntl(
  withRouter(
    withTheme(
      withAppStateContext(
        withCurrentUserContext(withQueryClient(ExtensionWithAvailableFeaturesHoC)),
      ),
    ),
  ),
);

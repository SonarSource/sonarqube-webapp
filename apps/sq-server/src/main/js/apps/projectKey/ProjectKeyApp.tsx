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
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { withRouter } from '~shared/components/hoc/withRouter';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { RecentHistory } from '~shared/helpers/recent-history';
import { Router } from '~shared/types/router';
import { changeKey } from '~sq-server-commons/api/components';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { Component } from '~sq-server-commons/types/types';
import { UpdateForm } from './UpdateForm';

interface Props {
  component: Component;
  router: Router;
}

function ProjectKeyApp({ component, router }: Readonly<Props>) {
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const intl = useIntl();

  const handleChangeKey = (newKey: string) => {
    return changeKey({ from: component.key, to: newKey }).then(() => {
      RecentHistory.remove(component.key);
      router.replace({ pathname: '/project/key', query: { id: newKey } });
    });
  };

  return (
    <ProjectPageTemplate
      description={intl.formatMessage({ id: 'update_key.page.description' })}
      disableBranchSelector
      title={intl.formatMessage({ id: 'update_key.page' })}
    >
      <A11ySkipTarget anchor="project_key_main" />

      {!frontEndEngineeringEnableSidebarNavigation && (
        <header className="sw-mb-4 sw-mt-8">
          <Heading as="h1" className="sw-mb-4">
            <FormattedMessage id="update_key.page" />
          </Heading>

          <Text as="p" className="sw-mb-4">
            <FormattedMessage id="update_key.page.description" />
          </Text>
        </header>
      )}

      <UpdateForm component={component} onKeyChange={handleChangeKey} />
    </ProjectPageTemplate>
  );
}

export default withComponentContext(withRouter(ProjectKeyApp));

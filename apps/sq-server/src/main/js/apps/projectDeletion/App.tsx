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

import { Text } from '@sonarsource/echoes-react';
import { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isApplication, isPortfolioLike } from '~shared/helpers/component';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import Form from './Form';
import { Header } from './Header';

function PageDescription({ qualifier }: Readonly<{ qualifier: string }>) {
  if (isPortfolioLike(qualifier)) {
    return <FormattedMessage id="portfolio_deletion.page.description" />;
  }

  if (isApplication(qualifier)) {
    return <FormattedMessage id="application_deletion.page.description" />;
  }

  return <FormattedMessage id="project_deletion.page.description" />;
}

export default function App() {
  const { component } = useContext(ComponentContext);
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const intl = useIntl();

  if (component === undefined) {
    return null;
  }

  return (
    <ProjectPageTemplate disableBranchSelector title={intl.formatMessage({ id: 'deletion.page' })}>
      <A11ySkipTarget anchor="deletion_main" />

      {!frontEndEngineeringEnableSidebarNavigation && <Header />}

      <Text as="p" className="sw-my-8">
        <PageDescription qualifier={component.qualifier} />
      </Text>

      <Form component={component} />
    </ProjectPageTemplate>
  );
}

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

import { Layout, Link, MessageCallout } from '@sonarsource/echoes-react';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { ComponentContext } from '../componentContext/ComponentContext';
import { IndexationContext } from './IndexationContext';

export function PageUnavailableDueToIndexation() {
  const indexationContext = useContext(IndexationContext);
  const { component } = useContext(ComponentContext);

  useEffect(() => {
    if (
      indexationContext !== null &&
      indexationContext.status.isCompleted &&
      !indexationContext.status.hasFailures
    ) {
      window.location.reload();
    }
  }, [
    indexationContext,
    indexationContext?.status.isCompleted,
    indexationContext?.status.hasFailures,
  ]);

  if (indexationContext === null) {
    return null;
  }

  const page = (
    <Layout.PageGrid>
      <Layout.PageContent>
        <MessageCallout className="sw-mt-10" variety="info">
          <FormattedMessage id="indexation.page_unavailable.description" />{' '}
          <FormattedMessage
            id="indexation.page_unavailable.description.additional_information"
            values={{
              link: (
                <Link
                  enableOpenInNewTab
                  to="https://docs.sonarsource.com/sonarqube/latest/instance-administration/reindexing/"
                >
                  <FormattedMessage id="learn_more" />
                </Link>
              ),
            }}
          />
        </MessageCallout>
      </Layout.PageContent>
    </Layout.PageGrid>
  );

  return isDefined(component) ? page : <Layout.ContentGrid>{page}</Layout.ContentGrid>;
}

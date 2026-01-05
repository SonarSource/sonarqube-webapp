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

import { Layout, Spinner } from '@sonarsource/echoes-react';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';
import { Card } from '~design-system';
import '~sq-server-commons/components/search-navigator.css';
import { getQualityGateUrl } from '~sq-server-commons/helpers/urls';
import { useQualityGatesQuery } from '~sq-server-commons/queries/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';
import '../styles.css';
import Details from './Details';
import List from './List';
import ListHeader from './ListHeader';

export default function App() {
  const { data, isLoading } = useQualityGatesQuery();
  const intl = useIntl();
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    qualitygates: qualityGates,
    actions: { create: canCreate },
  } = data ?? { qualitygates: [], actions: { create: false } };

  const openDefault = useCallback(
    (qualityGates?: QualityGate[]) => {
      if (!qualityGates || qualityGates.length === 0) {
        return;
      }
      const defaultQualityGate = qualityGates.find((gate) => Boolean(gate.isDefault));
      if (!defaultQualityGate) {
        return;
      }
      navigate(getQualityGateUrl(defaultQualityGate.name), { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    if (!name) {
      openDefault(qualityGates);
    }
  }, [name, openDefault, qualityGates]);

  const title = intl.formatMessage({ id: 'quality_gates.page' });

  return (
    <Layout.ContentGrid>
      <Helmet
        defer={false}
        titleTemplate={intl.formatMessage(
          { id: 'page_title.template.with_category' },
          { page: title },
        )}
      />

      <Layout.AsideLeft size="large">
        <ListHeader canCreate={canCreate} />
        <Spinner isLoading={isLoading}>
          <List currentQualityGate={name} qualityGates={qualityGates} />
        </Spinner>
      </Layout.AsideLeft>

      <Layout.PageGrid width="fluid">
        <Layout.PageContent>
          {name !== undefined && (
            <div>
              <Card>
                <Details qualityGateName={name} />
              </Card>
            </div>
          )}
        </Layout.PageContent>

        <GlobalFooter />
      </Layout.PageGrid>
    </Layout.ContentGrid>
  );
}

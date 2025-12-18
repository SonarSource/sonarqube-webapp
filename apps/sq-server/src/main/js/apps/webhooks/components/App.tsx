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

import { Layout, Link, Spinner } from '@sonarsource/echoes-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { LargeCenteredLayout } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import {
  createWebhook,
  deleteWebhook,
  searchWebhooks,
  updateWebhook,
} from '~sq-server-commons/api/webhooks';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { Component } from '~sq-server-commons/types/types';
import { WebhookResponse } from '~sq-server-commons/types/webhook';
import PageActions from './PageActions';
import PageHeader from './PageHeader';
import WebhooksList from './WebhooksList';

export interface AppProps {
  component?: Component;
}

export function App({ component }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<WebhookResponse[]>([]);

  const { formatMessage } = useIntl();
  const toUrl = useDocUrl(DocLink.Webhooks);

  const getScopeParams = useCallback(
    () => ({
      project: component?.key,
    }),
    [component?.key],
  );

  const handleCreate = useCallback(
    async (data: { name: string; secret?: string; url: string }) => {
      const createData = {
        name: data.name,
        url: data.url,
        ...(data.secret && { secret: data.secret }),
        ...getScopeParams(),
      };

      const { webhook } = await createWebhook(createData);
      setWebhooks([...webhooks, webhook]);
    },
    [getScopeParams, webhooks],
  );

  const fetchWebhooks = useCallback(async () => {
    try {
      const { webhooks } = await searchWebhooks(getScopeParams());
      setWebhooks(webhooks);
    } finally {
      setLoading(false);
    }
  }, [getScopeParams]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleDelete = useCallback(async (webhook: string) => {
    await deleteWebhook({ webhook });
    setWebhooks((webhooks) => webhooks.filter((item) => item.key !== webhook));
  }, []);

  const handleUpdate = useCallback(
    async (data: { name: string; secret?: string; url: string; webhook: string }) => {
      await updateWebhook({ ...data });
      setWebhooks((webhooks) =>
        webhooks.map((webhook) =>
          webhook.key === data.webhook
            ? {
                ...webhook,
                name: data.name,
                hasSecret: data.secret === undefined ? webhook.hasSecret : Boolean(data.secret),
                url: data.url,
              }
            : webhook,
        ),
      );
    },
    [],
  );

  const pageTitle = formatMessage({ id: 'webhooks.page' });
  const pageDescription = (
    <>
      <p>
        <FormattedMessage id="webhooks.description0" />
      </p>
      <p>
        <FormattedMessage
          id="webhooks.description1"
          values={{
            url: (
              <Link to={toUrl}>
                <FormattedMessage id="webhooks.documentation_link" />
              </Link>
            ),
          }}
        />
      </p>
    </>
  );

  const pageContent = (
    <Spinner isLoading={loading}>
      <WebhooksList onDelete={handleDelete} onUpdate={handleUpdate} webhooks={webhooks} />
    </Spinner>
  );

  if (isDefined(component)) {
    return (
      <LargeCenteredLayout className="sw-py-8" id="project-webhooks">
        <Suggestions suggestion={DocLink.Webhooks} />
        <Helmet defer={false} title={pageTitle} />

        <PageHeader>
          <PageActions loading={loading} onCreate={handleCreate} webhooksCount={webhooks.length} />
        </PageHeader>
        {pageContent}
      </LargeCenteredLayout>
    );
  }

  return (
    <>
      <Suggestions suggestion={DocLink.Webhooks} />
      <AdminPageTemplate
        actions={
          <Layout.PageHeader.Actions>
            <PageActions
              loading={loading}
              onCreate={handleCreate}
              webhooksCount={webhooks.length}
            />
          </Layout.PageHeader.Actions>
        }
        description={pageDescription}
        scrollBehavior="sticky"
        title={pageTitle}
      >
        {pageContent}
      </AdminPageTemplate>
    </>
  );
}

export default withComponentContext(App);

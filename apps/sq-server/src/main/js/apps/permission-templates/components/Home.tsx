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

import {
  Card,
  Layout,
  Link,
  Pagination,
  SearchInput,
  SearchInputWidth,
  Spinner,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isDefined } from '~shared/helpers/types';
import { Paging } from '~shared/types/paging';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { Permission, PermissionTemplate } from '~sq-server-commons/types/types';
import HeaderActions from './HeaderActions';
import List from './List';
import ProvisioningWarning from './ProvisioningWarning';

interface Props {
  loading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  paging?: Paging;
  permissionTemplates: PermissionTemplate[];
  permissions: Permission[];
  refresh: () => void;
  searchQuery: string;
  topQualifiers: string[];
}

export default function Home(props: Readonly<Props>) {
  const {
    loading,
    onPageChange,
    onSearchChange,
    paging,
    permissionTemplates,
    permissions,
    refresh,
    searchQuery,
    topQualifiers,
  } = props;
  const { formatMessage } = useIntl();
  const toUrl = useDocUrl(DocLink.PermissionTemplates);
  const displayList = !loading && permissionTemplates.length > 0;

  return (
    <AdminPageTemplate
      actions={<HeaderActions ready={!loading} refresh={refresh} />}
      description={
        <Layout.PageHeader.Description>
          <FormattedMessage
            id="permission_templates.page.description"
            values={{
              link: (text) => (
                <Link enableOpenInNewTab to={toUrl}>
                  {text}
                </Link>
              ),
            }}
          />
        </Layout.PageHeader.Description>
      }
      title={formatMessage({ id: 'permission_templates.page' })}
      width="fluid"
    >
      <ProvisioningWarning />

      <div className="sw-mb-4">
        <SearchInput
          id="permission_templates.search"
          minLength={2}
          onChange={onSearchChange}
          placeholderLabel={formatMessage({ id: 'permission_templates.search_placeholder' })}
          value={searchQuery}
          width={SearchInputWidth.Large}
        />
      </div>
      <div>
        <Card>
          <Card.Body>
            <Spinner isLoading={loading}>
              {displayList ? (
                <List
                  permissionTemplates={permissionTemplates}
                  permissions={permissions}
                  refresh={refresh}
                  topQualifiers={topQualifiers}
                />
              ) : (
                <div className="sw-py-8 sw-text-center">
                  {searchQuery ? (
                    <FormattedMessage
                      id="permission_templates.no_results"
                      values={{ query: <strong>{searchQuery}</strong> }}
                    />
                  ) : (
                    <FormattedMessage id="permission_templates.no_templates" />
                  )}
                </div>
              )}
            </Spinner>
            {displayList && (
              <div className="sw-flex sw-justify-center sw-mt-4">
                <Pagination
                  onChange={onPageChange}
                  page={paging?.pageIndex ?? 1}
                  totalPages={
                    isDefined(paging?.total) && isDefined(paging?.pageSize)
                      ? Math.ceil(paging.total / paging.pageSize)
                      : 0
                  }
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </AdminPageTemplate>
  );
}

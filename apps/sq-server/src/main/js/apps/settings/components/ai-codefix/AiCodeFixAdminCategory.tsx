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

import { Spinner, Text } from '@sonarsource/echoes-react';
import { throwGlobalError } from '~adapters/helpers/error';
import { ServiceInfo } from '~sq-server-commons/api/fix-suggestions';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { useAvailableFeatures } from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useGetServiceInfoQuery } from '~sq-server-commons/queries/fix-suggestions';
import { Feature } from '~sq-server-commons/types/features';
import AiCodeFixAdminCategoryErrorView, { ErrorListItem } from './AiCodeFixAdminCategoryErrorView';
import { AiCodeFixEnablementForm } from './AiCodeFixEnablementForm';
import { AiCodeFixPromotionMessage } from './AiCodeFixPromotionMessage';

export function AiCodeFixAdminCategory() {
  const {
    data,
    error,
    isPending,
    isError,
    isLoading,
    refetch: refreshServiceInfo,
  } = useGetServiceInfoQuery();

  const { hasFeature } = useAvailableFeatures();

  const retry = () => refreshServiceInfo().catch(throwGlobalError);

  if (!hasFeature(Feature.FixSuggestions) && !hasFeature(Feature.FixSuggestionsMarketing)) {
    return null;
  }

  if (hasFeature(Feature.FixSuggestionsMarketing)) {
    return <AiCodeFixPromotionMessage />;
  }

  if (isPending) {
    return (
      <div className="sw-p-8">
        <Spinner
          isLoading={isLoading}
          label={translate('property.aicodefix.admin.serviceInfo.spinner.label')}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <AiCodeFixAdminCategoryErrorView
        message={`${translate('property.aicodefix.admin.serviceInfo.result.requestError')} ${error?.status ?? 'No status'}`}
        onRetry={retry}
      />
    );
  }

  if (!data) {
    return (
      <AiCodeFixAdminCategoryErrorView
        message={translate('property.aicodefix.admin.serviceInfo.empty.response.label')}
        onRetry={retry}
      />
    );
  }

  return <ServiceInfoCheckValidResponseView onRetry={retry} response={data} />;
}

function ServiceInfoCheckValidResponseView({
  response,
  onRetry,
}: Readonly<{ onRetry: () => {}; response: ServiceInfo }>) {
  switch (response?.status) {
    case 'SUCCESS':
      return <AiCodeFixEnablementForm />;

    case 'TIMEOUT':
    case 'CONNECTION_ERROR':
      return (
        <AiCodeFixAdminCategoryErrorView
          message={translate('property.aicodefix.admin.serviceInfo.result.unresponsive.message')}
          onRetry={onRetry}
        >
          <div className="sw-flex-col">
            <Text as="p" className="sw-mt-4" colorOverride="echoes-color-text-danger">
              {translate('property.aicodefix.admin.serviceInfo.result.unresponsive.causes.title')}
            </Text>

            <Text as="ul" className="sw-ml-8">
              <ErrorListItem className="sw-mb-2">
                <Text colorOverride="echoes-color-text-danger">
                  {translate('property.aicodefix.admin.serviceInfo.result.unresponsive.causes.1')}
                </Text>

                <p>
                  <DocumentationLink enableOpenInNewTab to={DocLink.AiCodeFixEnabling}>
                    {translate('property.aicodefix.admin.serviceInfo.learnMore')}
                  </DocumentationLink>
                </p>
              </ErrorListItem>

              <ErrorListItem>
                <Text colorOverride="echoes-color-text-danger">
                  {translate('property.aicodefix.admin.serviceInfo.result.unresponsive.causes.2')}
                </Text>
              </ErrorListItem>
            </Text>
          </div>
        </AiCodeFixAdminCategoryErrorView>
      );

    case 'UNAUTHORIZED':
      return (
        <AiCodeFixAdminCategoryErrorView
          message={translate('property.aicodefix.admin.serviceInfo.result.unauthorized')}
          onRetry={onRetry}
        />
      );

    case 'SERVICE_ERROR':
      return (
        <AiCodeFixAdminCategoryErrorView
          message={translate('property.aicodefix.admin.serviceInfo.result.serviceError')}
          onRetry={onRetry}
        />
      );

    default:
      return (
        <AiCodeFixAdminCategoryErrorView
          message={`${translate('property.aicodefix.admin.serviceInfo.result.unknown')} ${response?.status ?? 'no status returned from the service'}`}
          onRetry={onRetry}
        />
      );
  }
}

/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import styled from '@emotion/styled';
import { ButtonGroup, Heading, LinkStandalone, Spinner, Text } from '@sonarsource/echoes-react';
import { OverviewQGPassedIcon, UnorderedList } from '~design-system';
import { throwGlobalError } from '~sonar-aligned/helpers/error';
import { ServiceInfo } from '../../../../api/fix-suggestions';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '../../../../app/components/available-features/withAvailableFeatures';
import DocumentationLink from '../../../../components/common/DocumentationLink';
import { LockIllustration } from '../../../../components/illustrations/LockIllustration';
import { DocLink } from '../../../../helpers/doc-links';
import { translate } from '../../../../helpers/l10n';
import { useGetServiceInfoQuery } from '../../../../queries/fix-suggestions';
import { Feature } from '../../../../types/features';
import PromotedSection from '../../../overview/branches/PromotedSection';
import AiCodeFixAdminCategoryErrorView, {
  ErrorLabel,
  ErrorListItem,
} from './AiCodeFixAdminCategoryErrorView';
import AiCodeFixEnablementForm from './AiCodeFixEnablementForm';

interface Props extends WithAvailableFeaturesProps {}

function AiCodeFixAdminCategory({ hasFeature }: Readonly<Props>) {
  const {
    data,
    error,
    isPending,
    isError,
    isLoading,
    refetch: refreshServiceInfo,
  } = useGetServiceInfoQuery();

  const retry = () => refreshServiceInfo().catch(throwGlobalError);

  if (!hasFeature(Feature.FixSuggestions)) {
    return null;
  }

  if (isPending) {
    return SubscriptionCheckPendingMessage(isLoading);
  }

  if (isError) {
    return (
      <AiCodeFixAdminCategoryErrorView
        onRetry={retry}
        message={`${translate('property.aicodefix.admin.serviceInfo.result.requestError')} ${error?.status ?? 'No status'}`}
      />
    );
  }

  if (!data) {
    return (
      <AiCodeFixAdminCategoryErrorView
        onRetry={retry}
        message={translate('property.aicodefix.admin.serviceInfo.empty.response.label')}
      />
    );
  }

  return <ServiceInfoCheckValidResponseView response={data} onRetry={retry} />;
}

function SubscriptionCheckPendingMessage(isLoading: boolean) {
  return (
    <div className="sw-p-8">
      <Spinner
        isLoading={isLoading}
        label={translate('property.aicodefix.admin.serviceInfo.spinner.label')}
      />
    </div>
  );
}

function ServiceInfoCheckValidResponseView({
  response,
  onRetry,
}: Readonly<{ onRetry: Function; response: ServiceInfo }>) {
  switch (response?.status) {
    case 'SUCCESS':
      return <ServiceInfoCheckSuccessResponseView onRetry={onRetry} response={response} />;
    case 'TIMEOUT':
    case 'CONNECTION_ERROR':
      return (
        <AiCodeFixAdminCategoryErrorView
          message={translate('property.aicodefix.admin.serviceInfo.result.unresponsive.message')}
          onRetry={onRetry}
        >
          <div className="sw-flex-col">
            <p className="sw-mt-4">
              <ErrorLabel
                text={translate(
                  'property.aicodefix.admin.serviceInfo.result.unresponsive.causes.title',
                )}
              />
            </p>
            <UnorderedList className="sw-ml-8" ticks>
              <ErrorListItem className="sw-mb-2">
                <ErrorLabel
                  text={translate(
                    'property.aicodefix.admin.serviceInfo.result.unresponsive.causes.1',
                  )}
                />
                <p>
                  <DocumentationLink shouldOpenInNewTab to={DocLink.AiCodeFixEnabling}>
                    {translate('property.aicodefix.admin.serviceInfo.learnMore')}
                  </DocumentationLink>
                </p>
              </ErrorListItem>
              <ErrorListItem>
                <ErrorLabel
                  text={translate(
                    'property.aicodefix.admin.serviceInfo.result.unresponsive.causes.2',
                  )}
                />
              </ErrorListItem>
            </UnorderedList>
          </div>
        </AiCodeFixAdminCategoryErrorView>
      );
    case 'UNAUTHORIZED':
      return <ServiceInfoCheckUnauthorizedResponseView onRetry={onRetry} response={response} />;
    case 'SERVICE_ERROR':
      return (
        <AiCodeFixAdminCategoryErrorView
          onRetry={onRetry}
          message={translate('property.aicodefix.admin.serviceInfo.result.serviceError')}
        />
      );
    default:
      return (
        <AiCodeFixAdminCategoryErrorView
          onRetry={onRetry}
          message={`${translate('property.aicodefix.admin.serviceInfo.result.unknown')} ${response?.status ?? 'no status returned from the service'}`}
        />
      );
  }
}

function ServiceInfoCheckSuccessResponseView({
  onRetry,
  response,
}: Readonly<{ onRetry: Function; response: ServiceInfo }>) {
  switch (response.subscriptionType) {
    case 'EARLY_ACCESS':
      return <AiCodeFixEnablementForm isEarlyAccess />;
    case 'PAID':
      return <AiCodeFixEnablementForm />;
    default:
      return (
        <AiCodeFixAdminCategoryErrorView
          onRetry={onRetry}
          message={translate('property.aicodefix.admin.serviceInfo.unexpected.response.label')}
        />
      );
  }
}

function ServiceInfoCheckUnauthorizedResponseView({
  onRetry,
  response,
}: Readonly<{ onRetry: Function; response: ServiceInfo }>) {
  if (response.subscriptionType === 'NOT_PAID') {
    return <AiCodeFixPromotionMessage />;
  }

  if (response.isEnabled != null && !response.isEnabled) {
    return <FeatureNotAvailableMessage />;
  }

  return (
    <AiCodeFixAdminCategoryErrorView
      onRetry={onRetry}
      message={translate('property.aicodefix.admin.serviceInfo.result.unauthorized')}
    />
  );
}

function FeatureNotAvailableMessage() {
  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-items-center sw-py-64">
      <LockIllustration />
      <Text as="b" className="sw-text-center">
        {translate('property.aicodefix.admin.disabled')}
      </Text>
    </div>
  );
}

function AiCodeFixPromotionMessage() {
  return (
    <div>
      <Heading as="h2" hasMarginBottom>
        {translate('property.aicodefix.admin.promotion.title')}
      </Heading>
      <PromotedSection
        content={
          <MaxWidthDiv>
            <p className="sw-pb-4">{translate('property.aicodefix.admin.promotion.content')}</p>
            <ButtonGroup>
              <LinkStandalone
                shouldOpenInNewTab
                to="mailto:contact@sonarsource.com?subject=Sonar%20AI%20CodeFix%20-%20Request%20for%20information"
              >
                {translate('property.aicodefix.admin.promotion.contact')}
              </LinkStandalone>
              <DocumentationLink shouldOpenInNewTab to={DocLink.AiCodeFixEnabling}>
                {translate('property.aicodefix.admin.promotion.checkDocumentation')}
              </DocumentationLink>
            </ButtonGroup>
          </MaxWidthDiv>
        }
        title={translate('property.aicodefix.admin.promotion.subtitle')}
        image={<OverviewQGPassedIcon width={84} height={84} />}
      />
    </div>
  );
}

const MaxWidthDiv = styled.div`
  max-width: var(--echoes-sizes-typography-max-width-default);
`;

export default withAvailableFeatures(AiCodeFixAdminCategory);

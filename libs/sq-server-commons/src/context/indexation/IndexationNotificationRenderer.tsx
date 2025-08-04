/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

/* eslint-disable react/no-unused-prop-types */
import { Banner, BannerVariety, Link, LinkHighlight, Spinner } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '../../components/common/DocumentationLink';
import { DocLink } from '../../helpers/doc-links';
import { useLinesOfCodeQuery } from '../../queries/identity-provider/common';
import { queryToSearchString } from '../../sonar-aligned/helpers/urls';
import { IndexationNotificationType } from '../../types/indexation';
import { TaskStatuses, TaskTypes } from '../../types/tasks';
import { useAppState } from '../app-state/withAppStateContext';

interface IndexationNotificationRendererProps {
  completedCount?: number;
  onDismissBanner: () => void;
  shouldDisplaySurveyLink: boolean;
  total?: number;
  type?: IndexationNotificationType;
}

export default function IndexationNotificationRenderer(
  props: Readonly<IndexationNotificationRendererProps>,
) {
  const { type } = props;

  return (
    <div className={classNames({ 'sw-hidden': type === undefined })}>
      <Banner
        aria-live="assertive"
        disableFollowScroll
        onDismiss={
          type === IndexationNotificationType.Completed ? props.onDismissBanner : undefined
        }
        variety={NOTIFICATION_TYPES[type ?? IndexationNotificationType.Completed]}
      >
        <IndexationBanner {...props} />
      </Banner>
    </div>
  );
}

function IndexationBanner(props: Readonly<IndexationNotificationRendererProps>) {
  const { completedCount, shouldDisplaySurveyLink, total, type } = props;

  switch (type) {
    case IndexationNotificationType.Completed:
      return <CompletedBanner shouldDisplaySurveyLink={shouldDisplaySurveyLink} />;
    case IndexationNotificationType.CompletedWithFailure:
      return <CompletedWithFailureBanner shouldDisplaySurveyLink={shouldDisplaySurveyLink} />;
    case IndexationNotificationType.InProgress:
      return <InProgressBanner completedCount={completedCount as number} total={total as number} />;
    case IndexationNotificationType.InProgressWithFailure:
      return (
        <InProgressWithFailureBanner
          completedCount={completedCount as number}
          total={total as number}
        />
      );
    default:
      return null;
  }
}

const NOTIFICATION_TYPES: {
  [key in IndexationNotificationType]: BannerVariety;
} = {
  [IndexationNotificationType.InProgress]: BannerVariety.Warning,
  [IndexationNotificationType.InProgressWithFailure]: BannerVariety.Danger,
  [IndexationNotificationType.Completed]: BannerVariety.Success,
  [IndexationNotificationType.CompletedWithFailure]: BannerVariety.Danger,
};

const SPRIG_SURVEY_LINK =
  'https://a.sprig.com/U1h4UFpySUNwN2ZtfnNpZDowNWUyNmRkZC01MmUyLTQ4OGItOTA3ZC05M2VjYjQxZTYzN2Y=';

function SurveyLink() {
  const { edition, version } = useAppState();
  const data = useLinesOfCodeQuery();

  const loc = data?.loc ?? '';
  const url = SPRIG_SURVEY_LINK.concat(`?edition=${edition}&version=${version}&loc=${loc}`);

  return (
    <span className="sw-ml-2">
      <FormattedMessage
        id="indexation.upgrade_survey_link"
        values={{
          link: (text) => (
            <Link enableOpenInNewTab highlight={LinkHighlight.CurrentColor} to={url}>
              {text}
            </Link>
          ),
        }}
      />
    </span>
  );
}

function CompletedBanner(
  props: Readonly<{
    shouldDisplaySurveyLink: boolean;
  }>,
) {
  const { shouldDisplaySurveyLink } = props;

  return (
    <div className="sw-flex sw-flex-1 sw-items-center">
      <FormattedMessage id="indexation.completed" />
      {shouldDisplaySurveyLink && <SurveyLink />}
    </div>
  );
}

function CompletedWithFailureBanner(props: Readonly<{ shouldDisplaySurveyLink: boolean }>) {
  const { shouldDisplaySurveyLink } = props;

  const { formatMessage } = useIntl();

  return (
    <span>
      <FormattedMessage
        id="indexation.completed_with_error"
        values={{
          link: (
            <BackgroundTasksPageLink
              hasError
              text={formatMessage({
                id: 'indexation.completed_with_error.link',
              })}
            />
          ),
        }}
      />
      {shouldDisplaySurveyLink && <SurveyLink />}
    </span>
  );
}

function InProgressBanner(props: Readonly<{ completedCount: number; total: number }>) {
  const { completedCount, total } = props;

  const { formatMessage } = useIntl();

  return (
    <span className="sw-inline-flex sw-gap-4">
      <span>
        <FormattedMessage id="indexation.in_progress" />{' '}
        <FormattedMessage
          id="indexation.features_partly_available"
          values={{
            link: <IndexationDocPageLink />,
          }}
        />
      </span>

      <span className="sw-flex sw-items-center">
        <Spinner className="sw-mr-1" />
        <FormattedMessage
          id="indexation.progression"
          values={{
            count: completedCount,
            total,
          }}
        />
      </span>

      <span>
        <FormattedMessage
          id="indexation.admin_link"
          values={{
            link: (
              <BackgroundTasksPageLink
                hasError={false}
                text={formatMessage({ id: 'background_tasks.page' })}
              />
            ),
          }}
        />
      </span>
    </span>
  );
}

function InProgressWithFailureBanner(props: Readonly<{ completedCount: number; total: number }>) {
  const { completedCount, total } = props;

  const { formatMessage } = useIntl();

  return (
    <span className="sw-inline-flex sw-gap-4">
      <span>
        <FormattedMessage id="indexation.in_progress" />{' '}
        <FormattedMessage
          id="indexation.features_partly_available"
          values={{
            link: <IndexationDocPageLink />,
          }}
        />
      </span>

      <span className="sw-flex sw-items-center">
        <Spinner className="sw-mr-1" />
        <FormattedMessage
          id="indexation.progression_with_error"
          tagName="span"
          values={{
            count: completedCount,
            total,
            link: (
              <BackgroundTasksPageLink
                hasError
                text={formatMessage({
                  id: 'indexation.progression_with_error.link',
                })}
              />
            ),
          }}
        />
      </span>
    </span>
  );
}

function BackgroundTasksPageLink(props: Readonly<{ hasError: boolean; text: string }>) {
  const { hasError, text } = props;

  return (
    <Link
      highlight={LinkHighlight.CurrentColor}
      to={{
        pathname: '/admin/background_tasks',
        search: queryToSearchString({
          taskType: TaskTypes.IssueSync,
          status: hasError ? TaskStatuses.Failed : undefined,
        }),
      }}
    >
      {text}
    </Link>
  );
}

function IndexationDocPageLink() {
  return (
    <DocumentationLink
      className="sw-whitespace-nowrap"
      highlight={LinkHighlight.CurrentColor}
      to={DocLink.InstanceAdminReindexation}
    >
      <FormattedMessage id="indexation.features_partly_available.link" />
    </DocumentationLink>
  );
}

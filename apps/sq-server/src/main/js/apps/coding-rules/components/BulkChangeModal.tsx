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
  Button,
  ButtonVariety,
  CheckboxGroup,
  Form,
  Heading,
  MessageInline,
  MessageVariety,
  Modal,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MetricType } from '~shared/types/metrics';
import { formatMeasure } from '~adapters/helpers/measures';
import { bulkActivateRules, bulkDeactivateRules } from '~sq-server-commons/api/quality-profiles';
import withLanguages, {
  WithLanguagesProps,
} from '~sq-server-commons/context/languages/withLanguages';
import { CodingRulesQuery } from '~sq-server-commons/types/coding-rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import { serializeQuery } from '~sq-server-commons/utils/coding-rules-query';

interface Props extends WithLanguagesProps {
  action: string;
  onClose: () => void;
  onSubmit?: () => void;
  profile?: BaseProfile;
  query: CodingRulesQuery;
  referencedProfiles: Record<string, BaseProfile>;
  total: number;
}

interface ActivationResult {
  failed: number;
  profile: string;
  succeeded: number;
}

function getAvailableQualityProfiles({
  query,
  referencedProfiles,
}: Pick<Props, 'query' | 'referencedProfiles'>) {
  let profiles = Object.values(referencedProfiles);
  if (query.languages.length > 0) {
    profiles = profiles.filter((profile) => query.languages.includes(profile.language));
  }
  return profiles
    .filter((profile) => profile.actions?.edit)
    .filter((profile) => !profile.isBuiltIn);
}

export function BulkChangeModal(props: Readonly<Props>) {
  const { action, languages, onClose, onSubmit, profile, query, referencedProfiles, total } = props;
  const { formatMessage } = useIntl();

  const availableProfiles = getAvailableQualityProfiles({ query, referencedProfiles });

  // if there is only one possible option for profile, select it immediately
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    availableProfiles.length === 1 ? [availableProfiles[0].key] : [],
  );
  const [results, setResults] = useState<ActivationResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const formId = `coding-rules-bulk-change-form-${action}`;
  const label = formatMessage({
    id: action === 'activate' ? 'coding_rules.activate_in' : 'coding_rules.deactivate_in',
  });

  const handleProfilesChange = (nextKeys: string[]) => {
    // newly selected profiles go first, as in the former multi-selector
    const added = nextKeys.filter((key) => !selectedKeys.includes(key));
    setSelectedKeys([...added, ...selectedKeys.filter((key) => nextKeys.includes(key))]);
  };

  const sendRequests = () => {
    let looper = Promise.resolve();

    // serialize the query, but delete the `profile`
    const data = serializeQuery(query);
    delete data.profile;

    const method = action === 'activate' ? bulkActivateRules : bulkDeactivateRules;

    // if a profile is selected in the facet, pick it
    // otherwise take all profiles selected in the form
    const profileKeys = profile ? [profile.key] : selectedKeys;

    for (const profileKey of profileKeys) {
      looper = looper
        .then(() => method({ ...data, targetKey: profileKey }))
        .then((response: { failed?: number; succeeded?: number }) => {
          if (mounted.current) {
            setResults((previous) => [
              ...previous,
              {
                failed: response.failed || 0,
                profile: profileKey,
                succeeded: response.succeeded || 0,
              },
            ]);
          }
        });
    }
    return looper;
  };

  const handleFormSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    sendRequests().then(
      () => {
        if (mounted.current) {
          setFinished(true);
          setSubmitting(false);
        }
      },
      () => {
        if (mounted.current) {
          setSubmitting(false);
        }
      },
    );
  };

  const handleClose = () => {
    if (onSubmit && finished) {
      onSubmit();
    }
    onClose();
  };

  const renderResult = (result: ActivationResult) => {
    const resultProfile = referencedProfiles[result.profile];
    const language = languages[resultProfile.language]
      ? languages[resultProfile.language].name
      : resultProfile.language;
    return (
      <MessageInline
        className="sw:mb-4"
        key={result.profile}
        variety={result.failed === 0 ? MessageVariety.Success : MessageVariety.Warning}
      >
        {result.failed
          ? formatMessage(
              { id: 'coding_rules.bulk_change.warning' },
              {
                0: resultProfile.name,
                1: language,
                2: result.succeeded,
                3: result.failed,
              },
            )
          : formatMessage(
              { id: 'coding_rules.bulk_change.success' },
              { 0: resultProfile.name, 1: language, 2: result.succeeded },
            )}
      </MessageInline>
    );
  };

  const renderProfileSelect = () => {
    if (availableProfiles.length === 0) {
      return (
        <Text isSubtle>
          <FormattedMessage id="coding_rules.bulk_change.no_quality_profile" />
        </Text>
      );
    }

    return (
      <CheckboxGroup
        id="coding-rules-bulk-change-profile-select"
        label={label}
        onChange={handleProfilesChange}
        options={
          availableProfiles.map((availableProfile) => ({
            label: `${availableProfile.name} - ${availableProfile.languageName}`,
            value: availableProfile.key,
          })) as [{ label: string; value: string }, ...{ label: string; value: string }[]]
        }
        value={selectedKeys}
      />
    );
  };

  const title = `${formatMessage({
    id:
      action === 'activate'
        ? 'coding_rules.activate_in_quality_profile'
        : 'coding_rules.deactivate_in_quality_profile',
  })} (${formatMeasure(total, MetricType.Integer)} ${formatMessage({ id: 'coding_rules._rules' })})`;

  return (
    <Modal
      content={
        <>
          <div aria-live="polite" aria-relevant="additions">
            {results.map(renderResult)}
          </div>
          <Spinner isLoading={submitting}>
            <Form id={formId} onSubmit={handleFormSubmit}>
              {!finished && !submitting && (
                <Form.Section>
                  {profile ? (
                    <>
                      <Heading as="h4" className="sw:mb-0">
                        {label}
                      </Heading>
                      <span>
                        {profile.name}
                        {' — '}
                        <FormattedMessage id="are_you_sure" />
                      </span>
                    </>
                  ) : (
                    renderProfileSelect()
                  )}
                </Form.Section>
              )}
            </Form>
          </Spinner>
        </>
      }
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
      primaryButton={
        !finished && (
          <Button
            form={formId}
            isDisabled={submitting || (selectedKeys.length === 0 && profile === undefined)}
            type="submit"
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="apply" />
          </Button>
        )
      }
      secondaryButton={
        <Button onClick={handleClose}>
          <FormattedMessage id={finished ? 'close' : 'cancel'} />
        </Button>
      }
      title={title}
    />
  );
}

export default withLanguages(BulkChangeModal);

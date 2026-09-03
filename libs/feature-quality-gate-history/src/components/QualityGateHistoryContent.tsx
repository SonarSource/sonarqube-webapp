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
  EmptyState,
  IconActivity,
  IconQualityGate,
  LinkStandalone,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { Release } from '../types';
import { QualityGateHistoryCard } from './QualityGateHistoryCard';

interface Props {
  isPreviousVersion: boolean;
  releases: Release[];
}

export function QualityGateHistoryContent(props: Readonly<Props>) {
  const { isPreviousVersion, releases } = props;
  const newCodeDocUrl = useSharedDocUrl(SharedDocLink.NewCodeDefinition);

  if (!isPreviousVersion) {
    return (
      <EmptyState
        className="sw-mt-12"
        graphic={<IconQualityGate />}
        link={
          <LinkStandalone enableOpenInNewTab to={newCodeDocUrl}>
            <FormattedMessage id="quality_gate_history.empty.non_compatible.cta" />
          </LinkStandalone>
        }
        text={<FormattedMessage id="quality_gate_history.empty.non_compatible.description" />}
        title={<FormattedMessage id="quality_gate_history.empty.non_compatible.title" />}
      />
    );
  }

  return (
    <div className="sw-flex sw-flex-col sw-mt-8 sw-gap-6">
      <Text>
        <FormattedMessage
          id="quality_gate_history.intro"
          values={{
            risky: (
              <Text colorOverride="echoes-color-text-danger" isHighlighted>
                <FormattedMessage id="quality_gate_history.risky" />
              </Text>
            ),
            safe: (
              <Text colorOverride="echoes-color-text-success" isHighlighted>
                <FormattedMessage id="quality_gate_history.safe" />
              </Text>
            ),
          }}
        />
      </Text>

      {releases.length === 0 ? (
        <Card>
          <Card.Body className="sw-flex sw-items-center sw-justify-center sw-py-8">
            <EmptyState
              graphic={<IconActivity />}
              link={
                <LinkStandalone enableOpenInNewTab to={newCodeDocUrl}>
                  <FormattedMessage id="quality_gate_history.empty.no_releases.cta" />
                </LinkStandalone>
              }
              text={<FormattedMessage id="quality_gate_history.empty.no_releases.description" />}
              title={<FormattedMessage id="quality_gate_history.empty.no_releases.title" />}
              titleSize="medium"
            />
          </Card.Body>
        </Card>
      ) : (
        <QualityGateHistoryCard releases={releases} />
      )}
    </div>
  );
}

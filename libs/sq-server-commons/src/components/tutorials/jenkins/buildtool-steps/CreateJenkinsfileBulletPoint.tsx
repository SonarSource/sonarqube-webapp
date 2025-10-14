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

import { MessageCallout, MessageVariety, ToggleTip } from '@sonarsource/echoes-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { CodeSnippet, NumberedListItem } from '../../../../design-system';
import SentenceWithFilename from '../../components/SentenceWithFilename';
import SentenceWithHighlights from '../../components/SentenceWithHighlights';

export interface CreateJenkinsfileBulletPointProps {
  alertTranslationKeyPart?: string;
  children?: React.ReactNode;
  snippet: string;
}

export default function CreateJenkinsfileBulletPoint(
  props: Readonly<CreateJenkinsfileBulletPointProps>,
) {
  const { children, snippet, alertTranslationKeyPart } = props;
  const { formatMessage } = useIntl();

  return (
    <NumberedListItem>
      <SentenceWithFilename
        filename="Jenkinsfile"
        translationKey="onboarding.tutorial.with.jenkins.jenkinsfile.jenkinsfile_step"
      />
      <br />
      {alertTranslationKeyPart && (
        <MessageCallout className="sw-mt-2" variety={MessageVariety.Info}>
          <div>
            <SentenceWithHighlights
              highlightKeys={['default', 'in_jenkins']}
              translationKey={`${alertTranslationKeyPart}.replace`}
            />
            <ToggleTip
              ariaLabel={formatMessage({ id: 'toggle_tip.aria_label.onboarding' })}
              className="sw-ml-1"
              description={
                <>
                  <p className="sw-mb-2">
                    <SentenceWithHighlights
                      highlightKeys={['path']}
                      translationKey={`${alertTranslationKeyPart}.help1`}
                    />
                  </p>
                  <p>
                    <SentenceWithHighlights
                      highlightKeys={['path', 'name']}
                      translationKey={`${alertTranslationKeyPart}.help2`}
                    />
                  </p>
                </>
              }
            />
          </div>
        </MessageCallout>
      )}
      <CodeSnippet className="sw-p-6" language="groovy" snippet={snippet} />
      {children}
    </NumberedListItem>
  );
}

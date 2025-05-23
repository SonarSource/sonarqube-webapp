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

import styled from '@emotion/styled';
import { Link, LinkHighlight, LinkStandalone, Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import React from 'react';
import { Image } from '~adapters/components/common/Image';
import { ButtonSecondary, CheckIcon, Checkbox, themeBorder } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getProjectUrl } from '~sq-server-commons/helpers/urls';

type AlmRepoItemProps = {
  almIconSrc: string;
  almKey: string;
  almUrl?: string;
  almUrlText?: string;
  primaryTextNode: React.ReactNode;
  secondaryTextNode?: React.ReactNode;
  sqProjectKey?: string;
} & (
  | {
      multiple: true;
      onCheck: (key: string) => void;
      onImport?: never;
      selected: boolean;
    }
  | {
      multiple?: false;
      onCheck?: never;
      onImport: (key: string) => void;
      selected?: never;
    }
);

export default function AlmRepoItem({
  almIconSrc,
  almKey,
  almUrl,
  almUrlText,
  multiple,
  onCheck,
  onImport,
  primaryTextNode,
  secondaryTextNode,
  selected,
  sqProjectKey,
}: AlmRepoItemProps) {
  const labelId = `${almKey.toString().replace(/\s/g, '_')}-label`;
  return (
    <RepositoryItem
      aria-labelledby={labelId}
      className={classNames('sw-flex sw-items-center sw-w-full sw-p-4 sw-rounded-1', {
        'sw-py-4': multiple || sqProjectKey !== undefined,
        'sw-py-2': !multiple && sqProjectKey === undefined,
      })}
      imported={sqProjectKey !== undefined}
      onClick={() => multiple && sqProjectKey === undefined && onCheck(almKey)}
      selected={selected}
    >
      {multiple && (
        <Checkbox
          checked={selected || sqProjectKey !== undefined}
          className="sw-p-1 sw-mr-2"
          disabled={sqProjectKey !== undefined}
          onCheck={() => {
            onCheck(almKey);
          }}
          onClick={(e: React.MouseEvent<HTMLLabelElement>) => {
            e.stopPropagation();
          }}
        />
      )}
      <div className="sw-w-[70%] sw-min-w-0 sw-flex sw-mr-1">
        <div className="sw-max-w-full sw-flex sw-items-center" id={labelId}>
          <Image
            alt="" // Should be ignored by screen readers
            className="sw-h-4 sw-w-4 sw-mr-2"
            src={almIconSrc}
          />
          {sqProjectKey ? (
            <LinkStandalone
              className="sw-truncate sw-font-semibold"
              highlight={LinkHighlight.Default}
              to={getProjectUrl(sqProjectKey)}
            >
              {primaryTextNode}
            </LinkStandalone>
          ) : (
            <Text className="sw-truncate" isHighlighted>
              {primaryTextNode}
            </Text>
          )}
        </div>
        <div className="sw-max-w-full sw-min-w-0 sw-ml-2 sw-flex sw-items-center">
          <Text className="sw-truncate" isSubdued>
            {secondaryTextNode}
          </Text>
        </div>
      </div>
      {almUrl !== undefined && (
        <div className="sw-flex sw-items-center sw-flex-shrink-0 sw-ml-2">
          <Link
            className="sw-typo-semibold"
            onClick={(e) => {
              e.stopPropagation();
            }}
            shouldOpenInNewTab
            to={almUrl}
          >
            {almUrlText ?? almUrl}
          </Link>
        </div>
      )}
      <div className="sw-ml-2 sw-flex sw-justify-end sw-flex-grow sw-flex-shrink-0 sw-w-abs-150">
        {sqProjectKey ? (
          <div className="sw-flex sw-items-center">
            <CheckIcon />
            <Text className="sw-ml-2">
              {translate('onboarding.create_project.repository_imported')}
            </Text>
          </div>
        ) : (
          <>
            {!multiple && (
              <ButtonSecondary
                onClick={() => {
                  onImport(almKey);
                }}
              >
                {translate('onboarding.create_project.import')}
              </ButtonSecondary>
            )}
          </>
        )}
      </div>
    </RepositoryItem>
  );
}

const RepositoryItem = styled.li<{ imported?: boolean; selected?: boolean }>`
  box-sizing: border-box;
  border: ${({ selected }) =>
    selected ? themeBorder('default', 'primary') : themeBorder('default')};
  cursor: ${({ imported }) => imported && 'default'};
`;

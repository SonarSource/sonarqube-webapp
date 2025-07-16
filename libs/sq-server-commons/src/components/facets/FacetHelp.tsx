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

import {
  type PopoverProps,
  Button,
  ButtonVariety,
  IconQuestionMark,
  Popover,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DocLink } from '../../helpers/doc-links';
import DocumentationLink from '../common/DocumentationLink';

type Props =
  | {
      description?: never;
      link: DocLink;
      linkText?: never;
      noDescription?: boolean;
      property: string;
      title?: never;
    }
  | {
      description?: PopoverProps['description'];
      link: DocLink;
      linkText: string;
      noDescription?: never;
      property?: never;
      title: string;
    };

export function FacetHelp({ property, title, description, noDescription, link, linkText }: Props) {
  const intl = useIntl();
  return (
    <Popover
      description={
        property
          ? !noDescription && (
              <FormattedMessage
                id={`issues.facet.${property}.help.description`}
                values={{
                  p1: (text) => <p>{text}</p>,
                  p: (text) => <p className="sw-mt-4">{text}</p>,
                }}
              />
            )
          : description
      }
      footer={
        <DocumentationLink enableOpenInNewTab standalone to={link}>
          {property ? intl.formatMessage({ id: `issues.facet.${property}.help.link` }) : linkText}
        </DocumentationLink>
      }
      title={
        property !== undefined
          ? intl.formatMessage({ id: `issues.facet.${property}.help.title` })
          : title
      }
    >
      <Button
        aria-label={intl.formatMessage({ id: 'help' })}
        className="sw-p-0 sw-h-fit sw-min-h-fit"
        variety={ButtonVariety.DefaultGhost}
      >
        <IconQuestionMark color="echoes-color-icon-subdued" />
      </Button>
    </Popover>
  );
}

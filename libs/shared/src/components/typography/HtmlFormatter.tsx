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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import React, { ComponentProps } from 'react';
import { SafeHTMLInjection, SanitizeLevel } from '../../helpers/sanitize';

interface HtmlFormatterProps {
  htmlAsString?: string;
  isLegacyFormat?: boolean;
  sanitizeLevel?: SanitizeLevel;
}

export const HtmlFormatter = React.forwardRef<
  HTMLDivElement,
  HtmlFormatterProps & ComponentProps<typeof HtmlFormatterStyled>
>(
  (
    {
      htmlAsString,
      sanitizeLevel = SanitizeLevel.FORBID_SVG_MATHML,
      ...rest
    }: ComponentProps<typeof HtmlFormatterStyled>,
    ref,
  ) => {
    if (htmlAsString) {
      return (
        <SafeHTMLInjection htmlAsString={htmlAsString} sanitizeLevel={sanitizeLevel}>
          <HtmlFormatterStyled ref={ref} {...rest} />
        </SafeHTMLInjection>
      );
    }

    return <HtmlFormatterStyled ref={ref} {...rest} />;
  },
);

HtmlFormatter.displayName = 'HtmlFormatter';

const HtmlFormatterStyled = styled.div<HtmlFormatterProps>`
  font: ${cssVar('typography-text-default-regular')};

  a {
    color: ${cssVar('color-text-accent')};
    text-decoration-line: ${cssVar('text-decoration-underline')};
    font: ${cssVar('typography-text-default-semi-bold')};

    &:visited {
      color: ${cssVar('color-text-accent')};
    }

    &:hover,
    &:focus,
    &:active {
      color: ${cssVar('color-text-link-hover')};
    }
  }

  p,
  ul,
  ol,
  pre,
  blockquote,
  table {
    color: ${cssVar('color-text-default')};
    margin-bottom: ${cssVar('dimension-space-200', '1rem')};
    text-wrap: auto;
  }

  blockquote {
    font: ${cssVar('typography-text-default-regular')};
    padding-left: ${cssVar('dimension-space-200', '1rem')};
    padding-right: ${cssVar('dimension-space-200', '1rem')};
    border-left: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};

    cite {
      color: ${cssVar('color-text-subtle')};
    }
  }

  h1 {
    color: ${cssVar('color-text-default')};

    font: ${cssVar('typography-heading-xlarge')};
    letter-spacing: ${cssVar('letter-spacing-decreased')};
    margin-top: ${cssVar('dimension-space-300', '1.5rem')};
    margin-bottom: ${cssVar('dimension-space-300', '1.5rem')};
  }

  h2,
  h3 {
    color: ${(props) =>
      props.isLegacyFormat ? cssVar('color-text-default') : cssVar('color-text-strong')};

    ${(props) =>
      props.isLegacyFormat
        ? {
            font: cssVar('typography-text-large-semi-bold'),
          }
        : {
            font: cssVar('typography-heading-large'),
            letterSpacing: cssVar('letter-spacing-decreased'),
          }}
    margin-top: ${cssVar('dimension-space-300', '1.5rem')};
    margin-bottom: ${cssVar('dimension-space-300', '1.5rem')};
  }

  h4,
  h5,
  h6 {
    color: ${cssVar('color-text-default')};

    font: ${cssVar('typography-text-large-semi-bold')};
    margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};
    margin-top: ${cssVar('dimension-space-300', '1.5rem')};
  }

  pre,
  code {
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    border: 1px solid ${cssVar('color-border-bold')};
    font: ${cssVar('typography-code-default')};
  }

  pre {
    border-radius: ${cssVar('border-radius-400', '0.5rem')};
    position: relative;
    margin-top: ${cssVar('dimension-space-100', '0.5rem')};
    margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};

    overflow-x: auto;
    padding: ${cssVar('dimension-space-300', '1.5rem')};
  }

  code {
    margin: 0;
    /* 1px override is needed to prevent overlap of other code "tags" */
    padding-left: ${cssVar('dimension-space-50', '0.25rem')};
    padding-right: ${cssVar('dimension-space-50', '0.25rem')};
    padding-top: 1px;
    padding-bottom: 1px;
    border-radius: ${cssVar('border-radius-200', '0.25rem')};
    white-space: nowrap;
  }

  pre > code {
    padding: 0;
    white-space: pre;
    border: none;
    background-color: transparent;
  }

  ul {
    padding-left: ${cssVar('dimension-space-300', '1.5rem')};
    display: flex;
    flex-direction: column;
    gap: ${cssVar('dimension-space-100', '0.5rem')};
    list-style-type: disc;

    li::marker {
      color: ${cssVar('color-icon-subtle')};
    }
  }

  li > ul {
    margin-left: 0;
    margin-right: 0;
    margin-top: ${cssVar('dimension-space-100', '0.5rem')};
    margin-bottom: ${cssVar('dimension-space-100', '0.5rem')};
  }

  ol {
    padding-left: ${cssVar('dimension-space-500', '2.5rem')};
    list-style-type: decimal;
  }

  table {
    min-width: 50%;
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
    border-collapse: collapse;
  }

  th {
    padding-left: ${cssVar('dimension-space-150', '0.75rem')};
    padding-right: ${cssVar('dimension-space-150', '0.75rem')};
    padding-top: ${cssVar('dimension-space-50', '0.25rem')};
    padding-bottom: ${cssVar('dimension-space-50', '0.25rem')};
    font: ${cssVar('typography-text-default-semi-bold')};
    text-align: center;
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
  }

  td {
    padding-left: ${cssVar('dimension-space-150', '0.75rem')};
    padding-right: ${cssVar('dimension-space-150', '0.75rem')};
    padding-top: ${cssVar('dimension-space-50', '0.25rem')};
    padding-bottom: ${cssVar('dimension-space-50', '0.25rem')};
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
  }
`;

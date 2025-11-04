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
import tw from 'twin.macro';
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
  ${tw`sw-typo-default`}

  a {
    color: ${cssVar('color-text-accent')};
    text-decoration-line: ${cssVar('text-decoration-underline')};
    ${tw`sw-typo-semibold`};

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
    ${tw`sw-mb-4`}
    text-wrap: auto;
  }

  blockquote {
    ${tw`sw-typo-default`}
    ${tw`sw-px-4`}
    border-left: ${cssVar('color-border-weak')};

    cite {
      color: ${cssVar('color-text-subtle')};
    }
  }

  h1 {
    color: ${cssVar('color-text-default')};

    ${tw`sw-heading-xl`}
    ${tw`sw-my-6`}
  }

  h2,
  h3 {
    color: ${(props) =>
      props.isLegacyFormat ? cssVar('color-text-default') : cssVar('color-text-strong')};

    ${(props) => (props.isLegacyFormat ? tw`sw-typo-lg-semibold` : tw`sw-heading-lg`)}
    ${tw`sw-my-6`}
  }

  h4,
  h5,
  h6 {
    color: ${cssVar('color-text-default')};

    ${tw`sw-typo-lg-semibold`}
    ${tw`sw-mt-6 sw-mb-2`}
  }

  pre,
  code {
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    border: 1px solid ${cssVar('color-border-bold')};
    ${tw`sw-code`}
  }

  pre {
    ${tw`sw-rounded-2`}
    ${tw`sw-relative`}
    ${tw`sw-my-2`}

    ${tw`sw-overflow-x-auto`}
    ${tw`sw-p-6`}
  }

  code {
    ${tw`sw-m-0`}
    /* 1px override is needed to prevent overlap of other code "tags" */
    ${tw`sw-py-[1px] sw-px-1`}
    ${tw`sw-rounded-1`}
    ${tw`sw-whitespace-nowrap`}
  }

  pre > code {
    ${tw`sw-p-0`}
    ${tw`sw-whitespace-pre`}
    background-color: transparent;
  }

  ul {
    ${tw`sw-pl-6`}
    ${tw`sw-flex sw-flex-col sw-gap-2`}
    list-style-type: disc;

    li::marker {
      color: ${cssVar('color-icon-subtle')};
    }
  }

  li > ul {
    ${tw`sw-my-2 sw-mx-0`}
  }

  ol {
    ${tw`sw-pl-10`};
    list-style-type: decimal;
  }

  table {
    ${tw`sw-min-w-[50%]`}
    border:  ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
    border-collapse: collapse;
  }

  th {
    ${tw`sw-py-1 sw-px-3`}
    ${tw`sw-typo-semibold`}
    ${tw`sw-text-center`}
    background-color: ${cssVar('color-background-neutral-subtle-default')};
    border: ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
  }

  td {
    ${tw`sw-py-1 sw-px-3`}
    border:  ${cssVar('border-width-default')} solid ${cssVar('color-border-bold')};
  }
`;

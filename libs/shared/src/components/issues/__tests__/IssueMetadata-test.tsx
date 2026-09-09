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

import { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byText } from '../../../helpers/testSelector';
import { CodeAttribute, CodeAttributeCategory } from '../../../types/clean-code-taxonomy';
import { IssueMetadata } from '../IssueMetadata';

jest.mock('../../intl/DateFromNow');

const baseIssue = {
  cleanCodeAttributeCategory: CodeAttributeCategory.Intentional,
  creationDate: '2023-01-01T00:00:00+0000',
  key: 'issue-key',
};

describe('code attribute', () => {
  it('renders only the category when no attribute is given', () => {
    setupWithProps();

    expect(
      byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Intentional}`).get(),
    ).toBeInTheDocument();
    expect(
      byText(`cct.clean_code_attribute.${CodeAttribute.Conventional}`, { exact: false }).query(),
    ).not.toBeInTheDocument();
  });

  it('renders both category and attribute when an attribute is given', () => {
    setupWithProps({
      issue: {
        ...baseIssue,
        cleanCodeAttribute: CodeAttribute.Conventional,
        cleanCodeAttributeCategory: CodeAttributeCategory.Adaptable,
      },
    });

    expect(
      byText(`cct.clean_code_attribute_category.${CodeAttributeCategory.Adaptable}`, {
        exact: false,
      }).get(),
    ).toBeInTheDocument();
    expect(
      byText(`cct.clean_code_attribute.${CodeAttribute.Conventional}`, { exact: false }).get(),
    ).toBeInTheDocument();
  });
});

describe('tags', () => {
  it('renders tags from the issue', () => {
    setupWithProps({ issue: { ...baseIssue, tags: ['my-tag'] } });

    expect(byText('my-tag').get()).toBeInTheDocument();
  });
});

describe('line affected', () => {
  it('renders when textRange is defined', () => {
    setupWithProps({ issue: { ...baseIssue, textRange: { endLine: 42 } } });

    expect(byText('issue.line_affected').get()).toBeInTheDocument();
    expect(byText('issue.ncloc_x.short.42').get()).toBeInTheDocument();
  });

  it('does not render when textRange is absent', () => {
    setupWithProps();

    expect(byText('issue.line_affected').query()).not.toBeInTheDocument();
  });
});

describe('effort', () => {
  it('renders when effort is defined', () => {
    setupWithProps({ issue: { ...baseIssue, effort: '5min' } });

    expect(byText('issue.effort').get()).toBeInTheDocument();
    expect(byText('5 min', { exact: false }).get()).toBeInTheDocument();
  });

  it('does not render when effort is absent', () => {
    setupWithProps();

    expect(byText('issue.effort').query()).not.toBeInTheDocument();
  });
});

describe('introduced', () => {
  it('always renders the creation date', () => {
    setupWithProps();

    expect(byText('issue.introduced').get()).toBeInTheDocument();
    expect(byText(baseIssue.creationDate).get()).toBeInTheDocument();
  });
});

describe('properties', () => {
  it('renders when internalTags contains both taint and advanced', () => {
    setupWithProps({ issue: { ...baseIssue, internalTags: ['taint', 'advanced'] } });

    expect(byText('ADVANCED SAST').get()).toBeVisible();
  });

  it('does not render when only taint tag is present', () => {
    setupWithProps({ issue: { ...baseIssue, internalTags: ['taint'] } });

    expect(byText('ADVANCED SAST').query()).not.toBeInTheDocument();
  });

  it('does not render when internalTags is absent', () => {
    setupWithProps();

    expect(byText('ADVANCED SAST').query()).not.toBeInTheDocument();
  });
});

function setupWithProps(props: Partial<ComponentProps<typeof IssueMetadata>> = {}) {
  return renderWithContext(<IssueMetadata issue={baseIssue} {...props} />);
}

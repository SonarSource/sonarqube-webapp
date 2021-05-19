/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
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
import { shallow } from 'enzyme';
import * as React from 'react';
import { mockBitbucketCloudRepository } from '../../../../helpers/mocks/alm-integrations';
import BitbucketCloudSearchForm, {
  BitbucketCloudSearchFormProps
} from '../BitbucketCloudSearchForm';

it('Should render correctly', () => {
  expect(shallowRender()).toMatchSnapshot();
  expect(
    shallowRender({
      repositories: [
        mockBitbucketCloudRepository(),
        mockBitbucketCloudRepository({ sqProjectKey: 'sq-key' })
      ],
      isLastPage: false
    })
  ).toMatchSnapshot('Show more');
  expect(
    shallowRender({
      repositories: [mockBitbucketCloudRepository()],
      isLastPage: true
    })
  ).toMatchSnapshot('Show no more');
  expect(
    shallowRender({
      repositories: [mockBitbucketCloudRepository()],
      isLastPage: false,
      loadingMore: true
    })
  ).toMatchSnapshot('Loading more');
  expect(
    shallowRender({
      repositories: [],
      isLastPage: false,
      searching: true
    })
  ).toMatchSnapshot('Searching');
});

function shallowRender(props?: Partial<BitbucketCloudSearchFormProps>) {
  return shallow(
    <BitbucketCloudSearchForm
      isLastPage={true}
      loadingMore={false}
      onLoadMore={jest.fn()}
      onSearch={jest.fn()}
      searchQuery={''}
      searching={false}
      {...props}
    />
  );
}

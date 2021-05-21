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
import { waitAndUpdate } from 'sonar-ui-common/helpers/testUtils';
import { searchForBitbucketCloudRepositories } from '../../../../api/alm-integrations';
import {
  mockBitbucketCloudRepository,
  mockBitbucketRepository
} from '../../../../helpers/mocks/alm-integrations';
import { mockBitbucketCloudAlmSettingsInstance } from '../../../../helpers/mocks/alm-settings';
import { mockLocation, mockRouter } from '../../../../helpers/testMocks';
import BitbucketCloudProjectCreate, {
  BITBUCKET_PROJECTS_PAGESIZE
} from '../BitbucketCloudProjectCreate';

jest.mock('../../../../api/alm-integrations', () => {
  return {
    searchForBitbucketCloudRepositories: jest
      .fn()
      .mockResolvedValue({ isLastPage: true, repositories: [] }),
    checkPersonalAccessTokenIsValid: jest.fn().mockResolvedValue({ status: true }),
    setAlmPersonalAccessToken: jest.fn().mockResolvedValue(null)
  };
});

it('Should render correctly', async () => {
  const wrapper = shallowRender({ settings: [] });
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  wrapper.setProps({ settings: [mockBitbucketCloudAlmSettingsInstance()] });
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot('Setting changeds');
});

it('Should handle app password correctly', async () => {
  const wrapper = shallowRender();

  await waitAndUpdate(wrapper);
  await wrapper.instance().handlePersonalAccessTokenCreated();
  expect(wrapper.state().showPersonalAccessTokenForm).toBe(false);
});

it('Should handle error correctly', async () => {
  (searchForBitbucketCloudRepositories as jest.Mock).mockRejectedValueOnce({});

  const wrapper = shallowRender();
  wrapper.setState({
    showPersonalAccessTokenForm: false,
    repositories: [mockBitbucketCloudRepository()],
    projectsPaging: { pageIndex: 2, pageSize: BITBUCKET_PROJECTS_PAGESIZE }
  });
  await wrapper.instance().handlePersonalAccessTokenCreated();
  expect(wrapper.state().repositories).toHaveLength(0);
  expect(wrapper.state().projectsPaging.pageIndex).toBe(1);
  expect(wrapper.state().showPersonalAccessTokenForm).toBe(true);
  expect(wrapper.state().resetPat).toBe(true);
});

it('Should load repository', async () => {
  (searchForBitbucketCloudRepositories as jest.Mock).mockResolvedValueOnce({
    isLastPage: true,
    repositories: [mockBitbucketRepository(), mockBitbucketRepository({ sqProjectKey: 'sq-key' })]
  });

  const wrapper = shallowRender();
  await wrapper.instance().handlePersonalAccessTokenCreated();
  expect(wrapper.state().repositories).toHaveLength(2);
});

it('Should load more repository', async () => {
  (searchForBitbucketCloudRepositories as jest.Mock).mockResolvedValueOnce({
    isLastPage: true,
    repositories: [mockBitbucketRepository(), mockBitbucketRepository({ sqProjectKey: 'sq-key' })]
  });

  const wrapper = shallowRender();
  wrapper.setState({ showPersonalAccessTokenForm: false, isLastPage: false });
  wrapper.instance().handleLoadMore();
  await waitAndUpdate(wrapper);
  expect(wrapper.state().repositories).toHaveLength(2);
  expect(wrapper.state().projectsPaging.pageIndex).toBe(2);
});

it('Should handle search repository', async () => {
  (searchForBitbucketCloudRepositories as jest.Mock).mockResolvedValueOnce({
    isLastPage: true,
    repositories: [mockBitbucketRepository(), mockBitbucketRepository({ sqProjectKey: 'sq-key' })]
  });

  const wrapper = shallowRender();
  wrapper.setState({
    isLastPage: false,
    showPersonalAccessTokenForm: false,
    projectsPaging: { pageIndex: 2, pageSize: BITBUCKET_PROJECTS_PAGESIZE },
    repositories: [mockBitbucketCloudRepository()]
  });
  wrapper.instance().handleSearch('test');
  await waitAndUpdate(wrapper);
  expect(wrapper.state().repositories).toHaveLength(2);
  expect(wrapper.state().projectsPaging.pageIndex).toBe(1);
  expect(searchForBitbucketCloudRepositories).toHaveBeenLastCalledWith(
    'key',
    'test',
    BITBUCKET_PROJECTS_PAGESIZE,
    1
  );
});

function shallowRender(props?: Partial<BitbucketCloudProjectCreate['props']>) {
  return shallow<BitbucketCloudProjectCreate>(
    <BitbucketCloudProjectCreate
      onProjectCreate={jest.fn()}
      loadingBindings={false}
      location={mockLocation()}
      canAdmin={true}
      router={mockRouter()}
      settings={[mockBitbucketCloudAlmSettingsInstance()]}
      {...props}
    />
  );
}

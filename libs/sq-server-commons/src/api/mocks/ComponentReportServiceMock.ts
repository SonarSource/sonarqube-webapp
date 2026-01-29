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

import { cloneDeep } from 'lodash';
import { mockComponentReportStatus } from '../../helpers/mocks/component-report';
import { ComponentReportStatus } from '../../types/component-report';
import {
  getReportStatus,
  subscribeToEmailReport,
  unsubscribeFromEmailReport,
} from '../component-report';

jest.mock('../component-report', () => {
  const actual: typeof import('../component-report') = jest.requireActual('../component-report');
  return {
    ...actual,
    getReportStatus: jest.fn(),
    subscribeToEmailReport: jest.fn(),
    unsubscribeFromEmailReport: jest.fn(),
  };
});

const defaultReport = mockComponentReportStatus();

export class ComponentReportServiceMock {
  report: ComponentReportStatus;

  constructor() {
    this.report = cloneDeep(defaultReport);

    jest
      .mocked(unsubscribeFromEmailReport)
      .mockImplementation(this.handleUnsubscribeFromEmailReport);
    jest.mocked(subscribeToEmailReport).mockImplementation(this.handleSubscribeToEmailReport);
    jest.mocked(getReportStatus).mockImplementation(this.handleGetReportStatus);
  }

  handleGetReportStatus: typeof getReportStatus = () => {
    return this.reply(this.report);
  };

  handleUnsubscribeFromEmailReport: typeof unsubscribeFromEmailReport = () => {
    this.report.subscribed = false;
    return this.reply();
  };

  handleSubscribeToEmailReport: typeof subscribeToEmailReport = () => {
    this.report.subscribed = true;
    return this.reply();
  };

  setSubscribed = (subscribed: boolean) => {
    this.report.subscribed = subscribed;
  };

  reset = () => {
    this.report = cloneDeep(defaultReport);
  };

  reply<T>(): Promise<void>;
  reply<T>(response: T): Promise<T>;
  reply<T>(response?: T): Promise<T | void> {
    return Promise.resolve(response && cloneDeep(response));
  }
}

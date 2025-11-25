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

import { automaticReportDownload } from '../security-report';

describe('automaticReportDownload', () => {
  let mockAnchorElement: Partial<HTMLAnchorElement>;
  let mockClick: jest.Mock;
  let mockRemove: jest.Mock;
  let mockAppendChild: jest.SpyInstance;
  let mockCreateElement: jest.SpyInstance;
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    mockClick = jest.fn();
    mockRemove = jest.fn();
    mockAnchorElement = {
      click: mockClick,
      remove: mockRemove,
      href: '',
      hidden: false,
      rel: '',
    };

    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchorElement as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      return node;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create an anchor element with correct attributes and trigger download', () => {
    const downloadLink = 'https://example.com/report.pdf';

    automaticReportDownload({ downloadLink });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.href).toBe(downloadLink);
    expect(mockAnchorElement.hidden).toBe(true);
    expect(mockAnchorElement.rel).toBe('noopener noreferrer');
    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('should hide the anchor element to prevent visual flicker', () => {
    const downloadLink = 'https://example.com/report.pdf';

    automaticReportDownload({ downloadLink });

    expect(mockAnchorElement.hidden).toBe(true);
    expect(mockAnchorElement.href).toBe(downloadLink);
    expect(mockAnchorElement.rel).toBe('noopener noreferrer');
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should append and remove anchor element from document body', () => {
    const downloadLink = 'https://example.com/report.pdf';

    automaticReportDownload({ downloadLink });

    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it('should set rel attribute to prevent reverse tabnapping', () => {
    const downloadLink = 'https://example.com/report.pdf';

    automaticReportDownload({ downloadLink });

    expect(mockAnchorElement.rel).toBe('noopener noreferrer');
    expect(mockAnchorElement.hidden).toBe(true);
  });

  it('should handle different download link formats', () => {
    const downloadLinks = [
      'https://example.com/report.pdf',
      'https://www.amazonaws.com/project-1/master/regulatory-report.zip',
      '/api/download/report',
    ];

    downloadLinks.forEach((downloadLink) => {
      jest.clearAllMocks();
      mockAnchorElement.href = '';

      automaticReportDownload({ downloadLink });

      expect(mockAnchorElement.href).toBe(downloadLink);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });
});

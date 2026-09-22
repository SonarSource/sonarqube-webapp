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

import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import { useDismissNotice } from '~adapters/helpers/notices';
import { NoticeType } from '../../../../types/users';
import { useEducationPrinciplesVisibility } from '../useEducationPrinciplesVisibility';

jest.mock('~adapters/helpers/notices', () => ({
  useDismissNotice: jest.fn(),
}));

const DEBOUNCE_FOR_SCROLL = 250;

const dismissNotice = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useDismissNotice).mockReturnValue({ dismissNotice });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function createRef(top: number): RefObject<HTMLDivElement | null> {
  const element = document.createElement('div');
  element.getBoundingClientRect = jest.fn().mockReturnValue({ top } as DOMRect);
  return { current: element };
}

describe('useEducationPrinciplesVisibility', () => {
  it('dismisses the notice once its content is visible while the tab is selected', () => {
    const educationPrinciplesRef = createRef(0);
    renderHook(() => {
      useEducationPrinciplesVisibility({
        displayEducationalPrinciplesNotification: true,
        educationPrinciplesRef,
        isMoreInfoSelected: true,
      });
    });

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_FOR_SCROLL);
    });

    expect(dismissNotice).toHaveBeenCalledWith(NoticeType.EDUCATION_PRINCIPLES);
  });

  it('does not dismiss the notice when the content is below the viewport', () => {
    const educationPrinciplesRef = createRef(10_000);
    renderHook(() => {
      useEducationPrinciplesVisibility({
        displayEducationalPrinciplesNotification: true,
        educationPrinciplesRef,
        isMoreInfoSelected: true,
      });
    });

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_FOR_SCROLL);
    });

    expect(dismissNotice).not.toHaveBeenCalled();
  });

  it('does not dismiss the notice when displayEducationalPrinciplesNotification is false', () => {
    const educationPrinciplesRef = createRef(0);
    renderHook(() => {
      useEducationPrinciplesVisibility({
        displayEducationalPrinciplesNotification: false,
        educationPrinciplesRef,
        isMoreInfoSelected: true,
      });
    });

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_FOR_SCROLL);
    });

    expect(dismissNotice).not.toHaveBeenCalled();
  });

  it('dismisses the notice on scroll, independently of the initial tab-selection check', () => {
    // isMoreInfoSelected starts false so the mount-time check is a no-op; only the scroll
    // listener (attached regardless of tab selection) should trigger the dismissal here.
    const educationPrinciplesRef = createRef(0);
    renderHook(() => {
      useEducationPrinciplesVisibility({
        displayEducationalPrinciplesNotification: true,
        educationPrinciplesRef,
        isMoreInfoSelected: false,
      });
    });

    expect(dismissNotice).not.toHaveBeenCalled();

    act(() => {
      document.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(DEBOUNCE_FOR_SCROLL);
    });

    expect(dismissNotice).toHaveBeenCalledWith(NoticeType.EDUCATION_PRINCIPLES);
  });

  it('stops listening to scroll events once the notice has been dismissed', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const educationPrinciplesRef = createRef(0);

    renderHook(() => {
      useEducationPrinciplesVisibility({
        displayEducationalPrinciplesNotification: true,
        educationPrinciplesRef,
        isMoreInfoSelected: true,
      });
    });

    act(() => {
      jest.advanceTimersByTime(DEBOUNCE_FOR_SCROLL);
    });

    expect(dismissNotice).toHaveBeenCalledTimes(1);

    const scrollListenersAdded = addEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'scroll',
    );
    const scrollListenersRemoved = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'scroll',
    );

    expect(scrollListenersAdded).toHaveLength(1);
    expect(scrollListenersRemoved).toHaveLength(1);
  });
});

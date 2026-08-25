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
import { byTestId } from '../../../helpers/testSelector';
import { useFeatureCommunicationLimiter } from '../useFeatureCommunicationLimiter';

function addFeatureCommunicationElement() {
  const el = document.createElement('div');
  el.setAttribute('data-feature-communication', '');
  document.body.appendChild(el);
  return el;
}

function removeElement(el: HTMLElement) {
  el.remove();
}

describe('useFeatureCommunicationLimiter', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    document.body.innerHTML = '';
  });

  it('does nothing in non-development environments', async () => {
    process.env.NODE_ENV = 'production';

    renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    let el: HTMLElement;
    act(() => {
      addFeatureCommunicationElement();
      el = addFeatureCommunicationElement();
    });

    await waitForMutations();

    expect(el!).toHaveStyle({ outline: '' });
    expect(byTestId('warning-banner').query()).not.toBeInTheDocument();
  });

  it('observes DOM mutations and shows no violation with a single feature communication component', async () => {
    renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    let el: HTMLElement;
    act(() => {
      el = addFeatureCommunicationElement();
    });

    await waitForMutations();

    expect(el!).toHaveStyle({ outline: '' });
    expect(byTestId('warning-banner').query()).not.toBeInTheDocument();
  });

  it('highlights all instances and shows a banner when more than one feature communication component is rendered', async () => {
    renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    let el1: HTMLElement;
    let el2: HTMLElement;
    act(() => {
      el1 = addFeatureCommunicationElement();
      el2 = addFeatureCommunicationElement();
    });

    await waitForMutations();

    expect(el1!.style.outline).toContain('dashed');
    expect(el2!.style.outline).toContain('dashed');

    const banner = byTestId('warning-banner').get();
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Too many feature communication components!/);
  });

  it('removes outlines and hides the banner when violation is resolved', async () => {
    renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    let el1: HTMLElement;
    let el2: HTMLElement;
    act(() => {
      el1 = addFeatureCommunicationElement();
      el2 = addFeatureCommunicationElement();
    });

    await waitForMutations();

    expect(el1!).toHaveStyle({ outline: '4px dashed #ff0000ab' });

    act(() => {
      removeElement(el2!);
    });

    await waitForMutations();

    expect(el1!).toHaveStyle({ outline: '' });
    expect(byTestId('warning-banner').query()).not.toBeInTheDocument();
  });

  it('disconnects observer and hides banner on unmount', async () => {
    const { unmount } = renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    let el1: HTMLElement;
    let el2: HTMLElement;
    act(() => {
      el1 = addFeatureCommunicationElement();
      el2 = addFeatureCommunicationElement();
    });

    await waitForMutations();

    expect(byTestId('warning-banner').get()).toBeInTheDocument();

    unmount();

    expect(byTestId('warning-banner').query()).not.toBeInTheDocument();

    // After unmount, adding more elements should not trigger new observations
    act(() => {
      addFeatureCommunicationElement();
    });

    await waitForMutations();

    // Banner should still be gone (observer disconnected)
    expect(byTestId('warning-banner').query()).not.toBeInTheDocument();

    removeElement(el1!);
    removeElement(el2!);
  });

  it('does not create multiple banners when violation persists across multiple mutations', async () => {
    renderHook(() => {
      useFeatureCommunicationLimiter();
    });

    act(() => {
      addFeatureCommunicationElement();
      addFeatureCommunicationElement();
    });

    await waitForMutations();

    act(() => {
      // Trigger another mutation while violation still exists
      document.body.appendChild(document.createElement('span'));
    });

    await waitForMutations();

    expect(byTestId('warning-banner').getAll()).toHaveLength(1);
  });
});

/**
 * MutationObserver callbacks are microtasks. Flushing with a short Promise
 * resolution is enough to let them run.
 */
function waitForMutations() {
  return act(() => Promise.resolve());
}

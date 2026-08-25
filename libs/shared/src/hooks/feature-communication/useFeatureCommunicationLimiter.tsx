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

import { noop } from 'lodash';
import useEffectOnce from '../../helpers/useEffectOnce';

const FEATURE_COMMUNICATION_SELECTOR = '[data-feature-communication]';
const ERROR_MESSAGE = `Too many feature communication components!
Find the other instance(s) and reach out to your UX designer or PM to solve this conflict.`;

let bannerElement: HTMLDivElement | null = null;

function showBanner() {
  if (bannerElement !== null) {
    return;
  }
  bannerElement = document.createElement('div');
  Object.assign(bannerElement.style, {
    position: 'fixed',
    top: '16px',
    left: '16px',
    right: '16px',
    padding: '32px 16px',
    backgroundColor: '#c20303ae',
    color: 'white',
    border: '1px solid red',
    fontSize: '24px',
    zIndex: '9999',
  });
  bannerElement.textContent = ERROR_MESSAGE;
  bannerElement.dataset.testid = 'warning-banner';
  document.body.appendChild(bannerElement);
}

function hideBanner() {
  if (bannerElement === null) {
    return;
  }
  bannerElement.remove();
  bannerElement = null;
}

/**
 * Use once at the root of the app.
 * It attaches a single MutationObserver that detects when more than one
 * feature-communication component is rendered at the same time.
 *
 * Only active in development mode.
 */
export function useFeatureCommunicationLimiter() {
  useEffectOnce(() => {
    if (process.env.NODE_ENV !== 'development') {
      return noop;
    }

    const observer = new MutationObserver(checkInstances);
    observer.observe(document.body, { childList: true, subtree: true });

    // initial sweep
    checkInstances();

    return () => {
      observer.disconnect();
      hideBanner();
      const instances = document.querySelectorAll(FEATURE_COMMUNICATION_SELECTOR);
      cleanInstances(instances);
    };
  });
}

function checkInstances() {
  const instances = document.querySelectorAll(FEATURE_COMMUNICATION_SELECTOR);
  const violation = instances.length > 1;

  if (violation) {
    highlightInstances(instances);
    showBanner();
  } else {
    cleanInstances(instances);
    hideBanner();
  }
}

function highlightInstances(instances: NodeListOf<Element>) {
  instances.forEach((element: HTMLElement) => {
    const { style } = element;
    style.outline = '4px dashed #ff0000ab';
    style.outlineOffset = '2px';
  });
}

function cleanInstances(instances: NodeListOf<Element>) {
  instances.forEach((element: HTMLElement) => {
    const { style } = element;
    style.removeProperty('outline');
    style.removeProperty('outline-offset');
  });
}

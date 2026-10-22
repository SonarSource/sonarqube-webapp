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

import * as EmotionReact from '@emotion/react';
import EmotionStyled from '@emotion/styled';
import * as DateFns from 'date-fns';
import Lodash from 'lodash';
import React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactIntl from 'react-intl';
import ReactModal from 'react-modal';
import * as ReactRouter from 'react-router';
import * as ReactRouterDom from 'react-router/dom';

type ReactRouterExtensions = typeof ReactRouter & typeof ReactRouterDom;

declare global {
  interface Window {
    DateFns: typeof DateFns;
    EmotionReact: typeof EmotionReact;
    EmotionStyled: typeof EmotionStyled;
    Lodash: typeof Lodash;
    React: typeof React;
    ReactDOM: typeof ReactDom;
    ReactIntl: typeof ReactIntl;
    ReactModal: typeof ReactModal;
    ReactRouterDom: ReactRouterExtensions;
  }
}

/*
 * Expose dependencies to extensions
 */
export default function exportModulesAsGlobals() {
  window.EmotionReact = EmotionReact;
  window.EmotionStyled = EmotionStyled;
  window.DateFns = DateFns;
  window.Lodash = Lodash;
  window.React = React;
  window.ReactDOM = ReactDom;
  window.ReactIntl = ReactIntl;
  window.ReactModal = ReactModal;

  // Extensions still look for a `ReactRouterDom` global even though the Router 8-compatible
  // package split comes from `react-router` plus `react-router/dom`.
  window.ReactRouterDom = { ...ReactRouter, ...ReactRouterDom };
}

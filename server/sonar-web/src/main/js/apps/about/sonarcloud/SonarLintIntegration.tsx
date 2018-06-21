/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import SonarCloudPage from './SonarCloudPage';
import SQStartUsing from './SQStartUsing';
import SQTopNav from './SQTopNav';
import { isLoggedIn } from '../../../app/types';
import { getBaseUrl } from '../../../helpers/urls';
import './style.css';

export default function SonarLintIntegration() {
  return (
    <SonarCloudPage>
      {({ currentUser }) => (
        <div className="page page-limited sc-page">
          <SQTopNav />

          <div className="sc-child-header">
            <img
              alt=""
              height="34"
              src={`${getBaseUrl()}/images/sonarcloud/sonarlint-integration.svg`}
            />
            <h1 className="sc-child-title">SonarLint integration</h1>
            <p className="sc-child-lead">
              SonarCloud can be extended with{' '}
              <a className="sc-child-lead-link" href="https://www.sonarlint.org/">
                SonarLint
              </a>{' '}
              to provide developers maximum insight <br />in their IDEs on code quality and make
              sure they do not introduce new issues.
            </p>
            <img
              alt=""
              height="147"
              src={`${getBaseUrl()}/images/sonarcloud/sl-notif.png`}
              srcSet={`${getBaseUrl()}/images/sonarcloud/sl-notif.png 1x, ${getBaseUrl()}/images/sonarcloud/sl-notif@2x.png 2x`}
              width="450"
            />
          </div>

          <ul className="sc-features-list">
            <li className="sc-feature sc-child-feature">
              <h3 className="sc-feature-title">Get instant feedback</h3>
              <p className="sc-feature-description">
                SonarLint will provide developers with instant feedback in their IDEs as they are
                writing code, like with a spell checker. SonarLint also shows already existing
                issues in the code and enables developers to differentiate what issues they
                introduced.
              </p>
            </li>
            <li className="sc-feature sc-child-feature">
              <h3 className="sc-feature-title">Share quality profiles</h3>
              <p className="sc-feature-description">
                Teams will share the ruleset used to check quality on the project. This means that
                not only everyone in the team uses the same rules but it also means that if you
                update this ruleset, everybody will use immediately the updated one.
              </p>
            </li>
            <li className="sc-feature sc-child-feature">
              <h3 className="sc-feature-title">Share configuration</h3>
              <p className="sc-feature-description">
                Project configuration such as exclutions, parameters and false positives get
                conveyed to the IDE as they get defined, enabling the team get exactly the same view
                on the project they are working on.
              </p>
            </li>
            <li className="sc-feature sc-child-feature">
              <h3 className="sc-feature-title">Event notification</h3>
              <p className="sc-feature-description">
                Developers will get notified directly in their IDEs when the Quality Gate of their
                project fails or when they have introduced an issue that has been picked by
                SonarCloud.
              </p>
            </li>
          </ul>

          {!isLoggedIn(currentUser) && <SQStartUsing />}
        </div>
      )}
    </SonarCloudPage>
  );
}

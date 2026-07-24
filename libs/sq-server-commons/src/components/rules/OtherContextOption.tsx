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

import { IconCheck, IconX, Link } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';

export default function OtherContextOption() {
  return (
    <>
      <h2>
        <FormattedMessage id="coding_rules.context.others.title" />
      </h2>
      <p>
        <FormattedMessage id="coding_rules.context.others.description.first" />
      </p>
      <p>
        <FormattedMessage id="coding_rules.context.others.description.second" />
      </p>
      <p>
        <span className="sw-flex sw-items-center sw-ml-4">
          <IconCheck className="sw-mr-2" color="echoes-color-icon-success" />
          <FormattedMessage id="coding_rules.context.others.description.do" />
        </span>
        <span className="sw-flex sw-items-center sw-ml-4">
          <IconX className="sw-mr-2" color="echoes-color-icon-danger" />
          <FormattedMessage id="coding_rules.context.others.description.dont" />
        </span>
      </p>
      <h2>
        <FormattedMessage id="coding_rules.context.others.title_feedback" />
      </h2>
      <p>
        <FormattedMessage id="coding_rules.context.others.feedback_description_1" />
      </p>
      <Link
        enableOpenInNewTab
        to="https://portal.productboard.com/sonarsource/3-sonarqube/submit-idea"
      >
        <FormattedMessage id="coding_rules.context.others.feedback_description.link" />
      </Link>
      <p>
        <FormattedMessage id="coding_rules.context.others.feedback_description_2" />
      </p>
    </>
  );
}

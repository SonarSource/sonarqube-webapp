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
import * as getYear from 'date-fns/get_year';
import { Link } from 'react-router';
import { translate } from '../../helpers/l10n';

export default function GlobalFooterSonarCloud() {
  return (
    <div className="page-footer page-container" id="footer">
      <div>
        {`© 2008-${getYear(new Date())}, SonarCloud by `}
        <a href="http://www.sonarsource.com" title="SonarSource SA">
          SonarSource SA
        </a>
        . All rights reserved.
      </div>

      <ul className="page-footer-menu">
        <li className="page-footer-menu-item">
          <a href="https://blog.sonarsource.com/product/SonarCloud">{translate('footer.news')}</a>
        </li>
        <li className="page-footer-menu-item">
          <a href="https://twitter.com/sonarcloud">{translate('footer.twitter')}</a>
        </li>
        <li className="page-footer-menu-item">
          <Link rel="noopener noreferrer" target="_blank" to="/sonarcloud-terms.pdf">
            {translate('footer.terms')}
          </Link>
        </li>
        <li className="page-footer-menu-item">
          <Link to="/privacy">{translate('footer.privacy')}</Link>
        </li>
        <li className="page-footer-menu-item">
          <a href="https://community.sonarsource.com/c/help/sc">{translate('footer.help')}</a>
        </li>
        <li className="page-footer-menu-item">
          <Link to="/contact">{translate('footer.contact_us')}</Link>
        </li>
        <li className="page-footer-menu-item">
          <a href="https://sonarcloud.statuspage.io/">{translate('footer.status')}</a>
        </li>
        <li className="page-footer-menu-item">
          <Link to="/about">{translate('footer.about')}</Link>
        </li>
      </ul>
    </div>
  );
}

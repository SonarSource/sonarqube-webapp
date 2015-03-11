/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
/* global casper:false */

var lib = require('../lib');

lib.initMessages();
lib.changeWorkingDirectory('coding-rules-page-should-show-details');
lib.configureCasper();


casper.test.begin('coding-rules-page-should-show-details', 20, function (test) {
  casper
      .start(lib.buildUrl('coding-rules'), function () {
        lib.setDefaultViewport();


        lib.mockRequestFromFile('/api/rules/app', 'app.json');
        lib.mockRequestFromFile('/api/rules/search', 'search.json');
        lib.mockRequestFromFile('/api/rules/show', 'show.json');
        lib.mockRequest('/api/issues/search', '{}');
      })

      .then(function () {
        casper.waitForSelector('.coding-rule.selected', function () {
          casper.click('.coding-rule.selected .js-rule');
        });
      })

      .then(function () {
        casper.waitForSelector('.coding-rules-detail-header');
      })

      .then(function () {
        test.assertSelectorContains('.search-navigator-workspace-details',
            'Throwable and Error classes should not be caught');

        test.assertSelectorContains('.search-navigator-workspace-details', 'squid:S1181');
        test.assertExists('.coding-rules-detail-properties .icon-severity-blocker');
        test.assertSelectorContains('.coding-rules-detail-properties', 'error-handling');
        test.assertSelectorContains('.coding-rules-detail-properties', '2013');
        test.assertSelectorContains('.coding-rules-detail-properties', 'SonarQube (Java)');
        test.assertSelectorContains('.coding-rules-detail-properties', 'Reliability > Exception handling');
        test.assertSelectorContains('.coding-rules-detail-properties', 'LINEAR');
        test.assertSelectorContains('.coding-rules-detail-properties', '20min');

        test.assertSelectorContains('.coding-rules-detail-description', 'is the superclass of all errors and');
        test.assertSelectorContains('.coding-rules-detail-description', 'its subclasses should be caught.');
        test.assertSelectorContains('.coding-rules-detail-description', 'Noncompliant Code Example');
        test.assertSelectorContains('.coding-rules-detail-description', 'Compliant Solution');

        test.assertSelectorContains('.coding-rules-detail-parameters', 'max');
        test.assertSelectorContains('.coding-rules-detail-parameters', 'Maximum authorized number of parameters');
        test.assertSelectorContains('.coding-rules-detail-parameters', '7');

        test.assertElementCount('.coding-rules-detail-quality-profile-name', 6);
        test.assertSelectorContains('.coding-rules-detail-quality-profile-name', 'Default - Top');
        test.assertElementCount('.coding-rules-detail-quality-profile-inheritance', 4);
        test.assertSelectorContains('.coding-rules-detail-quality-profile-inheritance', 'Default - Top');
      })

      .then(function () {
        lib.sendCoverage();
      })

      .run(function () {
        test.done();
      });
});

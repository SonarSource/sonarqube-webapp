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

import { Text } from '@sonarsource/echoes-react';
import { Image } from '~adapters/components/common/Image';
import { Link, SubHeading } from '~design-system';
import { Edition, EditionKey } from '~sq-server-commons/types/editions';

interface Props {
  edition: Edition;
}

export default function EditionBox({ edition }: Readonly<Props>) {
  switch (edition.key) {
    case EditionKey.datacenter:
      return (
        <div>
          <SubHeading as="h2" id="data-center-edition">
            <Image
              alt="SonarQube logo"
              className="sw-mr-2"
              src="/images/embed-doc/sq-icon.svg"
              width={16}
            />
            <span>Data Center Edition</span>
          </SubHeading>
          <p className="sw-mt-4">
            <em>High availability, scalability, and peak performance for large codebases</em>
          </p>
          <p className="sw-mt-4">Includes everything in Enterprise Edition plus:</p>
          <Text as="ul" className="sw-ml-8">
            <li>Autoscaling in a Kubernetes cluster</li>
            <li>Component redundancy</li>
            <li>Data resiliency</li>
            <li>Horizontal scalability</li>
            <li>
              Get SCA with Advanced Security add-on:{' '}
              <Link
                className="sw-whitespace-nowrap"
                to="https://www.sonarsource.com/products/sonarqube/advanced-security/free-trial/?referrer=sonarqube-marketplace"
              >
                Secure your code dependencies
              </Link>
            </li>
          </Text>
        </div>
      );

    case EditionKey.enterprise:
      return (
        <div>
          <SubHeading as="h2" id="enterprise-edition">
            <Image
              alt="SonarQube logo"
              className="sw-mr-2"
              src="/images/embed-doc/sq-icon.svg"
              width={16}
            />
            <span>Enterprise Edition</span>
          </SubHeading>
          <p className="sw-mt-4">
            <em>Deeper insights and enterprise-level performance</em>
          </p>
          <p className="sw-mt-4">Includes everything in Developer Edition plus:</p>
          <Text as="ul" className="sw-ml-8">
            <li>AI CodeFix for one-click AI-powered fix recommendations</li>
            <li>Meet compliance with common security standards: PCI, OWASP, CWE, STIG, and CASA</li>
            <li>Security engine custom configuration for more powerful taint analysis</li>
            <li>
              View code quality across all your projects in one place by aggregating into a
              Portfolio
            </li>
            <li>Deliver executive summary reports of your projects, applications and portfolios</li>
            <li>
              Get SCA with Advanced Security add-on:{' '}
              <Link
                className="sw-whitespace-nowrap"
                to="https://www.sonarsource.com/products/sonarqube/advanced-security/free-trial/?referrer=sonarqube-marketplace"
              >
                Secure your code dependencies
              </Link>
            </li>
          </Text>
        </div>
      );

    case EditionKey.developer:
      return (
        <div>
          <SubHeading as="h2" id="developer-edition">
            <Image
              alt="SonarQube logo"
              className="sw-mr-2"
              src="/images/embed-doc/sq-icon.svg"
              width={16}
            />
            <span>Developer Edition</span>
          </SubHeading>
          <p className="sw-mt-4">
            <em>Essential capabilities for small teams & businesses</em>
          </p>
          <p className="sw-mt-4">Includes everything in Community Build plus:</p>
          <Text as="ul" className="sw-ml-8">
            <li>
              AI Code Assurance to ensure AI-generated code is verified to meet your standards
            </li>
            <li>
              SAST with taint analysis to detect injection vulnerabilities for Java, JavaScript,
              TypeScript, Python, C#, and PHP
            </li>
            <li>Powerful secrets detection for accessing private and enterprise cloud services</li>
            <li>
              Pull request and branch analysis including displaying quality gate status directly in
              DevOps platforms: GitHub, GitLab, Bitbucket, and Azure DevOps
            </li>
            <li>
              Additional languages: C, C++, Obj-C, Dart/Flutter, Swift, ABAP, T-SQL, PL/SQL, and
              Ansible
            </li>
          </Text>
        </div>
      );

    default:
      return null;
  }
}

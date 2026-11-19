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

import { Card, Divider, Heading, HeadingSize, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { GlobalPageTemplate } from '~sq-server-commons/components/ui/GlobalPageTemplate';
import { CreateProjectStep, CreateProjectStepper } from './CreateProjectStepper';

interface Props {
  children: ReactNode;
  description?: ReactNode;
  pageClassName?: string;
  step: CreateProjectStep;
  title: string;
}

/**
 * Layout shared by the two steps of the project creation flow: the stepper on top, followed by a
 * single card holding the step header and its content (same structure as the SonarQube Cloud
 * onboarding).
 */
export function CreateProjectPageLayout({
  children,
  description,
  pageClassName,
  step,
  title,
}: Readonly<Props>) {
  return (
    <GlobalPageTemplate hidePageHeader pageClassName={pageClassName} title={title}>
      <div className="sw:flex sw:justify-center sw:pb-6">
        <CreateProjectStepper step={step} />
      </div>

      <Card className="sw:w-full sw:h-fit" size="medium">
        {/* Card.Body stretches its direct children to 100% height, they need a single wrapper. */}
        <Card.Body className="sw:p-0">
          <div className="sw:p-6">
            <Heading as="h1" size={HeadingSize.Large}>
              {title}
            </Heading>

            {description && (
              <Text as="div" isSubtle>
                {description}
              </Text>
            )}

            <div className="sw:mx-[-1.5rem] sw:my-4">
              <Divider />
            </div>

            {children}
          </div>
        </Card.Body>
      </Card>
    </GlobalPageTemplate>
  );
}

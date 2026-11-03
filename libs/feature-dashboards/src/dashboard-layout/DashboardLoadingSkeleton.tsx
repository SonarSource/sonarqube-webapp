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

import { Card, LoadingContainer, LoadingSkeleton } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';

function DashboardLoadingSkeleton() {
  const { formatMessage } = useIntl();

  return (
    <LoadingContainer isLoading loadingMessage={formatMessage({ id: 'loading' })}>
      <div aria-hidden className="sw:flex sw:flex-col sw:gap-6">
        <LoadingSkeleton className="sw:h-400 sw:w-1/3" variety="rectangle" />
        <div className="sw:flex sw:flex-wrap sw:gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <Card className="sw:min-w-[240px] sw:flex-1" key={index}>
              <Card.Header title={<LoadingSkeleton className="sw:w-1/2" variety="text" />} />
              <Card.Body>
                <LoadingSkeleton className="sw:h-[160px] sw:w-full" variety="rectangle" />
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </LoadingContainer>
  );
}

export { DashboardLoadingSkeleton };

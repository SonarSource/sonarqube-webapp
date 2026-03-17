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

import {
  ExternalProductConnectionSharedComponent,
  ExternalProductIllustrations,
  ExternalProductKind,
  NewTokenInfo,
} from '~shared/components/external-product-connection/ExternalProductConnectionSharedComponent';
import { SonarQubeCliConnectionIllustration } from '~sq-server-commons/components/branding/SonarQubeCliConnectionIllustration';
import { SonarQubeIdeConnectionIllustration } from '~sq-server-commons/components/branding/SonarQubeIdeConnectionIllustration';
import { whenLoggedIn } from '~sq-server-commons/components/hoc/whenLoggedIn';
import { generateUserToken, sendUserToken } from '~sq-server-commons/helpers/sonarlint';
import { NewUserToken } from '~sq-server-commons/types/token';
import { LoggedInUser } from '~sq-server-commons/types/users';

const ILLUSTRATIONS: Partial<Record<ExternalProductKind, ExternalProductIllustrations>> = {
  [ExternalProductKind.SQ_IDE]: {
    illustrationConnected: () => <SonarQubeIdeConnectionIllustration connected />,
    illustrationNotConnected: () => <SonarQubeIdeConnectionIllustration connected={false} />,
  },
  [ExternalProductKind.SQ_CLI]: {
    illustrationConnected: () => <SonarQubeCliConnectionIllustration connected />,
    illustrationNotConnected: () => <SonarQubeCliConnectionIllustration connected={false} />,
  },
};

async function generateToken(
  productName: string,
  login: string,
): Promise<NewTokenInfo | undefined> {
  return generateUserToken({ productName, login }).catch(() => undefined);
}

async function sendToken(port: number, token: NewTokenInfo): Promise<void> {
  return sendUserToken(port, token as NewUserToken);
}

interface Props {
  currentUser: LoggedInUser;
}

function ExternalProductConnection({ currentUser }: Readonly<Props>) {
  return (
    <ExternalProductConnectionSharedComponent
      currentUser={currentUser}
      generateToken={generateToken}
      illustrations={ILLUSTRATIONS}
      sendToken={sendToken}
    />
  );
}

export default whenLoggedIn(ExternalProductConnection);

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

import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { OrganizationAccess } from '../OrganizationAccessContext';
import { RequestAdminAccessModal } from '../RequestAdminAccessModal';
import {
  AdminsQueryResult,
  adminsQueryResult,
  PREFIX as ENTERPRISE_PREFIX,
} from './enterpriseDashboardTestSetup';

const PREFIX = `${ENTERPRISE_PREFIX}.request_access`;

const mockUseOrganizationAdminsQuery = jest.fn<AdminsQueryResult, [string]>();

// Product-specific; covered by the adapter tests.
jest.mock('~adapters/queries/onboarding', () => ({
  useOrganizationAdminsQuery: (organizationKey: string) =>
    mockUseOrganizationAdminsQuery(organizationKey),
}));

const ADA = { email: 'ada@acme.test', id: 'ada-id', login: 'ada', name: 'Ada Lovelace' };
const ALAN = { email: 'alan@acme.test', id: 'alan-id', login: 'alan', name: 'Alan Turing' };

const ui = {
  dialog: byRole('dialog'),
  title: byText(`${PREFIX}.title`),
  description: byText(`${PREFIX}.description`),
  adminsTitle: byText(`${PREFIX}.admins.title`),
  notMember: byText(`${PREFIX}.not_member`),
  error: byText(`${PREFIX}.admins.error`),
  loading: byText('onboarding_dashboard.loading'),
  more: (count: number) => byText(`${PREFIX}.admins.more.${count}`),
  close: byRole('button', { name: 'close' }),
  copy: (name: string) => byRole('button', { name: `${PREFIX}.admins.copy.${name}` }),
};

beforeEach(() => {
  mockUseOrganizationAdminsQuery.mockReset();
});

function renderModal(
  access: OrganizationAccess.Member | OrganizationAccess.None = OrganizationAccess.Member,
) {
  const onClose = jest.fn();
  const result = renderWithRouter(
    <RequestAdminAccessModal access={access} onClose={onClose} organizationKey="data-platform" />,
  );

  return { ...result, onClose };
}

function givenAdmins(result: Partial<AdminsQueryResult>) {
  mockUseOrganizationAdminsQuery.mockReturnValue(adminsQueryResult(result));
}

describe('for a member of the organization', () => {
  it('says what is needed, and who to ask, with an email address to copy for each', async () => {
    givenAdmins({ data: { admins: [ADA, ALAN], total: 2 } });
    renderModal();

    expect(await ui.title.find()).toBeInTheDocument();
    expect(ui.description.get()).toBeInTheDocument();
    expect(ui.adminsTitle.get()).toBeInTheDocument();
    expect(byText('Ada Lovelace').get()).toBeInTheDocument();
    expect(byText('ada@acme.test').get()).toBeInTheDocument();
    expect(byText('Alan Turing').get()).toBeInTheDocument();
    expect(ui.copy('Ada Lovelace').get()).toBeInTheDocument();
    expect(ui.copy('Alan Turing').get()).toBeInTheDocument();
  });

  it('asks for the administrators of the organization', async () => {
    givenAdmins({ data: { admins: [ADA], total: 1 } });
    renderModal();

    await ui.title.find();

    expect(mockUseOrganizationAdminsQuery).toHaveBeenCalledWith('data-platform');
  });

  it('shows the login of an administrator with no email, and nothing to copy', async () => {
    givenAdmins({ data: { admins: [{ ...ADA, email: undefined }], total: 1 } });
    renderModal();

    expect(await byText('ada').find()).toBeInTheDocument();
    expect(ui.copy('Ada Lovelace').query()).not.toBeInTheDocument();
  });

  it('counts the administrators it does not list', async () => {
    givenAdmins({ data: { admins: [ADA, ALAN], total: 5 } });
    renderModal();

    expect(await ui.more(3).find()).toBeInTheDocument();
  });

  it('does not count any when it lists them all', async () => {
    givenAdmins({ data: { admins: [ADA], total: 1 } });
    renderModal();

    await ui.title.find();

    expect(ui.more(0).query()).not.toBeInTheDocument();
  });

  it('announces the loading of the administrators, and lists none meanwhile', async () => {
    givenAdmins({ isPending: true });
    renderModal();

    expect(await ui.loading.find()).toBeInTheDocument();
    expect(ui.adminsTitle.query()).not.toBeInTheDocument();
  });

  it('says so when the administrators cannot be loaded, and still says what is needed', async () => {
    givenAdmins({ isError: true });
    renderModal();

    expect(await ui.error.find()).toBeInTheDocument();
    expect(ui.description.get()).toBeInTheDocument();
    expect(ui.adminsTitle.query()).not.toBeInTheDocument();
  });

  it('closes', async () => {
    givenAdmins({ data: { admins: [ADA], total: 1 } });
    const { onClose, user } = renderModal();

    await user.click(await ui.close.find());

    expect(onClose).toHaveBeenCalled();
  });
});

describe('for someone who is not a member of the organization', () => {
  it('says what is needed and to ask the administrators, without asking who they are', async () => {
    renderModal(OrganizationAccess.None);

    expect(await ui.title.find()).toBeInTheDocument();
    expect(ui.description.get()).toBeInTheDocument();
    expect(ui.notMember.get()).toBeInTheDocument();
    // The users service answers members only: asking would only fail.
    expect(mockUseOrganizationAdminsQuery).not.toHaveBeenCalled();
    expect(ui.adminsTitle.query()).not.toBeInTheDocument();
  });
});

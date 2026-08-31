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

import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardType } from '~feature-dashboards/types/dashboard-list';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { mockAppState } from '~sq-server-commons/helpers/testMocks';
import { EditionKey } from '~sq-server-commons/types/editions';
import { Permissions } from '~sq-server-commons/types/permissions';
import { ProjectCustomDashboardPage } from '../ProjectCustomDashboardPage';

const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockRetry = jest.fn();
const mockResetTargetSection = jest.fn();
const mockUseUsersByIdsQuery = jest.fn();
const mockDownloadDashboardSchema = jest.fn();
let mockCurrentUser: { isLoggedIn: boolean; permissions: { global: Permissions[] } };
let mockDashboardId = '77acc15a-1742-42ff-9469-7e4de1faa19f';
let mockQuery: { data?: unknown; error?: unknown; isPending: boolean; refetch: () => void };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ dashboardId: mockDashboardId }),
}));

jest.mock('~sq-server-commons/context/componentContext/withComponentContext', () => ({
  useComponent: () => ({ component: { key: 'project-key' } }),
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/useProjectId', () => ({
  useProjectId: () => 'project-id',
}));
jest.mock('~sq-server-commons/sq-server-adapters/helpers/users', () => ({
  useCurrentUser: () => mockCurrentUser,
}));
jest.mock('~sq-server-commons/queries/users', () => ({
  useUsersByIdsQuery: (ids: string[]) => mockUseUsersByIdsQuery(ids),
}));
jest.mock('~feature-dashboards/helpers/downloadDashboardSchema', () => ({
  downloadDashboardSchema: (dashboard: unknown) => mockDownloadDashboardSchema(dashboard),
}));

jest.mock('../../../../queries/project-dashboards', () => ({
  useDeleteProjectDashboardMutation: () => ({ isPending: false, mutate: mockDelete }),
  useGetProjectDashboardQuery: () => mockQuery,
  useUpdateProjectDashboardMutation: () => ({ isPending: false, mutate: mockUpdate }),
}));

jest.mock('~feature-dashboards/dashboard-layout/DashboardCustomDashboardViews', () => {
  const mockDashboardCustomDashboardState = {
    Error: 'error',
    InvalidLayout: 'invalid-layout',
    Loading: 'loading',
    NotFound: 'not-found',
    Ready: 'ready',
  } as const;

  return {
    DashboardCustomDashboardGenericError: ({ onRetry }: { onRetry: () => void }) => (
      <button onClick={onRetry} type="button">
        generic-error
      </button>
    ),
    DashboardCustomDashboardInvalidLayout: () => <div>invalid-layout</div>,
    DashboardCustomDashboardLoading: () => <div>loading-dashboard</div>,
    DashboardCustomDashboardNotFound: () => <div>dashboard-not-found</div>,
    DashboardCustomDashboardState: mockDashboardCustomDashboardState,
    getDashboardCustomDashboardState: ({
      error,
      isLoading,
      dashboard,
    }: {
      error?: unknown;
      isLoading: boolean;
      dashboard?: unknown;
    }) => {
      if (isLoading) {
        return mockDashboardCustomDashboardState.Loading;
      }
      if (error === 'not-found') {
        return mockDashboardCustomDashboardState.NotFound;
      }
      if (error === 'invalid-layout') {
        return mockDashboardCustomDashboardState.InvalidLayout;
      }
      if (error || !dashboard) {
        return mockDashboardCustomDashboardState.Error;
      }
      return mockDashboardCustomDashboardState.Ready;
    },
  };
});

jest.mock('~feature-dashboards/hooks/useAddWidget', () => ({
  useAddWidget: () => ({
    handleAddWidget: jest.fn(),
    handleAddWidgetToSection: jest.fn(),
    handleResetTargetSection: mockResetTargetSection,
  }),
}));
jest.mock('~feature-dashboards/widget-creation-modal/hooks/useEditWidget', () => ({
  useEditWidget: () => ({
    handleOpenEditWidget: jest.fn(),
    handleSaveEditWidget: jest.fn(),
    initialWidgetProps: undefined,
  }),
}));
jest.mock('~feature-dashboards/hooks/useNativeBrowserNavigationBlocker', () => ({
  useNativeBrowserNavigationBlocker: jest.fn(),
}));

jest.mock('~feature-dashboards/dashboard-layout/DashboardCustomDashboardContent', () => ({
  DashboardCustomDashboardContent: ({
    isEditing,
    onAddWidgetToSection,
    onWidgetEdit,
  }: {
    isEditing: boolean;
    onAddWidgetToSection: (index: number) => void;
    onWidgetEdit: (index: number, widget: never) => void;
  }) => (
    <div data-testid="dashboard-content">
      editing:{String(isEditing)}
      <button
        onClick={() => {
          onAddWidgetToSection(0);
        }}
        type="button"
      >
        add-widget-section
      </button>
      <button
        onClick={() => {
          onWidgetEdit(0, {} as never);
        }}
        type="button"
      >
        edit-widget-section
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-layout/EditToolbar', () => ({
  EditToolbar: ({
    onSaveChanges,
    onExitEdit,
    onSetIsAddWidgetModalOpen,
    onSetIsCreateSectionModalOpen,
  }: {
    onSaveChanges: () => void;
    onExitEdit: () => void;
    onSetIsAddWidgetModalOpen: (open: boolean) => void;
    onSetIsCreateSectionModalOpen: (open: boolean) => void;
  }) => (
    <div>
      <button onClick={onSaveChanges} type="button">
        save-changes
      </button>
      <button onClick={onExitEdit} type="button">
        exit-edit
      </button>
      <button
        onClick={() => {
          onSetIsAddWidgetModalOpen(true);
        }}
        type="button"
      >
        add-widget-toolbar
      </button>
      <button
        onClick={() => {
          onSetIsCreateSectionModalOpen(true);
        }}
        type="button"
      >
        create-section
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-layout/modals/CreateSectionModal', () => ({
  CreateSectionModal: ({
    isOpen,
    onConfirm,
  }: {
    isOpen: boolean;
    onConfirm: (name: string, description: string) => void;
  }) =>
    isOpen ? (
      <button
        onClick={() => {
          onConfirm('New section', 'Description');
        }}
        type="button"
      >
        confirm-section
      </button>
    ) : null,
}));
jest.mock(
  '~feature-dashboards/widget-creation-modal/components/DashboardCustomDashboardWidgetModal',
  () => ({
    DashboardCustomDashboardWidgetModal: ({
      isAddWidgetModalOpen,
      isEditWidgetModalOpen,
      metricPickerOptions,
      onOpenChange,
      onSaveWidget,
      renderOptions,
    }: {
      isAddWidgetModalOpen: boolean;
      isEditWidgetModalOpen: boolean;
      metricPickerOptions: never;
      onOpenChange: (open: boolean) => void;
      onSaveWidget: (widget: never) => void;
      renderOptions: (args: never) => ReactNode;
    }) =>
      isAddWidgetModalOpen || isEditWidgetModalOpen ? (
        <div>
          <button
            onClick={() => {
              onOpenChange(false);
            }}
            type="button"
          >
            close-widget
          </button>
          <button
            onClick={() => {
              onSaveWidget({} as never);
            }}
            type="button"
          >
            save-widget
          </button>
          {renderOptions({
            dispatch: jest.fn(),
            isEditMode: isEditWidgetModalOpen,
            metricPickerOptions,
            state: {} as never,
          } as never)}
        </div>
      ) : null,
  }),
);
jest.mock('../ProjectDashboardModal', () => ({
  ProjectDashboardModal: ({
    isOpen,
    onSave,
  }: {
    isOpen: boolean;
    onSave: (dashboard: never) => void;
  }) =>
    isOpen ? (
      <button
        onClick={() => {
          onSave({ id: 'dashboard-id', name: 'Renamed', description: '' } as never);
        }}
        type="button"
      >
        save-metadata
      </button>
    ) : null,
}));
jest.mock('../ProjectWidgetOptions', () => ({ ProjectWidgetOptions: () => null }));
jest.mock('~feature-dashboards/dashboard-list/DashboardKebabMenu', () => ({
  DashboardKebabMenu: ({ items, isVisible }: { items: ReactNode; isVisible: boolean }) =>
    isVisible ? <div>{items}</div> : null,
  DashboardKebabMenuItems: ({
    onDelete,
    onDownloadSchema,
    onEditDashboard,
    onEditNameDescription,
  }: {
    onDelete: (controls: { close: () => void }) => void;
    onDownloadSchema?: () => void;
    onEditDashboard: () => void;
    onEditNameDescription: () => void;
  }) => (
    <div>
      {onDownloadSchema && (
        <button onClick={onDownloadSchema} type="button">
          download-schema
        </button>
      )}
      <button onClick={onEditDashboard} type="button">
        edit-dashboard-action
      </button>
      <button onClick={onEditNameDescription} type="button">
        edit-metadata
      </button>
      <button
        onClick={() => {
          onDelete({ close: jest.fn() });
        }}
        type="button"
      >
        delete-dashboard
      </button>
    </div>
  ),
}));
jest.mock('~feature-dashboards/dashboard-description/DashboardDescriptionAccordion', () => ({
  DashboardDescriptionAccordion: () => null,
}));
jest.mock('~feature-dashboards/dashboard-list/DashboardTypeBadge', () => ({
  DashboardTypeBadge: () => null,
}));
jest.mock('~shared/components/a11y/A11ySkipTarget', () => () => null);
jest.mock('~shared/components/intl/DateFromNow', () => ({
  __esModule: true,
  default: ({ children }: { children: (date: string) => ReactNode }) => <>{children('today')}</>,
}));
jest.mock(
  '~shared/components/NotFound',
  () =>
    function MockNotFound() {
      return <div>not-found</div>;
    },
);
jest.mock('~shared/components/pages/ProjectPageTemplate', () => ({
  ProjectPageTemplate: ({
    actions,
    children,
    description,
    title,
  }: {
    actions?: ReactNode;
    children: ReactNode;
    description?: ReactNode;
    title: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {description}
      {actions}
      {children}
    </div>
  ),
}));

const dashboard = {
  description: 'description',
  id: 'dashboard-id',
  layout: { children: [{ children: [], type: 'implicit' as const }] },
  name: 'Custom project dashboard',
  type: DashboardType.Custom,
  updatedAt: 1,
  updatedById: 'editor-id',
};

function setupQuery(overrides: Partial<typeof mockQuery> = {}) {
  mockQuery = { data: dashboard, isPending: false, refetch: mockRetry, ...overrides };
}

function renderProjectCustomDashboardPage(edition = EditionKey.enterprise) {
  return renderWithRouter(<ProjectCustomDashboardPage />, {
    appState: mockAppState({ edition }),
  });
}

describe('ProjectCustomDashboardPage', () => {
  beforeEach(() => {
    mockCurrentUser = {
      isLoggedIn: true,
      permissions: { global: [Permissions.Admin] },
    };
    mockDashboardId = '77acc15a-1742-42ff-9469-7e4de1faa19f';
    setupQuery();
    jest.clearAllMocks();
    mockUseUsersByIdsQuery.mockReturnValue({
      data: { 'editor-id': { avatar: 'avatar', name: 'Alice' } },
      isPending: false,
    });
  });

  it('renders the loading, not-found, invalid, and generic error states', async () => {
    setupQuery({ data: undefined, isPending: true });
    const { rerender } = renderProjectCustomDashboardPage();
    expect(screen.getByText('loading-dashboard')).toBeInTheDocument();

    setupQuery({ data: undefined, error: 'not-found', isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    expect(screen.getByText('dashboard-not-found')).toBeInTheDocument();

    setupQuery({ data: undefined, error: 'invalid-layout', isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    expect(screen.getByText('invalid-layout')).toBeInTheDocument();

    setupQuery({ data: undefined, error: new Error('failed'), isPending: false });
    rerender(<ProjectCustomDashboardPage />);
    await screen.findByRole('button', { name: 'generic-error' });
  });

  it('renders a dashboard and can enter and save edit mode', async () => {
    const { user } = renderProjectCustomDashboardPage();

    expect(screen.getByText('Custom project dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-content')).toHaveTextContent('editing:false');
    const editStatus = screen.getByText(
      (_content, element) =>
        element?.tagName === 'SPAN' &&
        element.textContent?.includes('project_dashboard.last_edited_by') === true &&
        element.textContent.includes('Alice'),
    );
    expect(editStatus).toHaveTextContent('project_dashboard.last_edited_by');
    expect(editStatus).toHaveTextContent('Alice');
    expect(mockUseUsersByIdsQuery).toHaveBeenCalledWith(['editor-id']);

    await user.click(screen.getByRole('button', { name: 'dashboard.edit_dashboard' }));
    expect(screen.getByTestId('dashboard-content')).toHaveTextContent('editing:true');

    await user.click(screen.getByRole('button', { name: 'save-changes' }));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ dashboardId: 'dashboard-id', projectId: 'project-id' }),
      expect.any(Object),
    );
  });

  it('allows only system administrators to download the dashboard schema', async () => {
    const { rerender, user } = renderProjectCustomDashboardPage();

    await user.click(screen.getByRole('button', { name: 'download-schema' }));
    expect(mockDownloadDashboardSchema).toHaveBeenCalledWith(dashboard);

    mockCurrentUser = { isLoggedIn: true, permissions: { global: [] } };
    rerender(<ProjectCustomDashboardPage />);

    expect(screen.queryByRole('button', { name: 'download-schema' })).not.toBeInTheDocument();
  });

  it('renders not found for an invalid dashboard id', () => {
    mockDashboardId = 'invalid-id';

    renderProjectCustomDashboardPage();

    expect(screen.getByText('not-found')).toBeInTheDocument();
  });

  it('handles dashboard editing, section creation, widget actions, and metadata editing', async () => {
    const { user } = renderProjectCustomDashboardPage();

    await user.click(screen.getByRole('button', { name: 'edit-metadata' }));
    await user.click(screen.getByRole('button', { name: 'save-metadata' }));

    await user.click(screen.getByRole('button', { name: 'dashboard.edit_dashboard' }));
    await user.click(screen.getByRole('button', { name: 'create-section' }));
    await user.click(screen.getByRole('button', { name: 'confirm-section' }));
    await user.click(screen.getByRole('button', { name: 'add-widget-toolbar' }));
    await user.click(screen.getByRole('button', { name: 'save-widget' }));
    await user.click(screen.getByRole('button', { name: 'add-widget-section' }));
    await user.click(screen.getByRole('button', { name: 'close-widget' }));
    expect(mockResetTargetSection).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'edit-widget-section' }));
    await user.click(screen.getByRole('button', { name: 'save-widget' }));
    await user.click(screen.getByRole('button', { name: 'exit-edit' }));

    await user.click(screen.getByRole('button', { name: 'delete-dashboard' }));
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ dashboardId: 'dashboard-id', projectId: 'project-id' }),
      expect.any(Object),
    );
  });

  it('does not expose authoring controls in Community Build', () => {
    renderProjectCustomDashboardPage(EditionKey.community);

    expect(screen.getByText('Custom project dashboard')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'dashboard.edit_dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'edit-metadata' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'delete-dashboard' })).not.toBeInTheDocument();
  });
});

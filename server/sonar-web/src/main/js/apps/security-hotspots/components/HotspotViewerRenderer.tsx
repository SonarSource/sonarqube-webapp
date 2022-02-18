/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
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
import { withCurrentUser } from '../../../components/hoc/withCurrentUser';
import DeferredSpinner from '../../../components/ui/DeferredSpinner';
import { fillBranchLike } from '../../../helpers/branch-like';
import { Hotspot, HotspotStatusOption } from '../../../types/security-hotspots';
import { Component, CurrentUser } from '../../../types/types';
import { HotspotHeader } from './HotspotHeader';
import HotspotReviewHistoryAndComments from './HotspotReviewHistoryAndComments';
import HotspotSnippetContainer from './HotspotSnippetContainer';
import './HotspotViewer.css';
import HotspotViewerTabs from './HotspotViewerTabs';
import StatusUpdateSuccessModal from './StatusUpdateSuccessModal';

export interface HotspotViewerRendererProps {
  component: Component;
  currentUser: CurrentUser;
  hotspot?: Hotspot;
  hotspotsReviewedMeasure?: string;
  lastStatusChangedTo?: HotspotStatusOption;
  loading: boolean;
  commentTextRef: React.RefObject<HTMLTextAreaElement>;
  onCloseStatusUpdateSuccessModal: () => void;
  onUpdateHotspot: (statusUpdate?: boolean, statusOption?: HotspotStatusOption) => Promise<void>;
  onShowCommentForm: () => void;
  onSwitchFilterToStatusOfUpdatedHotspot: () => void;
  showStatusUpdateSuccessModal: boolean;
}

export function HotspotViewerRenderer(props: HotspotViewerRendererProps) {
  const {
    component,
    currentUser,
    hotspot,
    hotspotsReviewedMeasure,
    loading,
    lastStatusChangedTo,
    showStatusUpdateSuccessModal,
    commentTextRef
  } = props;

  return (
    <DeferredSpinner className="big-spacer-left big-spacer-top" loading={loading}>
      {showStatusUpdateSuccessModal && (
        <StatusUpdateSuccessModal
          hotspotsReviewedMeasure={hotspotsReviewedMeasure}
          lastStatusChangedTo={lastStatusChangedTo}
          onClose={props.onCloseStatusUpdateSuccessModal}
          onSwitchFilterToStatusOfUpdatedHotspot={props.onSwitchFilterToStatusOfUpdatedHotspot}
        />
      )}

      {hotspot && (
        <div className="big-padded hotspot-content">
          <HotspotHeader hotspot={hotspot} onUpdateHotspot={props.onUpdateHotspot} />
          <HotspotViewerTabs
            codeTabContent={
              <HotspotSnippetContainer
                branchLike={fillBranchLike(hotspot.project.branch, hotspot.project.pullRequest)}
                component={component}
                hotspot={hotspot}
                onCommentButtonClick={props.onShowCommentForm}
              />
            }
            hotspot={hotspot}
          />
          <HotspotReviewHistoryAndComments
            commentTextRef={commentTextRef}
            currentUser={currentUser}
            hotspot={hotspot}
            onCommentUpdate={props.onUpdateHotspot}
          />
        </div>
      )}
    </DeferredSpinner>
  );
}

export default withCurrentUser(HotspotViewerRenderer);

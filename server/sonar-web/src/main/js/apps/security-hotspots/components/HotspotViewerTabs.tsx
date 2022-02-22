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
import key from 'keymaster';
import * as React from 'react';
import BoxedTabs from '../../../components/controls/BoxedTabs';
import { translate } from '../../../helpers/l10n';
import { sanitizeString } from '../../../helpers/sanitize';
import { Hotspot } from '../../../types/security-hotspots';

interface Props {
  codeTabContent: React.ReactNode;
  hotspot: Hotspot;
  selectedHotspotLocation?: number;
}

interface State {
  currentTab: Tab;
  tabs: Tab[];
}

interface Tab {
  key: TabKeys;
  label: React.ReactNode;
  content: string;
}

export enum TabKeys {
  Code = 'code',
  RiskDescription = 'risk',
  VulnerabilityDescription = 'vulnerability',
  FixRecommendation = 'fix'
}

const HOTSPOT_KEYMASTER_SCOPE = 'hotspots-list';

export default class HotspotViewerTabs extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const tabs = this.computeTabs();
    this.state = {
      currentTab: tabs[0],
      tabs
    };
  }

  componentDidMount() {
    this.registerKeyboardEvents();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.hotspot.key !== prevProps.hotspot.key) {
      const tabs = this.computeTabs();
      this.setState({
        currentTab: tabs[0],
        tabs
      });
    } else if (
      this.props.selectedHotspotLocation !== undefined &&
      this.props.selectedHotspotLocation !== prevProps.selectedHotspotLocation
    ) {
      const { tabs } = this.state;
      this.setState({
        currentTab: tabs[0]
      });
    }
  }

  componentWillUnmount() {
    this.unregisterKeyboardEvents();
  }

  registerKeyboardEvents() {
    key.setScope(HOTSPOT_KEYMASTER_SCOPE);
    key('left', HOTSPOT_KEYMASTER_SCOPE, () => {
      this.selectNeighboringTab(-1);
      return false;
    });
    key('right', HOTSPOT_KEYMASTER_SCOPE, () => {
      this.selectNeighboringTab(+1);
      return false;
    });
  }

  unregisterKeyboardEvents() {
    key.deleteScope(HOTSPOT_KEYMASTER_SCOPE);
  }

  handleSelectTabs = (tabKey: TabKeys) => {
    const { tabs } = this.state;
    const currentTab = tabs.find(tab => tab.key === tabKey)!;
    this.setState({ currentTab });
  };

  computeTabs() {
    const { hotspot } = this.props;

    const descriptionTabs = [
      {
        key: TabKeys.RiskDescription,
        label: translate('hotspots.tabs.risk_description'),
        content: hotspot.rule.riskDescription || ''
      },
      {
        key: TabKeys.VulnerabilityDescription,
        label: translate('hotspots.tabs.vulnerability_description'),
        content: hotspot.rule.vulnerabilityDescription || ''
      },
      {
        key: TabKeys.FixRecommendation,
        label: translate('hotspots.tabs.fix_recommendations'),
        content: hotspot.rule.fixRecommendations || ''
      }
    ].filter(tab => tab.content.length > 0);

    return [
      {
        key: TabKeys.Code,
        label: translate('hotspots.tabs.code'),
        content: ''
      },
      ...descriptionTabs
    ];
  }

  selectNeighboringTab(shift: number) {
    this.setState(({ tabs, currentTab }) => {
      const index = currentTab && tabs.findIndex(tab => tab.key === currentTab.key);

      if (index !== undefined && index > -1) {
        const newIndex = Math.max(0, Math.min(tabs.length - 1, index + shift));
        return {
          currentTab: tabs[newIndex]
        };
      }

      return { currentTab };
    });
  }

  render() {
    const { codeTabContent } = this.props;
    const { tabs, currentTab } = this.state;

    return (
      <>
        <BoxedTabs onSelect={this.handleSelectTabs} selected={currentTab.key} tabs={tabs} />
        <div className="bordered huge-spacer-bottom">
          {currentTab.key === TabKeys.Code ? (
            <div className="padded">{codeTabContent}</div>
          ) : (
            <div
              className="markdown big-padded"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitizeString(currentTab.content) }}
            />
          )}
        </div>
      </>
    );
  }
}

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

import { Divider, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import DateFormatter from '~shared/components/intl/DateFormatter';
import { Accordion, Link } from '../../design-system';
import { translate } from '../../helpers/l10n';
import { ProductName, SystemUpgrade } from '../../types/system';

interface Props {
  className?: string;
  upgrades: SystemUpgrade[];
}

interface State {
  showMore: boolean;
}

export default class SystemUpgradeIntermediate extends React.PureComponent<Props, State> {
  state: State = { showMore: false };

  toggleIntermediatVersions = () => {
    this.setState((state) => ({ showMore: !state.showMore }));
  };

  render() {
    const { showMore } = this.state;
    const { upgrades } = this.props;
    const displayable = upgrades.filter(
      (upgrade) => upgrade.releaseDate || upgrade.description || upgrade.changeLogUrl,
    );
    if (displayable.length <= 0) {
      return null;
    }

    return (
      <div className={this.props.className}>
        <Accordion
          header={
            showMore
              ? translate('system.hide_intermediate_versions')
              : translate('system.show_intermediate_versions')
          }
          onClick={this.toggleIntermediatVersions}
          open={showMore}
        >
          {displayable.map((upgrade, index) => (
            <Text className="sw-block sw-mb-4" isSubtle key={upgrade.version}>
              <p>
                <b className="sw-mr-1">
                  {ProductName.SonarQubeServer} {upgrade.version}
                </b>
                {upgrade.releaseDate && (
                  <DateFormatter date={upgrade.releaseDate} long>
                    {(formattedDate) => <>{formattedDate}</>}
                  </DateFormatter>
                )}
                {upgrade.changeLogUrl && (
                  <Link className="sw-ml-2" to={upgrade.changeLogUrl}>
                    {translate('system.release_notes')}
                  </Link>
                )}
              </p>
              {upgrade.description && <p className="sw-mt-2">{upgrade.description}</p>}

              {index !== displayable.length - 1 && <Divider />}
            </Text>
          ))}
        </Accordion>
      </div>
    );
  }
}

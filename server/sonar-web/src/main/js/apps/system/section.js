/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import React from 'react';
import ItemValue from './item-value';

export default React.createClass({
  render () {
    const items = this.props.items.map(item => {
      return (
          <tr key={item.name}>
            <td className="thin">
              <div style={{ width: '25vw', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
            </td>
            <td style={{ wordBreak: 'break-all' }}><ItemValue name={item.name} value={item.value}/></td>
          </tr>
      );
    });

    return (
        <div className="big-spacer-bottom">
          <h3 className="spacer-bottom">{this.props.section}</h3>
          <table className="data zebra" id={this.props.section}>
            <tbody>{items}</tbody>
          </table>
        </div>
    );
  }
});

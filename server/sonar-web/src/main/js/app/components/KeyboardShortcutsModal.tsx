/*
 * SonarQube
 * Copyright (C) 2009-2020 SonarSource SA
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
import { Button } from 'sonar-ui-common/components/controls/buttons';
import Modal from 'sonar-ui-common/components/controls/Modal';
import { translate } from 'sonar-ui-common/helpers/l10n';

const CATEGORIES = [
  {
    category: 'global',
    shortcuts: [
      { keys: ['s'], action: 'search' },
      { keys: ['?'], action: 'open_shortcuts' }
    ]
  },
  {
    category: 'code_page',
    shortcuts: [
      { keys: ['↑', '↓'], action: 'select_files' },
      { keys: ['→'], action: 'open_file' },
      { keys: ['←'], action: 'back' }
    ]
  },
  {
    category: 'issues_page',
    shortcuts: [
      { keys: ['↑', '↓'], action: 'navigate' },
      { keys: ['→'], action: 'source_code' },
      { keys: ['←'], action: 'back' },
      { keys: ['alt', '+', '↑', '↓'], action: 'navigate_locations' },
      { keys: ['alt', '+', '←', '→'], action: 'switch_flows' },
      { keys: ['f'], action: 'transition' },
      { keys: ['a'], action: 'assign' },
      { keys: ['m'], action: 'assign_to_me' },
      { keys: ['i'], action: 'severity' },
      { keys: ['c'], action: 'comment' },
      { keys: ['ctrl', '+', 'enter'], action: 'submit_comment' },
      { keys: ['t'], action: 'tags' }
    ]
  },
  {
    category: 'measures_page',
    shortcuts: [
      { keys: ['↑', '↓'], action: 'select_files' },
      { keys: ['→'], action: 'open_file' },
      { keys: ['←'], action: 'back' }
    ]
  },
  {
    category: 'rules_page',
    shortcuts: [
      { keys: ['↑', '↓'], action: 'navigate' },
      { keys: ['→'], action: 'rule_details' },
      { keys: ['←'], action: 'back' }
    ]
  }
];

export default function KeyboardShortcutsModal() {
  const [display, setDisplay] = React.useState(false);

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { tagName } = event.target as HTMLElement;

      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
        return; // Ignore keys when typed in an input
      }

      if (event.key === '?') {
        setDisplay(d => !d);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [setDisplay]);

  if (!display) {
    return null;
  }

  const title = translate('keyboard_shortcuts.title');

  return (
    <Modal contentLabel={title} onRequestClose={() => setDisplay(false)} size="medium">
      <div className="modal-head">
        <h2>{title}</h2>
      </div>

      <div className="modal-body modal-container markdown display-flex-wrap display-flex-space-between">
        {CATEGORIES.map(({ category, shortcuts }) => (
          <div key={category} className="spacer-right">
            <h3>{translate('keyboard_shortcuts', category, 'title')}</h3>
            <table>
              <thead>
                <tr>
                  <th>{translate('keyboard_shortcuts.shortcut')}</th>
                  <th>{translate('keyboard_shortcuts.action')}</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map(({ action, keys }) => (
                  <tr key={action}>
                    <td>
                      {keys.map(k =>
                        k === '+' ? (
                          <span key={k} className="little-spacer-right">
                            {k}
                          </span>
                        ) : (
                          <code key={k} className="little-spacer-right">
                            {k}
                          </code>
                        )
                      )}
                    </td>
                    <td>{translate('keyboard_shortcuts', category, action)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="modal-foot">
        <Button onClick={() => setDisplay(false)}>{translate('close')}</Button>
      </div>
    </Modal>
  );
}

/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Button, ButtonVariety, Select } from '@sonarsource/echoes-react';
import { difference } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from '~design-system';
import withLanguages, {
  WithLanguagesProps,
} from '~sq-server-commons/context/languages/withLanguages';
import { translate } from '~sq-server-commons/helpers/l10n';
import { LabelValueSelectOption } from '~sq-server-commons/helpers/search';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ProfileSelect from './ProfileSelect';

export interface AddLanguageModalProps extends WithLanguagesProps {
  onClose: () => void;
  onSubmit: (key: string) => Promise<void>;
  profilesByLanguage: Record<string, BaseProfile[]>;
  unavailableLanguages: string[];
}

export function AddLanguageModal(props: AddLanguageModalProps) {
  const { languagesWithRules: languages, profilesByLanguage, unavailableLanguages } = props;

  const [{ language, key }, setSelected] = React.useState<{ key?: string; language?: string }>({
    language: undefined,
    key: undefined,
  });

  const header = translate('project_quality_profile.add_language_modal.title');

  const languageOptions: LabelValueSelectOption[] = difference(
    Object.keys(profilesByLanguage).filter((lang) => languages[lang]),
    unavailableLanguages,
  ).map((l) => ({ value: l, label: languages[l].name }));

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (language && key) {
      props.onSubmit(key);
    }
  };

  const renderForm = (
    <form id="add-language-quality-profile" onSubmit={onFormSubmit}>
      <Select
        className="sw-mb-4"
        data={languageOptions}
        label={<FormattedMessage id="project_quality_profile.add_language_modal.choose_language" />}
        onChange={(value: string) => {
          setSelected({ language: value, key: undefined });
        }}
        value={language}
        width="full"
      />

      <ProfileSelect
        className="sw-mb-4"
        id="profiles"
        isDisabled={!language}
        label={<FormattedMessage id="project_quality_profile.add_language_modal.choose_profile" />}
        onChange={(value: string) => {
          setSelected({ language, key: value });
        }}
        profiles={language ? profilesByLanguage[language] : []}
        value={key}
        width="full"
      />
    </form>
  );

  return (
    <Modal
      body={renderForm}
      headerTitle={header}
      isOverflowVisible
      onClose={props.onClose}
      primaryButton={
        <Button
          form="add-language-quality-profile"
          isDisabled={!language || !key}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="save" />
        </Button>
      }
      secondaryButtonLabel={<FormattedMessage id="cancel" />}
    />
  );
}

export default withLanguages(AddLanguageModal);

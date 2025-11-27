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

import { SearchInputWidth, Select } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from '~shared/components/hoc/withRouter';
import { PROFILE_PATH } from '~sq-server-commons/constants/paths';
import { getProfilesForLanguagePath } from '~sq-server-commons/utils/quality-profiles-utils';

const MIN_LANGUAGES = 2;

interface Props {
  currentFilter?: string;
  languages: Array<{ key: string; name: string }>;
}

export default function LanguageSelect(props: Readonly<Props>) {
  const { currentFilter, languages } = props;
  const intl = useIntl();
  const router = useRouter();

  const options = useMemo(() => {
    return languages.map((language) => ({
      label: language.name,
      value: language.key,
    }));
  }, [languages]);

  if (languages.length < MIN_LANGUAGES) {
    return null;
  }

  return (
    <div className="sw-mb-4">
      <Select
        ariaLabel={intl.formatMessage({ id: 'quality_profiles.filter_by_lang' })}
        className="sw-py-1"
        data={options}
        isSearchable
        label={intl.formatMessage({ id: 'quality_profiles.filter_by' })}
        labelNotFound={intl.formatMessage({ id: 'quality_profiles.no_lang_found' })}
        onChange={(value: string) => {
          router.replace(value ? getProfilesForLanguagePath(value) : PROFILE_PATH);
        }}
        placeholder={intl.formatMessage({ id: 'quality_profiles.select_lang' })}
        value={options.find((o) => o.value === currentFilter)?.value}
        width={SearchInputWidth.Medium}
      />
    </div>
  );
}

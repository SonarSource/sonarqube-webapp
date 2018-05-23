/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as ReactRedux from 'react-redux';
import * as ReactRouter from 'react-router';
import throwGlobalError from './throwGlobalError';
import addGlobalSuccessMessage from './addGlobalSuccessMessage';
import * as measures from '../../helpers/measures';
import * as request from '../../helpers/request';
import DateFromNow from '../../components/intl/DateFromNow';
import DateFormatter from '../../components/intl/DateFormatter';
import DateTimeFormatter from '../../components/intl/DateTimeFormatter';
import FavoriteContainer from '../../components/controls/FavoriteContainer';
import LicenseEditionSet from '../../apps/marketplace/components/LicenseEditionSet';
import HomePageSelect from '../../components/controls/HomePageSelect';
import ListFooter from '../../components/controls/ListFooter';
import Modal from '../../components/controls/Modal';
import HelpTooltip from '../../components/controls/HelpTooltip';
import SearchBox from '../../components/controls/SearchBox';
import Select from '../../components/controls/Select';
import Tooltip from '../../components/controls/Tooltip';
import SelectList from '../../components/SelectList/SelectList';
import CoverageRating from '../../components/ui/CoverageRating';
import DuplicationsRating from '../../components/ui/DuplicationsRating';
import Level from '../../components/ui/Level';
import { EditButton, Button, SubmitButton, ResetButtonLink } from '../../components/ui/buttons';
import DeferredSpinner from '../../components/common/DeferredSpinner';
import ReloadButton from '../../components/controls/ReloadButton';
import QualifierIcon from '../../components/icons-components/QualifierIcon';
import AlertErrorIcon from '../../components/icons-components/AlertErrorIcon';
import AlertSuccessIcon from '../../components/icons-components/AlertSuccessIcon';
import AlertWarnIcon from '../../components/icons-components/AlertWarnIcon';
import LockIcon from '../../components/icons-components/LockIcon';
import DropdownIcon from '../../components/icons-components/DropdownIcon';

const exposeLibraries = () => {
  const global = window as any;

  global.ReactRedux = ReactRedux;
  global.ReactRouter = ReactRouter;
  global.SonarMeasures = measures;
  global.SonarRequest = { ...request, throwGlobalError, addGlobalSuccessMessage };
  global.SonarComponents = {
    AlertErrorIcon,
    AlertSuccessIcon,
    AlertWarnIcon,
    Button,
    CoverageRating,
    DateFormatter,
    DateFromNow,
    DateTimeFormatter,
    DeferredSpinner,
    DropdownIcon,
    DuplicationsRating,
    EditButton,
    FavoriteContainer,
    HelpTooltip,
    HomePageSelect,
    Level,
    LicenseEditionSet,
    ListFooter,
    LockIcon,
    Modal,
    QualifierIcon,
    ReloadButton,
    ResetButtonLink,
    SearchBox,
    Select,
    SelectList,
    SubmitButton,
    Tooltip
  };
};

export default exposeLibraries;

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
import * as React from 'react';
import * as classNames from 'classnames';
import * as theme from '../../app/theme';
import { Omit } from '../../app/types';
import ClearIcon from '../icons-components/ClearIcon';
import EditIcon from '../icons-components/EditIcon';
import Tooltip from '../controls/Tooltip';
import './buttons.css';

interface ButtonProps {
  autoFocus?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  innerRef?: (node: HTMLElement | null) => void;
  name?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  style?: React.CSSProperties;
  type?: string;
}

export class Button extends React.PureComponent<ButtonProps> {
  handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { onClick, preventDefault = true, stopPropagation = false } = this.props;

    event.currentTarget.blur();
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    if (onClick) onClick(event);
  };

  render() {
    const {
      className,
      innerRef,
      onClick,
      preventDefault,
      stopPropagation,
      type = 'button',
      ...props
    } = this.props;
    return (
      // eslint-disable-next-line react/button-has-type
      <button
        {...props}
        className={classNames('button', className)}
        disabled={this.props.disabled}
        id={this.props.id}
        onClick={this.handleClick}
        ref={this.props.innerRef}
        type={type}
      />
    );
  }
}

export function SubmitButton(props: Omit<ButtonProps, 'type'>) {
  // do not prevent default to actually submit a form
  return <Button {...props} preventDefault={false} type="submit" />;
}

export function ResetButtonLink({ className, ...props }: Omit<ButtonProps, 'type'>) {
  return <Button {...props} className={classNames('button-link', className)} type="reset" />;
}

interface ButtonIconProps {
  className?: string;
  color?: string;
  onClick?: () => void;
  tooltip?: string;
  [x: string]: any;
}

export function ButtonIcon(props: ButtonIconProps) {
  const { className, color = theme.darkBlue, tooltip, ...other } = props;
  const buttonComponent = (
    <Button
      className={classNames(className, 'button-icon')}
      stopPropagation={true}
      style={{ color }}
      {...other}
    />
  );
  if (tooltip) {
    return (
      <Tooltip mouseEnterDelay={0.4} overlay={tooltip}>
        {buttonComponent}
      </Tooltip>
    );
  }
  return buttonComponent;
}

interface ActionButtonProps {
  className?: string;
  onClick?: () => void;
  [x: string]: any;
}

export function DeleteButton(props: ActionButtonProps) {
  return (
    <ButtonIcon color={theme.red} {...props}>
      <ClearIcon />
    </ButtonIcon>
  );
}

export function EditButton(props: ActionButtonProps) {
  return (
    <ButtonIcon {...props}>
      <EditIcon />
    </ButtonIcon>
  );
}

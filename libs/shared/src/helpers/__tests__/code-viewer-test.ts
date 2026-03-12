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

import { LinesOfCodeEllipsesDirection } from '../../types/code-viewer';
import { getLinesExpandRange } from '../code-viewer';

describe('getLinesExpandRange', () => {
  describe('direction: up', () => {
    it('should return the correct range when expanding up from the middle', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Up,
        start: 50,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 40, to: 49 });
    });

    it('should not go below line 1 when expanding up', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Up,
        start: 5,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 1, to: 4 });
    });

    it('should handle expanding from line 1', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Up,
        start: 1,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 1, to: 0 });
    });

    it('should expand by maxExpand lines when there is enough space', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Up,
        start: 100,
        maxExpand: 50,
        totalLines: 200,
      });

      expect(result).toEqual({ from: 50, to: 99 });
    });
  });

  describe('direction: down', () => {
    it('should return the correct range when expanding down from the middle', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Down,
        start: 50,
        end: 60,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 61, to: 70 });
    });

    it('should not exceed totalLines when expanding down', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Down,
        start: 90,
        end: 95,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 96, to: 100 });
    });

    it('should handle expanding to the end of file', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Down,
        start: 95,
        end: 100,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 101, to: 100 });
    });

    it('should expand by maxExpand lines when there is enough space', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Down,
        start: 50,
        end: 60,
        maxExpand: 50,
        totalLines: 200,
      });

      expect(result).toEqual({ from: 61, to: 110 });
    });

    it('should return undefined when end is not provided', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Down,
        start: 50,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('direction: middle', () => {
    it('should return the range between start and end', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Middle,
        start: 40,
        end: 60,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 40, to: 60 });
    });

    it('should ignore maxExpand parameter for middle direction', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Middle,
        start: 10,
        end: 90,
        maxExpand: 5,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 10, to: 90 });
    });

    it('should return undefined when end is not provided', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Middle,
        start: 50,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toBeUndefined();
    });

    it('should handle start and end being the same line', () => {
      const result = getLinesExpandRange({
        direction: LinesOfCodeEllipsesDirection.Middle,
        start: 50,
        end: 50,
        maxExpand: 10,
        totalLines: 100,
      });

      expect(result).toEqual({ from: 50, to: 50 });
    });
  });
});

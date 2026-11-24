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

import { renderHook } from '@testing-library/react';
import {
  initializeFeatureFlagTestUtils,
  mockFlags,
  removeFlags,
  resetFeatureFlagMocks,
} from '~adapters/helpers/feature-flags-test-utils';
import { useFlags } from '../feature-flags';

const useDefaultFlags = useFlags;

beforeEach(() => {
  initializeFeatureFlagTestUtils();
});

afterEach(() => {
  resetFeatureFlagMocks();
});

describe('useFlags', () => {
  it('should expose the default SQS flag values', () => {
    const { result } = renderHook(() => useFlags());

    expect(result.current).toMatchObject({
      designArchitectureSquadExtensionPack: true,
      scaKeyChangesPrView: false,
      scaShowRiskCopyAiPromptButton: false,
    });
  });
});

describe('feature-flag test helpers', () => {
  it.each([true, false, 0, 42, '', 'enabled', { enabled: true }, ['enabled']])(
    'supports the flag value %p',
    (value) => {
      mockFlags({ customFlag: value });

      const { result } = renderHook(() => useFlags());

      expect(result.current.customFlag).toEqual(value);
      expect(result.current.designArchitectureSquadExtensionPack).toBe(true);
    },
  );

  it.each([
    'sca-show-risk-copy-ai-prompt-button',
    'scaShowRiskCopyAiPromptButton',
    'sca_show_risk_copy_ai_prompt_button',
  ])('normalizes the flag key %s', (key) => {
    mockFlags({ [key]: true });

    const { result } = renderHook(() => useFlags());

    expect(result.current.scaShowRiskCopyAiPromptButton).toBe(true);
    expect(result.current['sca-show-risk-copy-ai-prompt-button']).toBe(true);
    expect(result.current.sca_show_risk_copy_ai_prompt_button).toBe(true);
  });

  it('uses overrides without changing the production defaults', () => {
    mockFlags({ designArchitectureSquadExtensionPack: false });

    const { result } = renderHook(() => useFlags());

    expect(result.current.designArchitectureSquadExtensionPack).toBe(false);
    expect(useDefaultFlags().designArchitectureSquadExtensionPack).toBe(true);
  });

  it('replaces earlier overrides when mocking another flag set', () => {
    mockFlags({ initialFlag: true });

    const { result, rerender } = renderHook(() => useFlags());

    mockFlags({ replacementFlag: 'enabled' });
    rerender();

    expect(result.current).not.toHaveProperty('initialFlag');
    expect(result.current.replacementFlag).toBe('enabled');
  });

  it('removes all aliases of a flag and restores its default', () => {
    mockFlags({ scaShowRiskCopyAiPromptButton: true, customFlag: 'enabled' });

    const { result, rerender } = renderHook(() => useFlags());

    removeFlags('sca_show_risk_copy_ai_prompt_button');
    rerender();

    expect(result.current.scaShowRiskCopyAiPromptButton).toBe(false);
    expect(result.current).not.toHaveProperty('sca-show-risk-copy-ai-prompt-button');
    expect(result.current).not.toHaveProperty('sca_show_risk_copy_ai_prompt_button');
    expect(result.current.customFlag).toBe('enabled');
  });

  it('removes flags that have no production default', () => {
    mockFlags({ customFlag: 'enabled' });

    const { result, rerender } = renderHook(() => useFlags());

    removeFlags('custom-flag');
    rerender();

    expect(result.current).not.toHaveProperty('customFlag');
  });

  it.each([initializeFeatureFlagTestUtils, resetFeatureFlagMocks])(
    'restores the real adapter when calling %p',
    (reset) => {
      mockFlags({ scaShowRiskCopyAiPromptButton: true, customFlag: 'enabled' });

      const { result, rerender } = renderHook(() => useFlags());

      reset();
      rerender();

      expect(useFlags).toBe(useDefaultFlags);
      expect(result.current.scaShowRiskCopyAiPromptButton).toBe(false);
      expect(result.current).not.toHaveProperty('customFlag');
    },
  );

  it.each([null, undefined, () => true, Symbol('flag'), 1n])(
    'rejects the unsupported flag value %p',
    (value) => {
      expect(() => {
        mockFlags({ customFlag: value } as Parameters<typeof mockFlags>[0]);
      }).toThrow(TypeError);
    },
  );
});

/*
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

// In 2.84.0 the documented loader's declaration uses export *, omitting its default export.
// Reuse the SDK's public types instead of maintaining a separate API declaration.
declare module 'mixpanel-browser/src/loaders/loader-module-with-async-modules' {
  export * from 'mixpanel-browser';
  export { default } from 'mixpanel-browser';
}

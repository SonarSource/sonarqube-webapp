/*
 * Copyright (C) 2009-2025 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */

import axios, { AxiosResponse } from 'axios';

// Before all tests setup axios interceptors
beforeAll(() => {
  // According to our implementation of axios
  axios.interceptors.response.use((response: AxiosResponse) => {
    return response.data;
  });
});

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

import { AxiosResponse } from 'axios';
import { isNil, omitBy } from 'lodash';
import { HttpStatus } from '~shared/types/request';
import { getCookie } from './cookies';
import handleRequiredAuthentication from './handleRequiredAuthentication';
import { translate } from './l10n';
import { stringify } from './stringify-queryparams';
import { getBaseUrl } from './system';

export function getCSRFTokenName(): string {
  return 'X-XSRF-TOKEN';
}

export function getCSRFTokenValue(): string {
  const cookieName = 'XSRF-TOKEN';
  const cookieValue = getCookie(cookieName);
  if (!cookieValue) {
    return '';
  }
  return cookieValue;
}

/**
 * Return an object containing a special http request header used to prevent CSRF attacks.
 */
export function getCSRFToken(): Record<string, string> {
  // Fetch API in Edge doesn't work with empty header,
  // so we ensure non-empty value
  const value = getCSRFTokenValue();
  return value ? { [getCSRFTokenName()]: value } : {};
}

export type RequestData = Record<string, any>;

export function omitNil(obj: RequestData): RequestData {
  return omitBy(obj, isNil);
}

/**
 * Default options for any request
 */
const DEFAULT_OPTIONS: {
  credentials: RequestCredentials;
  method: string;
} = {
  credentials: 'same-origin',
  method: 'GET',
};

/**
 * Default request headers
 */
const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

const CONTENT_TYPE = 'Content-Type';

/**
 * Request
 */
class Request {
  private data?: RequestData;
  private isJSON = false;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly url: string,
    private readonly options: { method?: string } = {},
  ) {}

  getSubmitData(customHeaders: { [CONTENT_TYPE]?: string } = {}): {
    options: RequestInit;
    url: string;
  } {
    let { url } = this;
    const options: RequestInit = { ...DEFAULT_OPTIONS, ...this.options };

    if (this.data) {
      if (this.data instanceof FormData) {
        options.body = this.data;
      } else if (this.isJSON) {
        customHeaders[CONTENT_TYPE] = 'application/json';
        options.body = JSON.stringify(this.data);
      } else {
        const strData = stringify(omitNil(this.data));
        if (options.method === 'GET') {
          url += '?' + strData;
        } else {
          customHeaders[CONTENT_TYPE] = 'application/x-www-form-urlencoded';
          options.body = strData;
        }
      }
    }

    options.headers = {
      ...DEFAULT_HEADERS,
      ...customHeaders,
    };
    return { url, options };
  }

  submit(): Promise<Response> {
    const { url, options } = this.getSubmitData({ ...getCSRFToken() });
    return window.fetch(getBaseUrl() + url, options);
  }

  setMethod(method: string): this {
    this.options.method = method;
    return this;
  }

  setData(data?: RequestData, isJSON = false): this {
    if (data) {
      this.data = data;
      this.isJSON = isJSON;
    }
    return this;
  }
}

/**
 * Make a request
 */
export function request(url: string): Request {
  return new Request(url);
}

/**
 * Make a cors request
 */
export function corsRequest(url: string, mode: RequestMode = 'cors'): Request {
  const options: RequestInit = { mode };
  const request = new Request(url, options);
  request.submit = function () {
    const { url, options } = this.getSubmitData();
    return window.fetch(url, options);
  };
  return request;
}

/**
 * Check that response status is ok
 */
export function checkStatus(response: Response, bypassRedirect = false): Promise<Response> {
  return new Promise((resolve, reject) => {
    if (response.status === HttpStatus.Unauthorized && !bypassRedirect) {
      handleRequiredAuthentication();
      reject(response);
    } else if (isSuccessStatus(response.status)) {
      resolve(response);
    } else {
      reject(response);
    }
  });
}

/**
 * Parse response as JSON
 */
export async function parseJSON(response: Response): Promise<unknown> {
  try {
    const json = (await response.json()) as unknown;

    return json;
  } catch (error) {
    return {};
  }
}

/**
 * Parse response as Text
 */
export function parseText(response: Response): Promise<string> {
  return response.text();
}

/**
 * Parse error response of failed request
 */
export function parseError(response: Response): Promise<string> {
  const DEFAULT_MESSAGE = translate('default_error_message');
  return parseJSON(response)
    .then(parseErrorResponse)
    .catch(() => DEFAULT_MESSAGE);
}

export function parseErrorResponse(response?: AxiosResponse | Response): string {
  const DEFAULT_MESSAGE = translate('default_error_message');
  let data;
  if (!response) {
    return DEFAULT_MESSAGE;
  }
  if ('data' in response) {
    ({ data } = response);
  } else {
    data = response;
  }
  const { message, errors } = data;
  return (
    message ?? errors?.map((error: { msg: string }) => error.msg).join('. ') ?? DEFAULT_MESSAGE
  );
}

/**
 * Shortcut to do a GET request and return a Response
 */
export function get(url: string, data?: RequestData, bypassRedirect = false): Promise<Response> {
  return request(url)
    .setData(data)
    .submit()
    .then((response) => checkStatus(response, bypassRedirect));
}

/**
 * Shortcut to do a GET request and return response text
 */
export function getText(url: string, data?: RequestData, bypassRedirect = false): Promise<string> {
  return get(url, data, bypassRedirect).then(parseText);
}

/**
 * Shortcut to do a CORS GET request and return response json
 */
export function getCorsJSON(url: string, data?: RequestData): Promise<any> {
  return corsRequest(url)
    .setData(data)
    .submit()
    .then((response) => {
      if (isSuccessStatus(response.status)) {
        return parseJSON(response);
      }
      return Promise.reject(response);
    });
}

/**
 * Shortcut to do a POST request and return response json
 */
export function postJSON(url: string, data?: RequestData, bypassRedirect = false): Promise<any> {
  return request(url)
    .setMethod('POST')
    .setData(data)
    .submit()
    .then((response) => checkStatus(response, bypassRedirect))
    .then(parseJSON);
}

/**
 * Shortcut to do a POST request with a json body and return response json
 */
export function postJSONBody(
  url: string,
  data?: RequestData,
  bypassRedirect = false,
): Promise<any> {
  return request(url)
    .setMethod('POST')
    .setData(data, true)
    .submit()
    .then((response) => checkStatus(response, bypassRedirect))
    .then(parseJSON);
}

/**
 * Shortcut to do a POST request
 */
export function post(url: string, data?: RequestData, bypassRedirect = false): Promise<void> {
  return new Promise((resolve, reject) => {
    request(url)
      .setMethod('POST')
      .setData(data)
      .submit()
      .then((response) => checkStatus(response, bypassRedirect))
      .then(() => {
        resolve();
      }, reject);
  });
}

/**
 * Shortcut to do a DELETE request
 */
export function deleteJSON(url: string, data?: RequestData): Promise<Response> {
  return request(url)
    .setMethod('DELETE')
    .setData(data)
    .submit()
    .then((response) => checkStatus(response));
}

export function isSuccessStatus(status: number) {
  return status >= 200 && status < 300;
}

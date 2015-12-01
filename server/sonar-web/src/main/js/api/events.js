import { getJSON } from '../helpers/request.js';


/**
 * Return events for a component
 * @param {string} componentKey
 * @param {string} [categories]
 * @returns {Promise}
 */
export function getEvents (componentKey, categories) {
  let url = baseUrl + '/api/events';
  let data = { resource: componentKey };
  if (categories) {
    data.categories = categories;
  }
  return getJSON(url, data);
}

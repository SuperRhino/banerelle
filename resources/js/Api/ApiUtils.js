import Utils from '../Utils/Utils';
import {Config} from '../Utils/Constants';

const DEFAULT_ERROR = 'There was a problem with your request';

export default class ApiUtils {

  static handleError(err) {
    console.warn(err);
    Utils.showError(err.message || DEFAULT_ERROR);
  }

  static handleNetworkError(err) {
    console.warn(err);
    // show offline mode
  }

  /**
   * @param endpoint
   * @returns {string}
   */
  static buildUrl(endpoint) {
      endpoint = Utils.trimChar(endpoint, '/');

      if (endpoint.indexOf(Config.api_root) === -1) {
          endpoint = Config.api_root + endpoint;
      }

      return endpoint;
  }

}
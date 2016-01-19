import ApiRequest from './ApiRequest';
import {Config} from '../Utils/Constants';

/**
 * Application-wide access_token storage/retrieval
 */
export default class AccessToken {
  /**
   * Get the AccessToken and locally cache it to avoid uneccessary fetches.
   * @returns Promise
   */
  static get(verify) {
    if (typeof verify === 'undefined') {
      verify = false;
    }

    return new Promise((resolve, reject) => {
      if (AccessToken._accessToken) {
        return resolve(AccessToken._accessToken);
      }

      let access_token = localStorage.getItem(Config.Storage.ACCESS_TOKEN);

      if (access_token === null) {
        AccessToken.clear();
        return reject(new Error({code: 403, message: 'Unauthorized'}));
      }

      // if (verify) {
      //   ApiRequest.post('/session/verify')
      //     .setHandleErrors(false)
      //     .setIgnoreNetworkError(true)
      //     .send(() => {
      //       AccessToken.set(access_token, true).then(resolve);
      //     }, (err) => {
      //       console.log('Token Verification Error: ', err);
      //       AccessToken.clear();
      //       reject(err);
      //     });
      // }

      AccessToken.set(access_token, true).then(resolve);
    });
  }

  /**
   * Set the access_token in the local cache, and (by default) in localStorage.
   * @param access_token
   * @param dontUpdateStorage
   */
  static set(access_token, dontUpdateStorage) {
    AccessToken._accessToken = access_token;

    return new Promise((resolve, reject) => {
      if (! dontUpdateStorage) {
        localStorage.setItem(Config.Storage.ACCESS_TOKEN, access_token);
      }

      resolve(access_token);
    })
  }

  /**
   * Clears the access_token from local cache and localStorage
   * @returns {*}
   */
  static clear() {
    AccessToken._accessToken = null;
    return localStorage.removeItem(Config.Storage.ACCESS_TOKEN);
  }
}
import Utils from '../Utils/Utils';
import Actions from '../Utils/Actions';
import ApiUtils from './ApiUtils';
import AccessToken from './AccessToken';
import Request from 'superagent';

export default class ApiRequest {

  static activeRequests = 0;

  static updateNetworkIndicator(dir = '-') {
    if (dir === '+') {
      ApiRequest.activeRequests++;
    } else {
      ApiRequest.activeRequests--;
    }

    if (ApiRequest.activeRequests <= 0) {
      ApiRequest.activeRequests = 0;
      // hide network activity indicator
    } else {
      // show network activity indicator
    }
  }

  /**
   * Create an API Request Object
   * @param method {string} get|post|put|del|head|options (optional, default: get)
   * @param endpoint {string}
   */
  static create(method, endpoint) {
    return new this(method, endpoint);
  }

  static createAnon(method, endpoint) {
    var request = new this(method, endpoint);
    request.setAnonymous(true);

    return request;
  }

  static get(endpoint) {
    return new this('get', endpoint);
  }

  static post(endpoint) {
    return new this('post', endpoint);
  }

  static put(endpoint) {
    return new this('put', endpoint);
  }

  static delete(endpoint) {
    return new this('delete', endpoint);
  }

  constructor(method, endpoint) {
    if (endpoint === undefined) {
      endpoint = method;
      method = 'get';
    } else {
      method = method.toLowerCase();
    }

    if (endpoint.indexOf('?') !== -1) {
      throw new Error('You must set query string data via the `query` function');
    }

    this.isAnonymous = false;
    this.handleErrors = true;
    this.ignoreNetworkError = false;
    this.url = ApiUtils.buildUrl(endpoint);
    this._setupRequest(method);
  }

  setAnonymous(isAnonymous) {
    this.isAnonymous = isAnonymous;

    return this;
  }

  setHandleErrors(handleErrors) {
    this.handleErrors = handleErrors;

    return this;
  }

  setIgnoreNetworkError(ignoreNetworkError) {
    this.ignoreNetworkError = ignoreNetworkError;

    return this;
  }

  configure(callback) {
    callback(this.request);

    return this;
  }

  send(callback, errCallback) {
    if (this.isAnonymous) {
      return this._sendIt(callback, errCallback);
    }

    // Send with proper authentication:
    AccessToken.get()
      .then(token => {
        this.query({token});
        this._sendIt(callback, errCallback);
      })
      // .catch(() => Actions.logout());
  }

  /****************************
   * Helper/Wrapper Functions *
   ****************************/

  data(data) {
    this.requestBody = JSON.stringify(data);

    return this;
  }

  query(data) {
    this.queryData = Object.assign(this.queryData, data);

    return this;
  }

  header(header, value) {
    this.requestHeaders[header] = value;

    return this;
  }

  headers(headers) {
    this.requestHeaders = Object.assign(this.requestHeaders, headers)

    return this;
  }

  _setupRequest(method) {
    this.requestMethod = (! method) ? 'get' : method;
    this.requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    this.queryData = {};
    this.requestBody = {};
    this.request = null;
  }

  _sendIt(callback, errCallback) {
    ApiRequest.updateNetworkIndicator('+');

    this.request = Request[this.requestMethod](this.url);

    if (! Utils.isEmpty(this.queryData)) {
      this.request.query(this.queryData);
    }

    if (! Utils.isEmpty(this.requestHeaders)) {
      this.request.set(this.requestHeaders);
    }

    this.request
      .send(this.requestBody)
      //.withCredentials()
      .end((err, res) => {
        ApiRequest.updateNetworkIndicator();
        if (res.ok) {
          // I know when that hot line bling:
          callback(res.body);
        } else if (res.unauthorized) {
          // Unauthorized request:
          AccessToken.clear();
          Actions.noauth();
        } else {
          // Network response was not OK:
          if (this.handleErrors) {
            ApiUtils.handleError(res.body.error);
          }
          // Call the error callback so views can respond:
          if (errCallback) errCallback(res.body.error);
        }
      });
  }
}
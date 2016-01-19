import Reflux from 'reflux';

import Actions from '../Utils/Actions';
import {Config} from '../Utils/Constants';
import ApiRequest from '../Api/ApiRequest';
import ApiUtils from '../Api/ApiUtils';
import AccessToken from '../Api/AccessToken';

const defaultUser = {
  id: null,
  username: null,
  session_id: null,
};

// copy defaultUser to currentUser
let currentUser = Object.assign({}, defaultUser);

export default Reflux.createStore({
  // this will set up listeners to all publishers in Actions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],

  // Initial setup
  init() {
    // no op
  },

  get() {
    return currentUser;
  },

  update(userUpdates) {
    currentUser = Object.assign({}, userUpdates);
    this.trigger(currentUser);
  },

  // User Login:
  // -------------------------------
  onLogin(creds) {
    ApiRequest.post('/account/login')
      .data(creds)
      .setAnonymous(true)
      .send(res => {
        AccessToken.set(res.data.session_id)
          .then(() => Actions.login.completed(res));
      }, Actions.login.failed);
  },
  onLoginCompleted(response) {
    let user = response.data;
    this.update(user);
  },

  // User Logout:
  // -------------------------------
  onLogout() {
    ApiRequest.post('/account/logout')
      .setHandleErrors(false)
      .setIgnoreNetworkError(true)
      .send(Actions.logout.completed, Actions.logout.failed);

    // reset currentUser to default
    this.update(defaultUser);
  },
  onLogoutCompleted() {
    AccessToken.clear();
  },
  onLogoutFailed() {
    AccessToken.clear();
  },

  // Load User:
  // -------------------------------
  onLoadUser() {
    ApiRequest.get('/account')
      .send(Actions.loadUser.completed, Actions.loadUser.failed);
  },
  onLoadUserCompleted(response) {
    this.update(response.data);
  },
});
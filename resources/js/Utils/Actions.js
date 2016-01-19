import Reflux from 'reflux';
import AccessToken from '../Api/AccessToken';
import ApiRequest from '../Api/ApiRequest';

// Each action is like an event channel for one specific event. Actions are called by components.
// The store is listening to all actions, and the components in turn are listening to the store.
// Thus the flow is: User interaction -> component calls action -> store reacts and triggers -> components update

var Actions = Reflux.createActions([
  // user actions
  "auth",
  "unauth",
  "noauth",
  {"login": {asyncResult: true}},
  {"logout": {asyncResult: true}},
  {"loadUser": {asyncResult: true}},
]);

/* User Actions
 =============================== */

Actions.auth.listen(() => {
  AccessToken.get(true)
    .then(accessToken => Actions.loadUser(accessToken))
    .catch(() => Actions.noauth());
});

export default Actions;
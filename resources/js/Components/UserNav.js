import React from 'react';
import Actions from '../Utils/Actions';
import CurrentUser from '../Stores/CurrentUser';
import LoginForm from './LoginForm';

export default class UserNav extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      user: {},
    };
  }

  componentWillMount() {
    this.stopListening = CurrentUser.listen(this._onUserChange.bind(this));
    this.stopAuthListen = Actions.noauth.listen(() => this.setState({loading: false}));

    this.setState({user: CurrentUser.get()});
  }

  componentWillUnmount() {
    this.stopListening();
    this.stopAuthListen();
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    if (! this.state.user.id) {
        return <LoginForm />;
    }

    return (
      <div className="navbar-right">
        <div style={styles.username}>
          Welcome, {this.state.user.username}
          {' '}
          <a href="#" onClick={this._onLogoutPress}>sign out</a>
        </div>
      </div>
    );
  }

  _onLogoutPress(e) {
    e.preventDefault();
    Actions.logout();
  }

  _onUserChange(user) {
    this.setState({user, loading: false});
  }

}

var styles = {
  username: {
    margin: 3,
    lineHeight: '44px',
    color: 'white',
  },
};
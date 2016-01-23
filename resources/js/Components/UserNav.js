import React from 'react';
import Actions from '../Utils/Actions';
import CurrentUser from '../Stores/CurrentUser';
import LoginForm from './LoginForm';
import UserMenu from './UserMenu';

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

  renderLoginForm() {
    return <LoginForm />;
  }

  renderUserMenu() {
    return (
      <UserMenu user={this.state.user} />
    );
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <div style={styles.container}>
        {this.state.user.id ? this.renderUserMenu() : this.renderLoginForm()}
      </div>
    );
  }

  _onUserChange(user) {
    this.setState({user, loading: false});
  }

}

var styles = {
  container: {
    height: '56px',
  },
  username: {
    margin: 3,
    lineHeight: '44px',
    color: 'white',
  },
};
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
      user: {},
    };
  }

  componentWillMount() {
    this.stopListening = CurrentUser.listen(this._onUserChange.bind(this));

    this.setState({user: CurrentUser.get()});
  }

  render() {
    if (! this.state.user.id) {
        return <LoginForm />;
    }

    return (
      <div className="navbar-right">
        <div style={styles.username}>
          Welcome, {this.state.user.username}
        </div>
      </div>
    );
  }

  _onUserChange(user) {
    console.log('_onUserChange', user);
    this.setState({user});
  }

}

var styles = {
  username: {
    margin: 3,
    color: 'white',
  },
};
import React from 'react';
import Actions from '../Utils/Actions';
import CurrentUser from '../Stores/CurrentUser';

export default class UserMenu extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  static defaultProps = {
    user: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
    };
  }

  componentWillMount() {
    this.stopListening = CurrentUser.listen(this._onUserChange.bind(this));

    this.setState({user: CurrentUser.get()});
  }

  componentWillUnmount() {
    this.stopListening();
  }

  render() {
    return (
      <ul className="nav navbar-nav navbar-right">
        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
            {this.state.user.username}
            <span className="caret"></span>
          </a>
          <ul className="dropdown-menu">
            <li>
              <a href="/admin/page-editor">
                <span className="glyphicon glyphicon-plus" aria-hidden="true" style={styles.icon}></span>
                New Page
              </a>
            </li>
            <li>
              <a href="/admin/page-inventory">
                <span className="glyphicon glyphicon-edit" aria-hidden="true" style={styles.icon}></span>
                Edit Articles
              </a>
            </li>
            <li>
              <a href="/admin/guest-list">
                <span className="glyphicon glyphicon-th-list" aria-hidden="true" style={styles.icon}></span>
                Guest List
              </a>
            </li>
            <li>
              <a href="/admin/manage-rsvp">
                <span className="glyphicon glyphicon-ok-sign" aria-hidden="true" style={styles.icon}></span>
                Manage RSVPs
              </a>
            </li>
            <li role="separator" className="divider"></li>
            <li className="dropdown-header">My Account</li>
            <li><a href="#" onClick={this._onLogoutPress}>
              <span className="glyphicon glyphicon-log-out" aria-hidden="true" style={styles.icon}></span>
              Sign Out
            </a></li>
          </ul>
        </li>
      </ul>
    );
  }

  _onLogoutPress(e) {
    e.preventDefault();
    Actions.logout();
  }

  _onUserChange(user) {
    this.setState({user});
  }
}

var styles = {
  icon: {
    paddingRight: '5px',
  },
};

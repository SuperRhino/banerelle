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

    this.setState({user: CurrentUser.get()}, () => this._setUsername());
  }

  componentWillUnmount() {
    this.stopListening();
  }

  render() {
    return (
      <ul className="nav navbar-nav navbar-right" style={{backgroundColor: 'rgba(34,34,34,.5)'}}>
          <li>
            <a href="/">
              <span className="glyphicon glyphicon-home" aria-hidden="true" style={styles.icon}></span>
              <span className="hidden-sm">Home</span>
            </a>
          </li>
          <li>
            <a href="/admin/page-editor">
              <span className="glyphicon glyphicon-plus" aria-hidden="true" style={styles.icon}></span>
              Add <span className="hidden-sm">Page</span>
            </a>
          </li>
          <li>
            <a href="/admin/page-inventory">
              <span className="glyphicon glyphicon-edit" aria-hidden="true" style={styles.icon}></span>
              Articles
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
              <span className="hidden-sm">Manage</span> RSVPs
            </a>
          </li>
          <li>
            <a href="#" onClick={this._onLogoutPress}>
              <span className="glyphicon glyphicon-log-out" aria-hidden="true" style={styles.icon}></span>
              Sign Out
            </a>
          </li>
      </ul>
    );
  }

  _onLogoutPress(e) {
    e.preventDefault();
    Actions.logout();
  }

  _onUserChange(user) {
    this.setState({user}, () => this._setUsername());
  }

  _setUsername() {
      let usernameEls = document.querySelectorAll('[data-username]');
      usernameEls.forEach(el => {
          el.innerText = this.state.user.username;
      });
  }
}

var styles = {
  icon: {
    paddingRight: '5px',
  },
};

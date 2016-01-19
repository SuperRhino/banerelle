import React from 'react';
import Actions from '../Utils/Actions';
import ApiRequest from '../Api/ApiRequest';

export default class LoginForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return (
      <form className="navbar-form navbar-right" role="form" onSubmit={this.onSubmit}>
        <div className="form-group" style={styles.formField}>
          <input ref="username" type="text" placeholder="username" className="form-control" />
        </div>
        <div className="form-group" style={styles.formField}>
          <input ref="password" type="password" placeholder="password" className="form-control" />
        </div>
        <button type="submit" className="btn btn-default">Sign in</button>
      </form>
    );
  }

  onSubmit(e) {
    e.preventDefault();
    var data = {
      username: this.refs.username.value,
      password: this.refs.password.value,
    };

    Actions.login(data);
  }
}

var styles = {
  formField: {
    margin: 3,
  },
};
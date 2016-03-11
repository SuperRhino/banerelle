import React from 'react';

import ApiRequest from '../Api/ApiRequest';
import CurrentUser from '../Stores/CurrentUser';

export default class GuestList extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      authorized: true,
      user: this.props.user,
      guests: [],
    };

    this._onUserChange = this._onUserChange.bind(this);
  }

  componentWillMount() {
    this.stopUserSubscribe = CurrentUser.listen(this._onUserChange);

    let user = CurrentUser.get();
    this.setState({
      loading: false,
      authorized: !! user.id,
      user: user,
      guests: window.GLOBAL_DATA.guests || [],
    });
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  renderRow(guest, index) {
    return (
      <tr key={'guest-'+index}>
        <td>{guest.first_name+' '+guest.last_name}</td>
        <td>{guest.party_leader_name+"'s Party"}</td>
      </tr>
    );
  }

  render() {
    if (this.state.loading) return <h4>Loading...</h4>;
    if (! this.state.authorized) return <h4>Must be logged in :(</h4>;

    if (this.state.guests.length === 0) {
      return <h4>No guests yet :(</h4>;
    }

    return (
      <table className="table table-striped table-hover">
        <tbody>
          <tr>
            <th>Name</th>
            <th>Party</th>
          </tr>
          {this.state.guests.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    );
  }

  _onUserChange(user) {
    this.setState({authorized: !! user.id});
  }
}


var styles = {
  container: {},
};
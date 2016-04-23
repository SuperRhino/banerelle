import React from 'react';

import $ from 'jquery';
import CurrentUser from '../../Stores/CurrentUser';
import GuestForm from './GuestForm';
import GuestRemove from './GuestRemove';

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

    this._onUpdateList = this._onUpdateList.bind(this);
    this._onRemoveGuest = this._onRemoveGuest.bind(this);
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
      activeGuest: {},
      removeGuest: {},
    });
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  renderRow(guest, index) {
    return (
      <tr key={'guest-'+index} style={styles.guestRow} onClick={this._openEditor.bind(this, guest)}>
        <td>{guest.first_name+' '+guest.last_name}</td>
        <td>{guest.party_leader_name+"'s Party"}</td>
        <td>
          <a href="#" className="btn btn-default" onClick={e => e.preventDefault()}>
            <span className="glyphicon glyphicon-edit"></span>
            {' Edit'}
          </a>
          {' '}
          <a href="#" className="btn btn-danger" onClick={this._confirmRemove.bind(this, guest)}>
            <span className="glyphicon glyphicon-trash"></span>
          </a>
        </td>
      </tr>
    );
  }

  renderAddGuestButton() {
    return (
      <button type="button" className="btn btn-lg btn-success pull-right" onClick={this._openEditor.bind(this, {})}>
        <span className="glyphicon glyphicon-plus"></span>
        {' Add Guest'}
      </button>
    );
  }

  render() {
    if (this.state.loading) return <h4>Loading...</h4>;
    if (! this.state.authorized) return <h4>Must be logged in :(</h4>;

    if (this.state.guests.length === 0) {
      return <h4>No guests yet :(</h4>;
    }

    return (
      <div>
        {this.renderAddGuestButton()}
        <h1>Guest List: ({this.state.guests.length})</h1>
        <table className="table table-striped table-hover">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Party</th>
              <th>&nbsp;</th>
            </tr>
            {this.state.guests.map(this.renderRow.bind(this))}
          </tbody>
        </table>
        <GuestForm guest={this.state.activeGuest} onChange={this._onUpdateList} />
        <GuestRemove guest={this.state.removeGuest} onRemove={this._onRemoveGuest} />
      </div>
    );
  }

  _onUpdateList(updatedGuests) {
    let guests = this.state.guests;
    for (var i=0; i < updatedGuests.length; i++) {
      let guest = guests.filter(g => (g.id === updatedGuests[i].id));
      if (guest.length) {
        guest = updatedGuests[i];
      } else {
        guests.unshift(updatedGuests[i]);
      }
    }
    this.setState({guests});
  }

  _onRemoveGuest(guestId) {
    let oldGuests = this.state.guests,
        guests = oldGuests.filter(g => (g.id !== guestId));
    this.setState({guests});
  }

  _onUserChange(user) {
    this.setState({authorized: !! user.id});
  }

  _confirmRemove(removeGuest, e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({removeGuest}, () => {
      $('#guestRemove').modal('show');
    });
  }

  _openEditor(guest = {}, e) {
    e.preventDefault();
    let activeGuest = Object.assign({}, guest);
    this.setState({activeGuest}, () => {
      $('#guestForm').modal('show');
    });
  }
}


var styles = {
  guestRow: {
    cursor: 'pointer',
  },
};
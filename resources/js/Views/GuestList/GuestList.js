import React from 'react';
import $ from 'jquery';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import CurrentUser from '../../Stores/CurrentUser';
import GuestDetail from './GuestDetail';
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
    this._onSelectRow = this._onSelectRow.bind(this);
    this._formatName = this._formatName.bind(this);
    this._formatControls = this._formatControls.bind(this);
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

  renderAddGuestButton() {
    return (
      <button type="button" className="btn btn-lg btn-success pull-right" onClick={() => console.log("Add new")}>
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

    let selectRowProp = {
      mode: "radio", // or checkbox
      clickToSelect: true,
      bgColor: "#d9edf7",
      onSelect: this._onSelectRow,
    };

    return (
      <div>
        {this.renderAddGuestButton()}
        <h1>Guest List: ({this.state.guests.length})</h1>
        <BootstrapTable
          data={this.state.guests}
          striped={true}
          hover={true}
          search={true}
          multiColumnSearch={true}
          selectRow={selectRowProp}
        >
          <TableHeaderColumn dataField="id" isKey={true}>ID</TableHeaderColumn>
          <TableHeaderColumn dataField="last_name" dataSort={true} dataFormat={this._formatName}>Name</TableHeaderColumn>
          <TableHeaderColumn dataField="party_leader_name" dataSort={true}>Party</TableHeaderColumn>
          <TableHeaderColumn dataField="controls" dataFormat={this._formatControls}>Status</TableHeaderColumn>
        </BootstrapTable>
        <GuestDetail ref="guestDetail" guest={this.state.activeGuest} onChange={this._onUpdateList} />
        <GuestRemove ref="guestRemove" guest={this.state.removeGuest} onRemove={this._onRemoveGuest} />
      </div>
    );
  }

  _formatName(cell, row) {
    return row.first_name+' '+row.last_name;
  }

  _formatControls(cell, row) {
    return (
      <div>
        <a href="#" className="btn btn-default" onClick={e => e.preventDefault()}>
          <span className="glyphicon glyphicon-edit"></span>
          {' Edit'}
        </a>
        {' '}
        <a href="#" className="btn btn-danger" onClick={this._confirmRemove.bind(this, row)}>
          <span className="glyphicon glyphicon-trash"></span>
        </a>
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
      this.refs.guestRemove.show();
    });
  }

  _onSelectRow(row, isSelected) {
    if (isSelected) {
      this.setState({activeGuest: row}, () => {
        this.refs.guestDetail.show();
      });
    }
  }
}


var styles = {
  guestRow: {
    cursor: 'pointer',
  },
};
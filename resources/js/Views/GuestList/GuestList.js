import React from 'react';
import $ from 'jquery';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import CurrentUser from '../../Stores/CurrentUser';
import ChooseExport from './ChooseExport';
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
      activeGuest: {},
    };

    this._onUpdateGuest = this._onUpdateGuest.bind(this);
    this._onRemoveGuest = this._onRemoveGuest.bind(this);
    this._onUserChange = this._onUserChange.bind(this);
    this._onPressAddNew = this._onPressAddNew.bind(this);
    this._onPressExport = this._onPressExport.bind(this);
    this._onSelectRow = this._onSelectRow.bind(this);
    this._formatName = this._formatName.bind(this);
    this._formatPartyName = this._formatPartyName.bind(this);
    this._formatControls = this._formatControls.bind(this);
    this._formatAttrs = this._formatAttrs.bind(this);
  }

  componentWillMount() {
    this.stopUserSubscribe = CurrentUser.listen(this._onUserChange);

    let user = CurrentUser.get();
    this.setState({
      loading: false,
      authorized: !! user.id,
      rsvpFilter: null,
      user: user,
      guests: window.GLOBAL_DATA.guests || [],
      activeGuest: {},
      removeGuest: {},
    });
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  _setFilter(e, yes) {
      e.preventDefault();
      let rsvpFilter = null;
      if (yes===true) rsvpFilter = 'y';
      if (yes===false) rsvpFilter = 'n';
      if (yes==='') rsvpFilter = '';
      this.setState({rsvpFilter});
  }

  renderAddGuestButton() {
    return (
      <button type="button" className="btn btn-lg btn-success pull-right" onClick={this._onPressAddNew}>
        <span className="glyphicon glyphicon-plus"></span>
        {' Add Guest'}
      </button>
    );
  }

  renderExportButton() {
    return (
      <button
        onClick={this._onPressExport}
        className="btn btn-lg btn-info pull-right"
        style={{marginRight: 10}}>
        <span className="glyphicon glyphicon-download-alt"></span>
        {' Download CSV'}
      </button>
    );
  }

  getFilteredGuests() {
      if (this.state.rsvpFilter === 'y') {
          // Filter only yeses
          return this.state.guests.filter(g => g.rsvp==='Yes');
      }
      if (this.state.rsvpFilter === 'n') {
          // Filter only noses
          return this.state.guests.filter(g => g.rsvp==='No');
      }
      if (this.state.rsvpFilter === '') {
          // Filter only no replies
          return this.state.guests.filter(g => g.rsvp!=='No'&&g.rsvp!=='Yes');
      }
      // All guests:
      return this.state.guests;
  }

  render() {
    if (this.state.loading) return <h4>{'Loading...'}</h4>;
    if (! this.state.authorized) return <h4>{'Must be logged in :('}</h4>;

    if (this.state.guests.length === 0) {
      return <h4>{'No guests yet :('}</h4>;
    }

    let selectRowProp = {
      mode: "radio", // or checkbox
      clickToSelect: true,
      bgColor: "#d9edf7",
      onSelect: this._onSelectRow,
    };

    let guests = this.state.guests,
        yesCount = guests.filter(g => g.rsvp==='Yes'),
        noCount = guests.filter(g => g.rsvp==='No');

    return (
      <div>
        {this.renderAddGuestButton()}
        {this.renderExportButton()}
        <h1>
            Guest List: ({this.state.guests.length})<br />
            <small>
                RSVP Count:
                [<a href="#" onClick={e => this._setFilter(e, true)}>Yes {yesCount.length}</a>]
                {' '}
                <small>[<a href="#" onClick={e => this._setFilter(e, false)}>No: {noCount.length}</a>]</small>
                {' '}
                <small>[<a href="#" onClick={e => this._setFilter(e, '')}>NoReply: {this.state.guests.length - (yesCount.length + noCount.length)}</a>]</small>
                {' '}
                {this.state.rsvpFilter===null ? null : (
                    <small style={{textTransform:'none'}}>(<a href="#" onClick={e => this._setFilter(e)}>clear filter</a>)</small>
                )}
            </small>
        </h1>
        <BootstrapTable
          data={this.getFilteredGuests()}
          striped={true}
          hover={true}
          search={true}
          multiColumnSearch={true}
          selectRow={selectRowProp}
        >
          <TableHeaderColumn dataField="id" isKey={true} dataSort={true} width="60">ID</TableHeaderColumn>
          <TableHeaderColumn dataField="last_name" dataSort={true} dataFormat={this._formatName}>Name</TableHeaderColumn>
          <TableHeaderColumn dataField="party_leader_name" dataSort={true} dataFormat={this._formatPartyName}>Party</TableHeaderColumn>
          <TableHeaderColumn dataField="rsvp" dataFormat={this._formatAttrs}>Attributes</TableHeaderColumn>
          <TableHeaderColumn dataField="controls" dataFormat={this._formatControls}>Status</TableHeaderColumn>
        </BootstrapTable>
        <ChooseExport ref="chooseExport" />
        <GuestDetail ref="guestDetail" guest={this.state.activeGuest} onChange={this._onUpdateGuest} />
        <GuestRemove ref="guestRemove" guest={this.state.removeGuest} onRemove={this._onRemoveGuest} />
      </div>
    );
  }

  _formatName(cell, row) {
    return row.first_name+' '+row.last_name;
  }

  _formatPartyName(cell, row) {
    return row.party_leader_name+"'s Party";
  }

  _formatAttrs(cell, guest) {
    return (
      <div>
        {this.renderRsvpIcon(guest)}
        {' '}
        {! guest.meal_option ? null :
          <span className="glyphicon glyphicon-2x glyphicon-cutlery" title="Meal selected"></span>}
        {' '}
        {! (guest.address_street && guest.address_city && guest.address_state && guest.address_zip) ? null :
          <span className="glyphicon glyphicon-2x glyphicon-map-marker" title="Address saved"></span>}
        {' '}
        {! guest.email ? null :
          <span className="glyphicon glyphicon-2x glyphicon-envelope" title="Email saved"></span>}
        {' '}
        {! guest.phone ? null :
          <span className="glyphicon glyphicon-2x glyphicon-phone-alt" title="Phone saved"></span>}
      </div>
    );
  }

  renderRsvpIcon(guest) {
    if (guest.rsvp === null) return null;

    if (guest.rsvp === 'Yes') {
      return <span className="glyphicon glyphicon-2x glyphicon-ok-circle text-success" title="RSVP Yes"></span>;
    }

    if (guest.rsvp === 'No') {
      return <span className="glyphicon glyphicon-2x glyphicon-remove-circle text-danger" title="RSVP No"></span>;
    }
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

  _onUpdateGuest(updatedGuests) {
    let guests = this.state.guests,
        activeGuest = this.state.activeGuest.id ? this.state.activeGuest : updatedGuests[0];

    for (var i=0; i < updatedGuests.length; i++) {
      let index = guests.findIndex(el => el.id === updatedGuests[i].id);
      if (index === -1) {
        // Add new / prepend to data:
        guests.unshift(updatedGuests[i]);
      } else {
        // Update found:
        guests[index] = Object.assign({}, guests[index], updatedGuests[i]);
      }

      if (activeGuest.id === updatedGuests[i].id) {
        activeGuest = updatedGuests[i];
      }
    }

    this.setState({
      guests,
      activeGuest,
    });
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

  _onPressExport() {
    this.refs.chooseExport.show();
  }

  _onPressAddNew() {
    this.setState({activeGuest: {id: null}}, () => this.refs.guestDetail.show());
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

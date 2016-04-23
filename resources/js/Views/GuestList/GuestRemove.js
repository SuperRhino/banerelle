import React from 'react';
import Actions from '../../Utils/Actions';
import ApiRequest from '../../Api/ApiRequest';
import $ from 'jquery';

export default class GuestRemove extends React.Component {
  static propTypes = {
    guest: React.PropTypes.object,
    onRemove: React.PropTypes.func,
  };
  static defaultProps = {
    guest: {},
    onRemove: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {};

    this.onRemove = this.onRemove.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  render() {
    return (
      <div className="modal fade" tabIndex="-1" role="dialog" id="guestRemove">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">Remove: {this.props.guest.first_name+' '+this.props.guest.last_name}?</h4>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={this.onClose}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={this.onRemove}>Remove Guest</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onClose() {
    $('#guestRemove').modal('hide');
  }

  onRemove() {
    ApiRequest.delete('/guests/'+this.props.guest.id)
      .send(res => {
        this.onClose();
        this.props.onRemove(this.props.guest.id);
      });
  }
}

var styles = {
};
import React from 'react';
import $ from 'jquery';

export default class ChooseExport extends React.Component {
  static propTypes = {
    onDone: React.PropTypes.func,
  };
  static defaultProps = {
    onDone: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  show() {
    $('#ChooseExport').modal('show');
  }

  hide() {
    $('#ChooseExport').modal('hide');
  }

  renderModalBody() {
    return (
      <div className="modal-body">
        Export Guest List
      </div>
    );
  }

  render() {
    return (
      <div className="modal fade" tabIndex="-1" role="dialog" id="ChooseExport">
        <div className="modal-dialog">
          <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title">
                  {'Export Guest List'}
                </h4>
              </div>
              <div className="modal-footer">
                <a className="btn btn-lg btn-primary" href="/admin/guest-list/download">
                  {'Full Address List'}
                </a>
                <a className="btn btn-lg btn-success" href="/admin/guest-list/download?yes=1">
                  {'RSVP/Yes List'}
                </a>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

var styles = {};

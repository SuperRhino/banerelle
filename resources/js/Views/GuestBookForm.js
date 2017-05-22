import React from 'react';
import ApiRequest from '../Api/ApiRequest';
import Events from '../Utils/Events';
import Utils from '../Utils/Utils';
import $ from 'jquery';

export default class GuestBookForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {};

    this.onSubmit = this.onSubmit.bind(this);
  }

  _getFormData() {
    return {
      name: this.refs.inputName.value,
      message: this.refs.inputMessage.value,
    };
  }

  render() {
    return (
      <div className="row">
        <form ref="guestBookForm" role="form" onSubmit={this.onSubmit}>
            <div className="form-group">
                <input ref="inputName" id="inputName" className="form-control input-lg" type="text" placeholder="Your name" />
            </div>
            <div className="form-group">
                <textarea ref="inputMessage" id="inputMessage" className="form-control input-lg" rows="5" placeholder="Write your message to Shayna &amp; Ryan..."></textarea>
            </div>
            <button type="submit" className="btn btn-success btn-block btn-lg">Post Message</button>
        </form>
      </div>
    );
  }

  onSubmit(e) {
    e.preventDefault();
    ApiRequest.post('/guests/messages')
      .data(this._getFormData())
      .setAnonymous(true)
      .send(res => {
        let message = res.data;
        this.refs.guestBookForm.reset();
        Utils.showSuccess("👍 Thanks, <b>"+message.name+"</b>! You know we love you!");
        this.injectMessage(message);
      });

     Events.send('forms', 'submit', 'guest book');
  }

  injectMessage(post) {
    let $messages = $("#guest-messages"),
        $name = $("<small />").text(post.name),
        $quote = $("<blockquote />").text( post.message ).append( $name );
    $messages.prepend( $quote );
  }
}

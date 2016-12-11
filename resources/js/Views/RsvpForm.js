import React from 'react';
import ApiRequest from '../Api/ApiRequest';
import Utils from '../Utils/Utils';

const INITIAL_STATE = {
  enabled: false,
  validate: false,
  rsvp: '',
  rsvp_num: 1,
  primary_name: '',
  secondary_name: '',
  submitted: false,
};

export default class RsvpForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = INITIAL_STATE;

    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    // add .has-success or .has-error
    // .glyphicon-ok or .glyphicon-remove
    return (
      <div className="row">
          <h1>RSVP <small>Banerelle Wedding</small></h1>
          {! this.state.submitted ? this.renderForm() : this.renderThankYou()}
      </div>
    );
  }

  renderRsvp() {
      let fieldClasses = this._fieldIsValid('rsvp') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
            <blockquote className="bq-alt">Will you be able to attend?
                <select className="form-control input-lg"
                    value={this.state.rsvp}
                    onChange={e => this.setState({rsvp: e.target.value})}>
                    <option value="">Choose RSVP...</option>
                    <option value="y">Yes, Certainly</option>
                    <option value="n">No, my party will not be able to party. We wish you luck & send you love...</option>
                </select>
            </blockquote>
          </div>
      );
  }

  renderRsvpNumInput() {
      if (this.state.rsvp !== 'y') return;

      return (
          <div className="form-group has-feedback">
            <blockquote className="bq-alt">How many will attend?
                <select className="form-control input-lg"
                    value={this.state.rsvp_num}
                    onChange={e => this.setState({rsvp_num: e.target.value})}>
                    <option>1</option>
                    <option>2</option>
                </select>
            </blockquote>
          </div>
      );
  }

  renderNameInput() {
      if (! this.state.rsvp) return;

      let fieldClasses = this._fieldIsValid('primary_name') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
              <blockquote className="bq-alt">Who are you?
                  <input
                      className="form-control input-lg"
                      type="text"
                      placeholder="Mia Wallace"
                      value={this.state.primary_name}
                      onChange={e => this.setState({primary_name: e.target.value})}
                  />
              </blockquote>
          </div>
      );
  }

  renderSecondNameInput() {
      if (this.state.rsvp_num != 2) return;

      let fieldClasses = this._fieldIsValid('secondary_name') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
              <blockquote className="bq-alt">Who's Your Date?
                  <input
                      className="form-control input-lg"
                      type="text"
                      placeholder="Vincent Vega"
                      value={this.state.secondary_name}
                      onChange={e => this.setState({secondary_name: e.target.value})}
                  />
              </blockquote>
          </div>
      );
  }

  renderSubmit() {
      if (! this.state.rsvp) return;

      return (
          <button type="submit" className="btn btn-lg btn-success">Confirm RSVP</button>
      );
  }

  renderForm() {
    if (! this.state.enabled) {
      return (
        <div className="alert alert-info">
          {"You'll be able to RSVP as soon as we invite you ;)"}
        </div>
      );
    }

    return (
      <form ref="rsvpForm" role="form" onSubmit={this.onSubmit}>
          <h3>
            {"We'd love for you to join us! "}
            <small>Please RSVP by June 15</small>
          </h3>
          {this.renderRsvp()}
          {this.renderRsvpNumInput()}
          {this.renderNameInput()}
          {this.renderSecondNameInput()}
          {this.renderSubmit()}
      </form>
    );
  }

  renderThankYou() {
      let rsvp = (this.state.rsvp === 'y');
      let renderPhotos = () => (
          <blockquote className="bq-alt">
            <p>
                <a href="/photos" title="Photos" className="btn btn-lg btn-block btn-success">
                    <i className="glyphicon glyphicon-camera"></i>
                    <span> Look at photos of us</span>
                </a>
            </p>
          </blockquote>
      );
      let renderStory = () => (
          <blockquote className="bq-alt">
            <p>
                <a href="/our-story" title="Photos" className="btn btn-lg btn-block btn-info">
                    <i className="glyphicon glyphicon-hand-right"></i>
                    <span> Read Our Story</span>
                </a>
            </p>
          </blockquote>
      );
      let renderNote = () => {
          if (! rsvp) {
              return (
                  <div>
                      <blockquote className="bq-alt">
                        <p>
                            Darn it... Well {this.state.primary_name},
                            you can still sign our Guest Book &mdash; it will make you feel better:
                        </p>
                        <p>
                            <a href="/guest-book" title="Guest Book" className="btn btn-lg btn-block btn-warning">
                                <i className="glyphicon glyphicon-book"></i>
                                <span> Sign our Guest Book &mdash; Say good things about us</span>
                            </a>
                        </p>
                      </blockquote>
                      {renderPhotos()}
                      {renderStory()}
                      <blockquote className="bq-alt">
                        <p>Have Keyboard Cat play you off:</p>
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/J---aiyznGQ?rel=0" frameborder="0" allowfullscreen></iframe>
                      </blockquote>
                  </div>
              );
          }

          return (
            <div>
                <blockquote className="bq-alt">
                    <p>Coool Beans! We cannot wait to see you there!</p>
                    <p><img src="http://i.imgur.com/YiTCHJK.gif" alt="Carlton Dance" /></p>
                    <p>
                        <a href="/guest-book" title="Guest Book" className="btn btn-lg btn-block btn-warning">
                            Sign our Guest Book &mdash; tell us your favorite dance song
                        </a>
                    </p>
                </blockquote>
                {renderPhotos()}
                {renderStory()}
            </div>
          );
      };
      let icon = rsvp ? 'glyphicon-ok-circle' : 'glyphicon-exclamation-sign';
      return (
          <div className="col-xs-12">
              <h3>
                <i className={"glyphicon "+icon}></i>
                {' Thank you! '}
                <small>RSVP: {rsvp ? 'YES' : 'NO'} by {this.state.primary_name}</small>
              </h3>
              {renderNote()}
          </div>
      );
  }

  onSubmit(e) {
      e.preventDefault();
      if (! this.validate()) return;

      ApiRequest.post('/guests/rsvp')
        .data(this._getFormData())
        .send(res => {
            Utils.showSuccess('<i class="glyphicon glyphicon-ok"></i>');
            this.setState({submitted: true});
        });
  }

  _fieldIsValid(field) {
      if (! this.state.validate) return true;
      return !! this.state[field];
  }

  validate() {
      var valid = true,
          error_fields = [];
      if (! this.state.rsvp) {
          error_fields.push('rsvp');
          valid = false;
      } else {
          if (! this.state.primary_name) {
              error_fields.push('primary_name');
              valid = false;
          }
          if (this.state.rsvp_num == 2 && ! this.state.secondary_name) {
              error_fields.push('secondary_name');
              valid = false;
          }
      }

      if (! valid) {
          Utils.showError("$#!† — You're missing the following: " + error_fields.join(', '));
      }

      this.setState({validate: true});
      return valid;
  }

  _getFormData() {
    let {rsvp, rsvp_num, primary_name, secondary_name} = this.state;
    return {
        rsvp,
        rsvp_num,
        primary_name,
        secondary_name,
    };
  }
}

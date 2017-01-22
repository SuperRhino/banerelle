import React from 'react';
import ApiRequest from '../Api/ApiRequest';
import Events from '../Utils/Events';
import Utils from '../Utils/Utils';

const INITIAL_STATE = {
  enabled: false,
  validate: false,
  email_sent: false,
  rsvp_id: null,
  rsvp: '',
  rsvp_num: 1,
  rsvp_email: '',
  primary_name: '',
  secondary_name: '',
};

export default class RsvpForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = INITIAL_STATE;

    this.onSubmit = this.onSubmit.bind(this);
    this.onSubmitEmail = this.onSubmitEmail.bind(this);
  }

  render() {
    // add .has-success or .has-error
    // .glyphicon-ok or .glyphicon-remove
    return (
      <div className="row">
          <div className="col-xs-12">
              <h1>RSVP <small>Banerelle Wedding</small></h1>
              <h3 className="section-subheading text-muted" style={{marginBottom: 25}}>The best way to RSVP for the Banerelle wedding.</h3>
              {! this.state.rsvp_id ? this.renderForm() : this.renderThankYou()}
          </div>
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
      let show = (this.state.rsvp_num == 2 && this.state.rsvp === 'y');
      if (! show) return;

      let fieldClasses = this._fieldIsValid('secondary_name') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
              <blockquote className="bq-alt">{"Who's Your Date?"}
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
                <a href="/photos" title="Photos" className="btn btn-lg btn-block btn-success" data-ga-rsvp>
                    <i className="glyphicon glyphicon-camera"></i>
                    <span> Look at photos of us</span>
                </a>
            </p>
          </blockquote>
      );
      let renderStory = () => (
          <blockquote className="bq-alt">
            <p>
                <a href="/our-story" title="Photos" className="btn btn-lg btn-block btn-info" data-ga-rsvp>
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
                            <a href="/guest-book" title="Guest Book" className="btn btn-lg btn-block btn-warning" data-ga-rsvp>
                                <i className="glyphicon glyphicon-book"></i>
                                <span> Sign our Guest Book &mdash; Say good things about us</span>
                            </a>
                        </p>
                      </blockquote>
                      {renderPhotos()}
                      {renderStory()}
                      <blockquote className="bq-alt">
                        <p>Have Keyboard Cat play you off:</p>
                        <div className="videoWrapper">
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/J---aiyznGQ?rel=0" frameBorder="0" allowFullScreen></iframe>
                        </div>
                      </blockquote>
                  </div>
              );
          }

          return (
            <div>
                {this.state.email_sent ? null : (
                    <div className="alert alert-success">
                        <p className="lead text-muted">Get an email reminder the week before the wedding:</p>
                        <form className="form-inline" onSubmit={this.onSubmitEmail}>
                          <div className="form-group">
                            <label className="text-muted">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                style={{width: 225}}
                                placeholder="jane.doe@example.com"
                                value={this.state.rsvp_email}
                                onChange={e => this.setState({rsvp_email: e.target.value})}
                            />
                          </div>
                          <button type="submit" className="btn btn-default btn-danger">
                            <i className="glyphicon glyphicon-envelope"></i>
                            {' Send Me Reminder'}
                          </button>
                        </form>
                    </div>
                )}
                <blockquote className="bq-alt">
                    <p>Coool Beans! We cannot wait to see you there, {this.state.primary_name}!</p>
                    <p><img src="https://media.giphy.com/media/7k0aZNv7cw43m/giphy.gif" alt="Carlton Dance" className="img-responsive" /></p>
                    <p>
                        <a href="/guest-book" title="Guest Book" className="btn btn-lg btn-block btn-warning" data-ga-rsvp>
                            <i className="glyphicon glyphicon-book"></i>
                            {' Sign our Guest Book — tell us your favorite dance song'}
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
            this.setState({rsvp_id: res.data.id});
        });

      Events.send('forms', 'submit', 'rsvp');
  }

  onSubmitEmail(e) {
      e.preventDefault();
      if (! this.state.rsvp_id) {
          return;
      }

      if (! this.state.rsvp_email) {
          Utils.showError("$#!† — You're missing the following: " + error_fields.join(', '));
          return;
      }

      ApiRequest.post('/guests/rsvp/'+this.state.rsvp_id)
        .data({rsvp_email: this.state.rsvp_email})
        .send(res => {
            Utils.showSuccess('<i class="glyphicon glyphicon-ok"></i>');
            this.setState({email_sent: true});
        });

      Events.send('forms', 'submit', 'rsvp email');
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
          if (this.state.rsvp === 'y' && this.state.rsvp_num == 2 && ! this.state.secondary_name) {
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

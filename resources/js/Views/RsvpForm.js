import React from 'react';

export default class RsvpForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.onYes = this.onYes.bind(this);
    this.onNope = this.onNope.bind(this);
  }

  render() {
    // add .has-success or .has-error
    // .glyphicon-ok or .glyphicon-remove
    return (
      <div className="row">
          <h1>RSVP <small>Banerelle Wedding</small></h1>
          {this.renderForm()}
      </div>
    );
  }

  renderForm() {
    if (! this.state.open) {
      return (
        <div className="alert alert-info">
          {"You'll be able to RSVP as soon as we invite you ;)"}
        </div>
      );
    }
    return (
      <form className="" role="form">
          <p className="lead">{"We'd love for you to join us. Start by finding your name:"}</p>
          <div className="form-group has-success has-feedback">
              <input id="inputLastName" className="form-control input-lg" type="text" placeholder="Last name" />
              <span className="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
          </div>
          <blockquote>
              <p>Pick Your Eats</p>
          </blockquote>
          <div className="form-group">
              <div className="radio">
                  <label>
                      <input type="radio" name="foodOptions" id="foodOptions1" value="Burrito" />
                      Breakfast Burrito
                  </label>
              </div>
              <div className="radio">
                  <label>
                      <input type="radio" name="foodOptions" id="foodOptions2" value="McMuffin" />
                      Egg McMuffin
                  </label>
              </div>
          </div>
          <blockquote>
              <p>Guest</p>
          </blockquote>
          <div className="form-group">
              <div className="checkbox disabled">
                  <label>
                      <input type="checkbox" value="+1" disabled />
                      +1
                  </label>
              </div>
          </div>
          <button type="submit" className="btn btn-success" onClick={this.onYes}>YES</button>
          <button type="button" className="btn btn-danger" onClick={this.onNope}>Nope</button>
      </form>
    );
  }

  onYes(e) {
    e.preventDefault();
    console.log('onYes');
  }

  onNope(e) {
    e.preventDefault();
    console.log('nope');
  }
}

import React from 'react';
import ApiRequest from '../Api/ApiRequest';
import Events from '../Utils/Events';
import Utils from '../Utils/Utils';

const INITIAL_STATE = {
  validate: false,
  saved: false,
  drink: '',
  meal: 'Breakfast',
  song: '',
};

const styles = {
    btnContainer: {
        display: 'flex',
    },
};

export default class GuestQuiz extends React.Component {
  static propTypes = {
      rsvp_id: React.PropTypes.number,
  };
  static defaultProps = {
      rsvp_id: null,
  };

  constructor(props) {
    super(props);

    this.state = {
        ...INITIAL_STATE,
        rsvp_id: this.props.rsvp_id,
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    if (this.state.saved) return this.renderThankYou();

    return (
        <form ref="guestQuiz" role="form" onSubmit={this.onSubmit}>
            <h3>{"Now Take the Banerelle Guest Quiz!"}</h3>
            <blockquote className="bq-alt">
                {this.renderDrink()}
                {this.renderMeal()}
                {this.renderSong()}
                {this.renderSubmit()}
            </blockquote>
        </form>
    );
  }

  renderMeal() {
      return (
          <div className="form-group has-feedback">
            Best Meal of the Day?
            <select className="form-control input-lg"
                value={this.state.meal}
                onChange={e => this.setState({meal: e.target.value})}>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
            </select>
          </div>
      );
  }

  renderDrink() {
      let fieldClasses = this._fieldIsValid('drink') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
              Favorite Drink?
              <input
                  className="form-control input-lg"
                  type="text"
                  placeholder="Moscow Mule, All Day IPA, Captain &amp; Coke..."
                  value={this.state.drink}
                  onChange={e => this.setState({drink: e.target.value})}
              />
              <p className="help-block"></p>
          </div>
      );
  }

  renderSong() {
      let fieldClasses = this._fieldIsValid('song') ? 'has-feedback' : 'has-feedback has-error';
      return (
          <div className={"form-group "+fieldClasses}>
            Favorite Song for Dancing?
              <input
                  className="form-control input-lg"
                  type="text"
                  placeholder="Atomic Dog"
                  value={this.state.song}
                  onChange={e => this.setState({song: e.target.value})}
              />
          </div>
      );
  }

  renderClear() {
      if (! this.state.saved) return null;

      return (
          <button
            type="button"
            className="btn btn-lg btn-default"
            onClick={e => this.setState({saved:false})}
            style={{margin: '0 2%'}}>
          Change Answers</button>
      );
  }

  renderSubmit() {
      return (
          <button type="submit" className="btn btn-lg btn-success">Submit Quiz</button>
      );
  }

  renderThankYou() {
      let hasPassingGrade = (this.state.meal.toLowerCase() == 'breakfast');
      return (
          <blockquote className="bq-alt">
              <h4 className="text-muted">Guest Quiz</h4>
              <div className={hasPassingGrade ? "alert alert-success" : "alert alert-danger"}>
                  <h3>
                    <i className={"glyphicon "+(hasPassingGrade ? 'glyphicon-ok-sign success' : 'glyphicon-remove-sign danger')}></i>{' '}
                    {hasPassingGrade ? 'Ding! Ding! (+1 point)' : 'Bzzz! (—1 point)'}
                  </h3>
                  <span className="text-muted">{'Breakfast was the correct response!'}</span>
              </div>
              {this.renderClear()}
          </blockquote>
      );
  }

  onSubmit(e) {
      e.preventDefault();
      //if (! this.validate()) return;

      let {drink, meal, song, rsvp_id} = this.state;

      ApiRequest.post('/guests/rsvp/'+this.state.rsvp_id)
        .data({
            drink,
            meal,
            song,
        })
        .send(res => {
            Utils.showSuccess('<i class="glyphicon glyphicon-ok"></i>');
            this.setState({saved: true});
        });

      Events.send('guest-quiz', 'submit', this.state.rsvp);
  }

  _fieldIsValid(field) {
      if (! this.state.validate) return true;
      return !! this.state[field];
  }

  validate() {
      var valid = true,
          error_fields = [];

      if (! this.state.drink) {
          error_fields.push('drink');
          valid = false;
      }

      if (! this.state.meal) {
          error_fields.push('meal');
          valid = false;
      }

      if (! this.state.song) {
          error_fields.push('song');
          valid = false;
      }

      if (! valid) {
          Utils.showError("$#!† — You're missing the following: " + error_fields.join(', '));
      }

      this.setState({validate: true});
      return valid;
  }
}

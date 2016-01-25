import React from 'react';
import CurrentUser from '../Stores/CurrentUser';

export default class AddEventForm extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      authorized: true,
      user: this.props.user,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this._onUserChange = this._onUserChange.bind(this);
  }

  componentWillMount() {
    this.stopUserSubscribe = CurrentUser.listen(this._onUserChange);

    let user = CurrentUser.get();
    this.setState({
      authorized: !! user.id,
      user,
    });
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  render() {
    if (! this.state.authorized) return <h4>Must be logged in :(</h4>;

    // add .has-success or .has-error
    // .glyphicon-ok or .glyphicon-remove
    return (
      <div className="row">
          <h1>Add Event</h1>
          <p className="lead"><em>Add an event to the homepage and optionally add details page.</em></p>
          <form className="" role="form" onSubmit={this.onSubmit}>
              <div className="form-group has-success has-feedback">
                  <input ref="headline" id="inputHeadline" className="form-control input-lg" type="text" placeholder="Headline" />
                  <span className="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
              </div>
              <button type="submit" className="btn btn-success">ADD EVENT</button>
          </form>
      </div>
    );
  }

  onSubmit(e) {
    e.preventDefault();
    var data = {
      headline: this.refs.headline.value,
    };
    console.log('onSubmit', data);
  }

  _onUserChange(user) {
    this.setState({authorized: !! user.id});
  }
}
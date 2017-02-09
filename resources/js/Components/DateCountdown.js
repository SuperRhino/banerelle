import React from 'react';
import moment from 'moment';

/**
 * Left pad string
 * @param  str
 * @param  padString
 * @param  length
 * @return
 */
let lpad = function(str, padString = '0', length = 2) {
    str = str.toString();
    while (str.length < length)
        str = padString + str;
    return str;
};

/**
 * Date Countdown
 */
export default class DateCountdown extends React.Component {
  static propTypes = {
    date: React.PropTypes.string,
  };
  static defaultProps = {
    date: "07-15-2017 4:30 pm",
    dateFormat: "MM-DD-YYYY h:mm:ss a",
  };

  constructor(props) {
    super(props);

    this.interval = null;
    this.state = {
      formattedDate: "",
      days: 0,
      hours: 0,
      mins: 0,
      seconds: 0,
    };
  }

  componentWillMount() {
    this._onTick();
    this.interval = setInterval(this._onTick.bind(this), 1000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  renderPastDate() {
      return (
          <div className="col-lg-12 text-center">
              <h2 className="section-heading">
                  Are Married!
              </h2>
          </div>
      );
  }

  renderCountdown() {
        return (
            <div className="col-lg-12 text-center">
                <h2 className="section-heading">
                    {this.state.days || null}
                    {this.state.days == 1 ? ' day ' : null}
                    {this.state.days > 1 ? ' days ' : null}
                    {this.state.days || this.state.hours ? this.state.hours : null}
                    {this.state.days && this.state.hours ? ':' : null}
                    {! this.state.days && this.state.hours ?
                        (this.state.hours > 1 ? ' hours ' : ' hour ') :
                        null
                    }
                    {this.state.days || this.state.hours || this.state.mins ? lpad(this.state.mins)+':' : null}
                    {lpad(this.state.seconds)}
                    {! this.state.days && ! this.state.hours ?
                        (this.state.mins ? ' minutes' : ' seconds') :
                        null
                    }
                </h2>
                <h3 className="section-subheading text-muted">
                    {'Getting Married '+this.state.formattedDate+' in Medina, Ohio'}
                </h3>
            </div>
        );
  }

  render() {
    return (
      <div className="row">
        {this.state.isPast ? this.renderPastDate() : this.renderCountdown()}
      </div>
    );
  }

  _onTick() {
    let now = moment(),
        target = moment(this.props.date, this.props.dateFormat),
        isPast = target.isBefore(now);

    this.setState({
      isPast,
      formattedDate: target.format("dddd, MMMM Do YYYY"),
      days: target.diff( now, "days" ),
      hours: target.diff(now, "hours") % 24,
      mins: target.diff(now, "minutes") % 60,
      seconds: target.diff(now, "seconds") % 3600 % 60,
    });
  }
}

let styles = {
  targetDate: {
    textAlign: "center",
    textTransform: "uppercase",
  },
  countdown: {
    fontSize: "3em",
    textAlign: "center",
    textTransform: "uppercase",
  },
};

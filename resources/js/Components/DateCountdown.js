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
    date: "07-15-2017",
    dateFormat: "MM-DD-YYYY",
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

  render() {
    return (
      <div className="row">
        <div className="col-xs-12 center-block">
          <p style={styles.targetDate}>
            {'Getting Married '+this.state.formattedDate+' in Medina, Ohio'}
          </p>
          <p style={styles.countdown}>
            {this.state.days}{' days '}{this.state.hours}{':'}{this.state.mins}{':'}{this.state.seconds}
          </p>
        </div>
      </div>
    );
  }

  _onTick() {
    let now = moment(),
        eod = moment().endOf("day"),
        target = moment(this.props.date, this.props.dateFormat);

    this.setState({
      formattedDate: target.format("dddd, MMMM Do YYYY"),
      days: target.diff( now, "days" ),
      hours: eod.diff(now, "hours"),
      mins: lpad(eod.diff(now, "minutes") % 60),
      seconds: lpad((eod.diff(now, "seconds") % 3600) % 60),
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
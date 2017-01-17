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
        <div className="col-lg-12 text-center">
            <h2 className="section-heading">
                {this.state.days}{' days '}{this.state.hours}{':'}{this.state.mins}{':'}{this.state.seconds}
            </h2>
            <h3 className="section-subheading text-muted">
                {'Getting Married '+this.state.formattedDate+' in Medina, Ohio'}
            </h3>
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

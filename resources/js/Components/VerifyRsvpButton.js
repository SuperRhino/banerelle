import React, {PropTypes} from 'react';
import ApiRequest from '../Api/ApiRequest';
import Utils from '../Utils/Utils';

export default class VerifyRsvpButton extends React.Component {
  static propTypes = {
      id: PropTypes.string.isRequired,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
        verified: false,
    };

    this.onVerify = this.onVerify.bind(this);
  }

  render() {
    if (this.state.verified) {
        return (
            <i className="glyphicon glyphicon-ok-circle" style={styles.icon}></i>
        );
    }

    return (
        <button className="btn btn-success" onClick={this.onVerify}>
            <i className="glyphicon glyphicon-ok"></i>
            {' Mark As Verified'}
        </button>
    );
  }

  onVerify(e) {
    e.preventDefault();
    let {id} = this.props;

    ApiRequest.post('/guests/verify-rsvp')
      .data({id})
      .send(res => {
          Utils.showSuccess('<i class="glyphicon glyphicon-ok"></i>');
          this.setState({verified: true});
      });
  }
}

const styles = {
    icon: {
        fontSize: 24,
    },
};

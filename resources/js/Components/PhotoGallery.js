import React, {Component, PropTypes} from 'react';

let styles = {
    container: {
        marginBottom: 50,
    },
};

export default class PhotoGallery extends Component {
    static propTypes = {
      photos: PropTypes.array,
    };
    static defaultProps = {
      photos: [],
    };

    constructor(props) {
      super(props);
      this.state = {};
    }

    componentWillMount() {}

    render() {
        return (
            <div className="row" style={styles.container}>
                <div className="col-xs-12">
                    <em>{'Check back soon to see some photos of our beautiful faces in love with each other.'}</em>
                </div>
            </div>
        );
    }
}

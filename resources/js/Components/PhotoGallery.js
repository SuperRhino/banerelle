import React, {Component, PropTypes} from 'react';
import Gallery from 'react-photo-gallery';
import PhotoSet from '../Stores/PhotoSet';

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
                    <Gallery photos={PhotoSet} />
                </div>
            </div>
        );
    }
}

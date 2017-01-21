import React, {Component, PropTypes} from 'react';
import Events from '../Utils/Events';
import PhotoSet from '../Stores/PhotoSet';

const styles = {
    container: {
        marginBottom: 50,
    },
    photo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    image: {
        maxHeight: 500,
    },
    btnNext: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: '25%',
        justifyContent: 'flex-end',
    },
    prevNext: {
        position: 'absolute',
        top: 0,
        right: '75%',
        bottom: 0,
        left: 0,
    },
    help: {
        paddingTop: 10,
    },
};

export default class PhotoSlides extends Component {
    static propTypes = {
      photos: PropTypes.array,
    };
    static defaultProps = {
      photos: [],
    };

    constructor(props) {
      super(props);
      this.state = {
          total: PhotoSet.length || 0,
          currentIndex: 0,
      };

      this.onNext = this.onNext.bind(this);
      this.onPrevious = this.onPrevious.bind(this);
    }

    componentWillMount() {}

    render() {
        if (this.state.total === 0) return null;

        let {src} = PhotoSet[this.state.currentIndex];
        return (
            <div className="row" style={styles.container}>
                <div className="col-xs-12" style={styles.photo}>
                    <div style={{position: 'relative'}}>
                        <img src={src} className="img-responsive" style={styles.image} />
                        <a href="#" onClick={this.onNext} style={styles.btnNext} title="Next Photo">
                            <i className="glyphicon glyphicon-menu-right" />
                        </a>
                        <a href="#" onClick={this.onPrevious} style={styles.prevNext} title="Previous Photo">
                            <i className="glyphicon glyphicon-menu-left" />
                        </a>
                    </div>
                    <small style={styles.help}>Tap photo to view next</small>
                </div>
            </div>
        );
    }

    onPrevious(e) {
        e.preventDefault();
        let nextIndex = this.state.currentIndex - 1;
        if (nextIndex < 0) {
            nextIndex = (this.state.total - 1);
        }
        this.setState({currentIndex: nextIndex}, () => Events.send('buttons', 'click', 'previous photo'));
    }

    onNext(e) {
        e.preventDefault();
        let nextIndex = this.state.currentIndex + 1;
        if (nextIndex >= this.state.total) {
            nextIndex = 0;
        }
        this.setState({currentIndex: nextIndex}, () => Events.send('buttons', 'click', 'next photo'));
    }
}

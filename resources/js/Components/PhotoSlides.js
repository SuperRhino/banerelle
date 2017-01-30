import React, {Component, PropTypes} from 'react';
import $ from 'jquery';
import Events from '../Utils/Events';
import PhotoSet from '../Stores/PhotoSet';

const INTERVAL = 3e3;

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
          autoslide: false,
      };

      this.timer = null;

      this.onNext = this.onNext.bind(this);
      this.onPrevious = this.onPrevious.bind(this);
    }

    componentWillMount() {
        // Listen for new scrollspy section active:
        $('body').on('activate.bs.scrollspy', () => {
          let item = document.querySelector('.navbar-nav > .active > a');
          if (item) {
              let activeSection = (item.innerText).toLowerCase();
              if (activeSection == 'photos') {
                  this.start();
              } else {
                  this.pause();
              }
          }
        });
    }

    componentWillUnmount() {
        this.pause();
    }

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

    start() {
        this.timer = setTimeout(() => this.onNext(null, true), INTERVAL);
    }

    pause() {
        if (this.timer) clearTimeout(this.timer);
    }

    onPrevious(e) {
        e && e.preventDefault();
        let nextIndex = this.state.currentIndex - 1;
        if (nextIndex < 0) {
            nextIndex = (this.state.total - 1);
        }
        this.setState({currentIndex: nextIndex}, () => Events.send('buttons', 'click', 'previous photo'));
    }

    onNext(e, automatic = false) {
        e && e.preventDefault();
        automatic = (automatic === true);

        let nextIndex = this.state.currentIndex + 1;
        if (nextIndex >= this.state.total) {
            nextIndex = 0;
        }

        let category = automatic ? 'ai' : 'buttons',
            action = automatic ? 'autoslide' : 'click';

        this.setState({currentIndex: nextIndex}, () => {
            if (automatic) {
                this.start();
            } else {
                this.pause();
            }
            Events.send(category, action, 'next photo');
        });
    }
}

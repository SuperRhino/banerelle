import React, {Component, PropTypes} from 'react';
import Gallery from 'react-photo-gallery';

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
                    <Gallery photos={PHOTO_SET} />
                </div>
            </div>
        );
    }
}

const PHOTO_SET = [
  {
    src: 'http://banerelle.com/uploads/540245_10150940592125628_1415609088_n.jpg',
    width: 640,
    height: 480,
    aspectRatio: 1.33,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/540245_10150940592125628_1415609088_n.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/10628519_10152788457110628_813445833402262786_n.jpg',
    width: 960,
    height: 960,
    aspectRatio: 1,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/10628519_10152788457110628_813445833402262786_n.jpg'
    }
  },
  {
    src: 'https://s3.amazonaws.com/f.cl.ly/items/1L1W3G2o2Z2q1P3n1s0u/12119930_10103042303306790_3082862375800035547_o.jpg',
    width: 1080,
    height: 1080,
    aspectRatio: 1,
    lightboxImage:{
        src: 'https://s3.amazonaws.com/f.cl.ly/items/1L1W3G2o2Z2q1P3n1s0u/12119930_10103042303306790_3082862375800035547_o.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/486335_10100956266581110_1296125997_n.jpg',
    width: 640,
    height: 480,
    aspectRatio: 1.33,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/486335_10100956266581110_1296125997_n.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/994168_10151760845250628_1723909067_n.jpg',
    width: 600,
    height: 450,
    aspectRatio: 1.33,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/994168_10151760845250628_1723909067_n.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/1395281_10152071331545628_645811476_n.jpg',
    width: 640,
    height: 640,
    aspectRatio: 1,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/1395281_10152071331545628_645811476_n.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/708765_3963641340314_786523543_o.jpg',
    width: 1200,
    height: 900,
    aspectRatio: 1.33,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/708765_3963641340314_786523543_o.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/417400_10151913208620363_723752598_n.jpg',
    width: 960,
    height: 822,
    aspectRatio: 1.17,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/417400_10151913208620363_723752598_n.jpg'
    }
  },
  {
    src: 'http://banerelle.com/uploads/11836826_10102918017376790_1510860698066693128_n.jpg',
    width: 750,
    height: 750,
    aspectRatio: 1,
    lightboxImage:{
        src: 'http://banerelle.com/uploads/11836826_10102918017376790_1510860698066693128_n.jpg'
    }
  }
];

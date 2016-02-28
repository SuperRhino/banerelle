import React from 'react';
import moment from 'moment';
import Editor from 'react-medium-editor';
import DateTimeInput from 'react-bootstrap-datetimepicker';

import Utils from '../Utils/Utils';
import ApiRequest from '../Api/ApiRequest';
import CurrentUser from '../Stores/CurrentUser';
import SRDropzone from '../Components/SRDropzone';

export default class PageEditor extends React.Component {
  static propTypes = {
    pageId: React.PropTypes.number,
  };
  static defaultProps = {
    pageId: null,
  };

  constructor(props) {
    super(props);

    this.postTimestamp = null;
    this.hasCustomUri = false;
    this.isLocationSet = false;
    this.autosaveId = null;

    this.state = {
      authorized: true,
      publishing: false,
      processing: false,
      user: this.props.user,
      page: {},
    };

    this._savePage = this._savePage.bind(this);
    this._onSubmitPage = this._onSubmitPage.bind(this);
    this._onPublish = this._onPublish.bind(this);
    this._onPostDateChange = this._onPostDateChange.bind(this);
    this._onUpdatePageUri = this._onUpdatePageUri.bind(this);
    this._onChangeUri = this._onChangeUri.bind(this);
    this._onBlurUri = this._onBlurUri.bind(this);
    this._onChangeTitle = this._onChangeTitle.bind(this);
    this._onArticleChange = this._onArticleChange.bind(this);
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

  componentDidMount() {
    if (this.props.pageId) {
      this._loadPage(this.props.pageId);
    }
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  renderProgressBar() {
    let barClassName = this.state.publishing ? 'progress-bar-success' : 'progress-bar-info';
    return (
      <div className="progress" style={{height: "auto"}}>
        <div className={"progress-bar "+barClassName+" progress-bar-striped active"} role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={styles.progressBar}>
          {this.state.publishing ? 'Publishing...' : 'Saving...'}
        </div>
      </div>
    );
  }

  renderSubmitButton() {
    if (this.state.processing) {
      return this.renderProgressBar();
    }

    return (
      <div>
        <button type="submit" className="btn btn-lg btn-info" style={styles.button}>
          <span className="glyphicon glyphicon-plus-sign"></span>
          {' Save Page'}
        </button>
        <button type="button" className="btn btn-lg btn-success" style={styles.button} onClick={this._onPublish}>
          <span className="glyphicon glyphicon-ok-sign"></span>
          {' Publish Page'}
        </button>
      </div>
    );
  }

  render() {
    if (! this.state.authorized) return <h4>Must be logged in :(</h4>;

    let imageButton = {
      name: 'image',
      action: 'image',
      aria: 'image',
      tagNames: ['img'],
      contentDefault: '<i class="glyphicon glyphicon-picture"></i>',
      contentFA: '<i class="fa fa-picture-o"></i>'
    };
    let editorOptions = {
      placeholder: {text: "Article body..."},
      toolbar: {
        buttons: ['bold', 'italic', 'anchor', 'h2', 'h3', 'quote', 'unorderedlist', imageButton, 'removeFormat'],
      },
    };

    let categories = ["Reviews", "Recipes", "How To's", "Friday Food Fight", "Where To Find..."];

    // add .has-success or .has-error
    // .glyphicon-ok or .glyphicon-remove
    return (
      <form ref="addNewPage" className="" role="form" onSubmit={e => this._onSubmitPage(e)}>
        <div className="jumbotron" style={styles.uploaderRow}>
          <div className="container">
            <SRDropzone
              style={styles.previewImage}
              activeStyle={styles.dragActive}
              multiple={false} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <h1>Page Editor</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-4">
            <p className="lead"><em>Data about data:</em></p>
          </div>
          <div className="col-xs-8">
            <p className="lead"><em>Spit your knowledge game:</em></p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-4">
            <div className="form-group">
              <DateTimeInput
                size={'lg'}
                defaultText={this.state.page.post_date||''}
                inputProps={{placeholder: "Article Date/Time"}}
                format={'x'}
                inputFormat={'YYYY-MM-DD hh:mm A'}
                onChange={this._onPostDateChange} />
            </div>
            <div className="form-group">
              <input ref="pageUri"
                    type="text"
                    className="form-control input-lg"
                    placeholder="Custom-Page-Url"
                    value={this.state.page.uri}
                    onChange={this._onChangeUri}
                    onBlur={this._onBlurUri} />
            </div>
            <div className="form-group">
              <select ref="pageCategory" className="form-control input-lg"
                value={this.state.page.category}
                onChange={e => this._setStatePage({category: e.target.value})}>
                <option value="">— Choose Category —</option>
                {categories.map((category, index) => {
                  return (<option key={'category-'+category}>{category}</option>);
                })}
              </select>
            </div>
            <div className="form-group">
              <input ref="previewImage" className="form-control input-lg" type="text" placeholder="Preview Image URL"
                     value={this.state.page.preview_image}
                     onChange={e => this._setStatePage({preview_image: e.target.value})} />
            </div>
            <div className="form-group">
              <input ref="metaTitle" className="form-control input-lg" type="text" placeholder="Enter meta title"
                     value={this.state.page.meta_title}
                     onChange={e => this._setStatePage({meta_title: e.target.value})} />
            </div>
            <div className="form-group">
              <textarea ref="metaDescription" className="form-control input-lg" rows="2" placeholder="Enter meta description"
                        value={this.state.page.meta_description}
                        onChange={e => this._setStatePage({meta_description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <input ref="metaKeywords" className="form-control input-lg" type="text" placeholder="Enter meta keywords"
                     value={this.state.page.meta_keywords}
                     onChange={e => this._setStatePage({meta_keywords: e.target.value})} />
            </div>
          </div>
          <div className="col-xs-8">
            <div className="form-group">
                <input ref="pageTitle" className="form-control input-lg" type="text" placeholder="Headline"
                  value={this.state.page.title}
                  onChange={this._onChangeTitle} />
            </div>
            <div className="form-group">
              <Editor
                style={styles.editor}
                className="form-control input-lg"
                text={this.state.page.article}
                onChange={this._onArticleChange}
                options={editorOptions} />
            </div>
            {this.renderSubmitButton()}
            <input ref="pageId" type="hidden" name="pageId" value={this.state.page.id} />
          </div>
        </div>
      </form>
    );
  }

  _loadPage(pageId) {
    ApiRequest.get('/pages/'+pageId)
      .send(res => {
        let page = res.data;
        this._setWindowLocation(page.id);
        this.setState({page});
      });

  }

  _setWindowLocation(pageId) {
    if (this.isLocationSet) return;

    let url = window.location.href + '?id=' +pageId;
    history.pushState(null, document.querySelector("title").innerHTML, url);
    this.isLocationSet = true;
  }

  _onPostDateChange(datetime) {
    this.postTimestamp = datetime;
    this._onUpdatePageUri();
  }

  _getPostDateFormat(format = "YYYY-MM-DD HH:mm:00") {
    let dateFormat = moment.unix(this.postTimestamp / 1000).format(format);
    if (dateFormat == 'Invalid date') {
      return "";
    }
    return dateFormat;
  }

  _getPageData(publish = false) {
    return {
      title: this.refs.pageTitle.value,
      article: this.state.page.article, // this.refs.pageArticle.value,
      uri: this.state.page.uri || this.refs.pageUri.value,
      category: this.refs.pageCategory.value,
      preview_image: this.refs.previewImage.value,
      meta_title: this.refs.metaTitle.value,
      meta_description: this.refs.metaDescription.value,
      meta_keywords: this.refs.metaKeywords.value,
      post_date: this.postTimestamp ? this._getPostDateFormat() : null,
      status: publish,
    };
  }

  _onPublish(e) {
    this._onSubmitPage(e, true);
  }

  _onSubmitPage(e, publish = false) {
    if (!! e) e.preventDefault();
    if (this.state.processing) return;

    this._savePage(publish, true);
  }

  _savePage(publish = false, explicitSave = false) {
    explicitSave = (explicitSave === true);
    if (explicitSave) {
      this.setState({processing: true, publishing: publish});
      if (!! this.autosaveId) {
        clearInterval(this.autosaveId);
      }
    }

    let endpoint = this.state.page.id ? '/pages/' + this.state.page.id : '/pages';
    ApiRequest.post(endpoint)
      .data(this._getPageData(publish))
      .send(res => {
        let page = res.data;

        if(! explicitSave) {
          this.state.page.id = page.id;
          return;
        }

        Utils.showSuccess(publish ? 'Page published!' : 'Page saved!');
        this._setWindowLocation(page.id);
        this.setState({
          processing: false,
          page: page,
        });
      });
  }

  _clearForm() {
    this.refs.addNewPage.reset();
    this.postTimestamp = null;
    this.hasCustomUri = false;
    this.setState({
      processing: false,
      page: {},
    });
  }

  _getUriFromTitle() {
    let headline = this.refs.pageTitle.value || 'untitled',
        postDate = this.postTimestamp ? this._getPostDateFormat("-YYYY-MM-DD") : "";
    return Utils.cleanForUrl(headline+postDate);
  }

  _onBlurUri(e) {
    if (! e.target.value) {
      this.hasCustomUri = false;
      this._onUpdatePageUri();
    }
  }

  _onChangeUri(e) {
    this.hasCustomUri = true;

    this._setStatePage({uri: this.refs.pageUri.value});
    return true;
  }

  _onChangeTitle(e) {
    let page = {title: this.refs.pageTitle.value};
    if (! this.hasCustomUri) {
      page.uri = this._getUriFromTitle();
    }

    this._setStatePage(page);
  }

  _onUpdatePageUri(setTitle = false) {
    if (this.hasCustomUri) return;

    this._setStatePage({
      uri: this._getUriFromTitle(),
    });
  }

  _onArticleChange(article, medium) {
    this._setStatePage({article});
  }

  _setStatePage(newPage, state = {}) {
    this._startAutosave();
    let page = this.state.page;
    Object.assign(page, newPage);
    Object.assign(state, {page});
    this.setState(state);
  }

  _onUserChange(user) {
    this.setState({authorized: !! user.id});
  }

  _startAutosave() {
    if (! this.autosaveId) {
      this.autosaveId = setInterval(this._savePage, 5000);
    }
  }
}


var styles = {
  button: {
    width: '48%',
    margin: '0 1%',
  },
  editor: {
    height: "auto",
    minHeight: "20em",
  },
  uploaderRow: {
    paddingLeft: "15px",
    paddingRight: "15px",
    paddingTop: "30px",
    paddingBottom: "30px",
  },
  previewImage: {
    color: "rgb(50,50,50)",
    borderWidth: 0,
    fontWeight: "bold",
    fontSize: 30,
    textAlign: "center",
    minHeight: "auto",
    background: "transparent",
  },
  dragActive: {
    borderColor: 'rgb(120,120,120)',
  },
  progressBar: {
    fontSize: "18px",
    padding: "10px 0",
    width: "100%",
  },
};
import React from 'react';

import Utils from '../Utils/Utils';
import ApiRequest from '../Api/ApiRequest';
import CurrentUser from '../Stores/CurrentUser';

export default class PageInventory extends React.Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      authorized: true,
      user: this.props.user,
      pages: [],
    };

    this._onUserChange = this._onUserChange.bind(this);
  }

  componentWillMount() {
    this.stopUserSubscribe = CurrentUser.listen(this._onUserChange);
    this._loadPages();

    let user = CurrentUser.get();
    this.setState({
      authorized: !! user.id,
      user,
    });
  }

  componentWillUnmount() {
    this.stopUserSubscribe();
  }

  renderRow(page, index) {
    return (
      <tr key={'page-'+index}>
        <td><a href={"/admin/page-editor?id="+page.id}>{page.id}</a></td>
        <td><a href={"/admin/page-editor?id="+page.id}>{page.title}</a></td>
        <td>{page.status  ? 'Published' : ''}</td>
      </tr>
    );
  }

  render() {
    if (this.state.loading) return <h4>Loading...</h4>;
    if (! this.state.authorized) return <h4>Must be logged in :(</h4>;

    if (this.state.pages.length === 0) {
      return <h4>No pages available :(</h4>;
    }

    return (
      <table className="table table-striped table-hover">
        <tbody>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
          {this.state.pages.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    );
  }

  _loadPages() {
    ApiRequest.get('/pages')
      .send(res => {
        this.setState({
          loading: false,
          pages: res.data,
        });
      }, () => this.setState({loading: false}));
  }

  _onUserChange(user) {
    this.setState({authorized: !! user.id});
  }
}


var styles = {
  container: {},
};
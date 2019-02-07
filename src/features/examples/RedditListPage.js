import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchRedditList } from './redux/actions';

export class RedditListPage extends Component {
  static propTypes = {
    examples: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  render() {
    const { fetchRedditListPending, redditList, fetchRedditListError } = this.props.examples;
    const { fetchRedditList } = this.props.actions;

    return (
      <div className="examples-reddit-list-page">
        <h1>Reddit API Usage</h1>
        <p>This demo shows how to use Redux async actions to fetch data from Reddit's REST API.</p>
        <button className="btn-fetch-reddit" disabled={fetchRedditListPending} onClick={fetchRedditList}>
          {fetchRedditListPending ? 'Fetching...' : 'Fetch reactjs topics'}
        </button>
        {fetchRedditListError && (
          <div className="fetch-list-error">Failed to load: {fetchRedditListError.toString()}</div>
        )}
        {redditList.length > 0 ? (
          <ul className="examples-reddit-list">
            {redditList.map(item => (
              <li key={item.data.id}>
                <a href={item.data.url}>{item.data.title}</a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-items-tip">No items yet.</div>
        )}
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    examples: state.examples,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ fetchRedditList }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RedditListPage);

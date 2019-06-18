import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

const objectToQueryString = obj =>
  '?' +
  Object.keys(obj)
    .map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    })
    .join('&');

const initialState = {
  data: null,
  loading: true,
  headerEntries: null,
  error: null,
  processing: {},
};

class RestApiProvider extends Component {
  getChildContext() {
    let { base } = this.props;
    const cachedItems = {};
    const loadProcesses = {};
    const lastChar = base[base.length - 1];
    base = lastChar === '/' ? base : base + '/';
    const addItemData = (key, value) => (cachedItems[key].data = value);
    const addProcessItem = uri => (loadProcesses[uri] = true);
    const removeProcessItem = uri => (loadProcesses[uri] = false);
    const addItemHeaderEntries = (key, value) => {
      cachedItems[key] = {};
      cachedItems[key].headerEntries = value;
    };
    return {
      base,
      cache: {
        cachedItems,
        addItemData,
        addItemHeaderEntries,
        loadProcesses,
        addProcessItem,
        removeProcessItem,
      },
    };
  }

  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}

RestApiProvider.childContextTypes = {
  base: PropTypes.string,
  cache: PropTypes.object,
};

export class RestApiRequest extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    const { base, cache } = this.context;
    const { path, queryParams } = this.props;

    const queryString = Object.keys(queryParams).length
      ? objectToQueryString(queryParams)
      : '';

    const uri = base + path + queryString;
    if (cache && cache.cachedItems[uri]) {
      const response = cache.cachedItems[uri];
      this.setState(() => ({
        headerEntries: response.headerEntries,
        data: response.data,
        loading: false,
      }));
    } else {
      this.setState(
        () => initialState,
        () => {
          const { loadProcesses } = cache;
          if (loadProcesses[uri] === true) {
            let processChecker = null;

            const checkProcessStatus = () => {
              if (this.context.cache.loadProcesses[uri] === false) {
                if (this.state.loading === true) {
                  const response = this.context.cache.cachedItems[uri];
                  this.setState(() => ({
                    headerEntries: response.headerEntries,
                    data: response.data,
                    loading: false,
                  }));
                  clearInterval(processChecker);
                }
              }
            };
            processChecker = setInterval(checkProcessStatus, 250);
          } else {
            cache.addProcessItem(uri);
            fetch(uri)
              .then(response => {
                const { headers, ok } = response;
                if (ok === true) {
                  const headerEntries = [];

                  for (let pair of headers.entries()) {
                    const obj = {
                      key: pair[0],
                      value: pair[1],
                    };
                    headerEntries.push(obj);
                  }

                  this.setState(() => ({
                    headerEntries,
                  }));
                  cache.addItemHeaderEntries(uri, headerEntries);
                  return response.json();
                } else {
                  this.setState(() => ({
                    error: {
                      message:
                        'Error fetching: ' +
                        response.url +
                        ' ' +
                        response.status +
                        ' ' +
                        response.statusText,
                    },
                  }));
                }
              })
              .catch(error => {
                this.setState(() => ({ error }));
              })
              .then(data => {
                cache.removeProcessItem(uri);
                cache.addItemData(uri, data);
                this.setState(() => ({ data, loading: false }));
              })
              .catch(error => {
                this.setState(() => ({ error }));
              });
          }
        },
      );
    }
  }

  render() {
    return <Fragment>{this.props.children(this.state)}</Fragment>;
  }
}

RestApiRequest.contextTypes = {
  path: PropTypes.string,
  queryParams: PropTypes.object,
};

export default RestApiProvider;

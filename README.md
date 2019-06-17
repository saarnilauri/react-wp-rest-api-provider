# react-wp-rest-api-provider

React component with provider - consumer pattern, making it easy to pass data to you components.

## Installation

Install the package from npm.

`npm install -S react-wp-rest-api-provider`

## Usage

### Provider

Wrap your application with RestApiProvider component.

```
import RestApiProvider from 'react-wp-rest-api-provider'
const App = () => (
  <RestApiProvider base="/wp-json/wp/v2">
    <YourApp />
  </RestApiProvider>
)
```

### Consumer

Then inside your application where you need to request your data from rest API, use the RestApiRequest consumer component.

The component accepts two properties.

#### `path` property

A property defining rest API route.
This property should be given as a string. For example for getting default WordPress articles you sould give the value `"posts"`.

#### `queryParams` property

A property containg JSON object including desired query parameters.
For example to get 1st 10 posts you can give `{page: 1, per_page: 10}`. To know what paramaters can be used see the agrs defined for your endpoint using GET method.

#### Data from consumer

Wrap you presentational component with RestApiRequest consumer component. It returns 4 properties to it's children which you can use.
The properties are `data, headerEntries, loading, error`

- `data` is an array containing fetched data. For example post items.
- `headerEntries` contain headers from the response. See then Pagination section bellow.
- `loading` is a boolean value, indicating the status of the request.
- `error` is an object containing information about the error that might have occured during the request.

#### Example code

```
import { RestApiRequest } from 'react-wp-rest-api-provider'
const PostList = () => (
  <RestApiRequest path={'posts'} queryParams={{page: 1, per_page: 10}}>
    {({ data, headerEntries, loading, error }) => {

      if (error) return <p>Error</p>;
      if (loading) return <p>Loading...</p>;
      return (
          <YourPresentationalComponent
              data={data}
              headerEntries={headerEntries}
          />
      );
    }}
  </RestApiRequest>
)
```

## Pagination information

The reason I created this package is that most of existing packages with similar functionality did not support WordPress way of dealing with pagination. The pagination information is returned in the headers of the rest API response.
To get pagination information see the `x-wp-totalpages` and `x-wp-total` entries in the `headerEntries` returned by the component.

## Is this legacy code?

This project is done because sometimes you are limited to legacy way of doing things. If you are looking something more sexy see the [WPGraphQL](https://github.com/wp-graphql/wp-graphql) plugin and [Apollo Client](https://www.apollographql.com/docs/react/).

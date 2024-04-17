import React from "react";
import ReactDOM from "react-dom";
import { applyMiddleware, compose, combineReducers, createStore } from "redux";
import superagent from "superagent";
import { reducer as formReducer } from "redux-form";
import { Provider } from "react-redux";
import { thunk } from "redux-thunk";
import reduxPromise from "redux-promise-middleware";
import feathers from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import authentication from "@feathersjs/authentication-client";

import { user } from "./containers/UserOnboarding/duck";
import { map } from "./containers/Map/duck";
import { details } from "./containers/Details/duck";
import { editor } from "./containers/EntryForm/duck";
import { search } from "./containers/Search/duck";
import Search from "./containers/Search";
import AppRouter from "./AppRouter";
import withAuthentication from "./Authentication";

export const makeMap = (store) => {
  const AuthenticatedAppRouter = withAuthentication(AppRouter);
  return (
    <React.StrictMode>
      <div className="teikei-embed">
        <Provider store={store}>
          <AuthenticatedAppRouter dispatch={store.dispatch} />
        </Provider>
      </div>
    </React.StrictMode>
  );
};

export const makeSearchWidget = (store) => (
  <React.StrictMode>
    <div className="teikei-embed">
      <Provider store={store}>
        <Search countrySelection={false} useHashRouter={false} />
      </Provider>
    </div>
  </React.StrictMode>
);

export const makeClient = (apiUrl) => {
  const client = feathers();
  const restClient = rest(apiUrl).superagent(superagent);
  client.configure(restClient);
  client.configure(
    authentication({
      storage: window.localStorage,
    }),
  );
  return client;
};

export const render = (config, containerEl, makeComponentFunc) => {
  const reducer = combineReducers({
    user,
    map,
    details,
    editor,
    search,
    form: formReducer,
  });

  const enhancers = compose(
    // redux promise?
    applyMiddleware(thunk, reduxPromise),
    window.devToolsExtension ? window.devToolsExtension() : (f) => f,
  );

  const store = createStore(reducer, enhancers);

  // TODO migrate to createRoot with new map
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(makeComponentFunc(store), containerEl);
};

import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import {AppComponent} from './components/main'
import {PublicView} from './components/public_view'
import {LoginPage} from './components/login_page'


import {Router, browserHistory} from 'react-router'


const routes = {
  path: '/',
  component: AppComponent,
  indexRoute: {
    component: PublicView,
  },
  childRoutes: [
    {
      path: 'login',
      component: LoginPage,
    },
  ],
}


class MyRouter extends React.Component {

  render() {
    return <Router history={browserHistory} routes={routes} />
  }
}

// Render the main component into the dom.
ReactDOM.render(<MyRouter />, document.getElementById('app'))

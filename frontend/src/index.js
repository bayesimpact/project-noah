import 'core-js/fn/object/assign'
import React from 'react'
import ReactDOM from 'react-dom'
import {Router, browserHistory} from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import {AppComponent} from './components/main'
import {PublicView} from './components/public_view'
import {AdminView} from './components/admin_view'
import {LoginPage} from './components/login_page'


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
    {
      path: 'admin',
      component: AdminView,
    },
  ],
}


class MyRouter extends React.Component {

  render() {
    return <MuiThemeProvider>
      <Router history={browserHistory} routes={routes} />
    </MuiThemeProvider>
  }
}

// Render the main component into the dom.
ReactDOM.render(<MyRouter />, document.getElementById('app'))

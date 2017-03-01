require('normalize.css/normalize.css')
require('uswds/dist/css/uswds.css')

import injectTapEventPlugin from 'react-tap-event-plugin'
import React from 'react'

import {store} from 'store/firebase'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
  }

  componentWillMount() {
    // Needed for onTouchTap (http://stackoverflow.com/a/34015469/988941)
    injectTapEventPlugin()
    store.loginChanged(user => this.setState({user}))
  }

  state = {}

  render() {
    const {user} = this.state
    const {children} = this.props
    const appStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    const logoutButtonStyle = {
      position: 'absolute',
      top: 10,
      right: 10,
    }

    return (
      <div style={appStyle}>
        <header style={{fontSize: 36, padding: 20}}>
          Project Noah ⛵
        </header>
        <h2>This is going to be amazing!</h2>
        {user ? <button style={logoutButtonStyle} onTouchTap={store.logout}>
          logout
        </button> : null}
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}

export {AppComponent}

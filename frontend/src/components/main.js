require('normalize.css/normalize.css')

import injectTapEventPlugin from 'react-tap-event-plugin'
import React from 'react'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'

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
      fontFamily: 'Roboto',
    }
    return (
      <div style={appStyle}>
        <AppBar
            title="Project Noah ⛵"
            iconElementRight={user ? <FlatButton label="logout" /> : null} />
        <h2>This is going to be amazing!</h2>
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}

export {AppComponent}

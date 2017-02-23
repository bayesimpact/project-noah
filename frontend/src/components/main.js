require('normalize.css/normalize.css')

import injectTapEventPlugin from 'react-tap-event-plugin'
// Needed for onTouchTap (http://stackoverflow.com/a/34015469/988941)
injectTapEventPlugin()
import React from 'react'

import {store} from 'store/firebase'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
  }

  componentWillMount() {
    store.loginChanged(user => this.setState({user}))
  }

  state = {}

  render() {
    const {children} = this.props
    const appStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    return (
      <div style={appStyle}>
        <h1>Project Noah ⛵</h1>
        <h2>This is going to be amazing!</h2>
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}

export {AppComponent}

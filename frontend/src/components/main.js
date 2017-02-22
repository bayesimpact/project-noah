require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'


class AppComponent extends React.Component {
  render() {
    const appStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    return (
      <div style={appStyle}>
        <h1>Agile Prototype!</h1>
        <h2>This is going to be amazing!</h2>
      </div>
    )
  }
}

export default AppComponent

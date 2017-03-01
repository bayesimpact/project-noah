require('normalize.css/normalize.css')
require('uswds/dist/css/uswds.css')

import injectTapEventPlugin from 'react-tap-event-plugin'
import React from 'react'
import {browserHistory} from 'react-router'

import {store} from 'store/firebase'


class AppComponent extends React.Component {
  static propTypes = {
    children: React.PropTypes.element,
    location: React.PropTypes.object.isRequired,
  }

  componentWillMount() {
    // Needed for onTouchTap (http://stackoverflow.com/a/34015469/988941)
    injectTapEventPlugin()
    store.loginChanged(user => this.setState({user}))
  }

  state = {}

  render() {
    const {user} = this.state
    const {children, location} = this.props
    const headerStyle = {
      height: 80,
      paddingLeft: 37,
      fontSize: 20,
      color: '#fff',
      backgroundColor: '#112e51',
      display: 'flex',
      alignItems: 'center',
    }
    const menuStyle = {
      height: '100%',
      zIndex: 2,
    }
    return (
      <div>
        <header style={headerStyle}>
          <span>Project Noah ⛵</span>
          <span style={{flex: 1}} />
          {user ?
            <Menu style={menuStyle} user={user} path={location.pathname} /> :
            <button onClick={() => browserHistory.push('/login')} style={{marginRight: 20}}>
              Log in or sign up to receive alerts
            </button>}
        </header>
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}

class Menu extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
    path: React.PropTypes.string.isRequired,
    style: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    const {user} = this.props
    if (user) {
      store.getUserIsAdmin(user, isAdmin => this.setState({isAdmin}))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      store.getUserIsAdmin(nextProps.user, isAdmin => this.setState({isAdmin}))
    }
  }

  handleViewChangeClick = () => {
    const {path} = this.props
    browserHistory.push(path === '/' ? '/admin' : '/')
    this.setState({isExpanded: false})
  }

  state = {
    isAdmin: false,
    isExpanded: false,
  }

  render() {
    const {path, user, style} = this.props
    const {isAdmin, isExpanded} = this.state
    const menuStyle = {
      position: 'relative',
      fontSize: 15,
      ...style,
    }
    const menuItemCommon = {
      padding: '0 30px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
    const menuItemStyle = {
      backgroundColor: '#fff',
      color: '#212121',
      height: 59,
      marginTop: 2,
      ...menuItemCommon,
    }
    const menuToggleStyle = {
      height: '100%',
      borderLeft: '1px solid #fff',
      backgroundColor: isExpanded ? '#fff' : 'inherit',
      color: isExpanded ? menuItemStyle.color : 'inherit',
      ...menuItemCommon,
    }
    return <div style={menuStyle}>
      <div style={menuToggleStyle} onClick={() => this.setState({isExpanded: !isExpanded})}>
        <span>{user.displayName}</span>
        <span style={{marginLeft: 10}}>{isExpanded ? '△' : '▽'}</span>
      </div>
      {isExpanded ? <div style={{position: 'absolute', top: '100%', left: 0, right: 0}}>
        {isAdmin ? <div style={menuItemStyle} onClick={this.handleViewChangeClick}>
          {path === '/' ? 'Admin View' : 'Public View'}
        </div> : null}
        <div style={menuItemStyle} onClick={store.logout}>logout</div>
      </div> : null}
    </div>
  }
}


export {AppComponent}

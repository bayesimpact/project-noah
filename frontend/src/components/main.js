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
    return (
      <div>
        <header style={headerStyle}>
          <span>Project Noah ⛵</span>
          <span style={{flex: 1}} />
          {user ? <Menu user={user} page={location.pathname === '/' ? 'public' : 'admin'} /> : null}
        </header>
        {children && React.cloneElement(children, this.state)}
      </div>
    )
  }
}

class Menu extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
    page: React.PropTypes.string.isRequired,
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
    const {page} = this.props
    browserHistory.push(page === 'public' ? '/admin' : '/')
    this.setState({isExpanded: false})
  }

  state = {
    isAdmin: false,
    isExpanded: true,
  }

  render() {
    const {page, user} = this.props
    const {isAdmin, isExpanded} = this.state
    const menuStyle = {
      position: 'relative',
      height: '100%',
      fontSize: 15,
      zIndex: 10,
    }
    const menuItemCommon = {
      padding: '0 30px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
    const menuToggleStyle = {
      height: '100%',
      borderLeft: '1px solid #fff',
      backgroundColor: isExpanded ? '#fff' : 'inherit',
      color: isExpanded ? '#212121' : 'inherit',
      ...menuItemCommon,
    }
    const menuItemStyle = {
      backgroundColor: '#fff',
      color: '#212121',
      height: 59,
      marginTop: 2,
      ...menuItemCommon,
    }
    return <div style={menuStyle}>
      <div style={menuToggleStyle} onClick={() => this.setState({isExpanded: !isExpanded})}>
        <span>{user.displayName}</span>
        <span style={{marginLeft: 10}}>{isExpanded ? '△' : '▽'}</span>
      </div>
      {isExpanded ? <div style={{position: 'absolute', top: '100%', width: '100%'}}>
        {isAdmin ? <div style={menuItemStyle} onClick={this.handleViewChangeClick}>
          {page === 'public' ? 'Admin View' : 'Public View'}
        </div> : null}
        <div style={menuItemStyle} onClick={store.logout}>logout</div>
      </div> : null}
    </div>
  }
}


export {AppComponent}

import React from 'react'
import {Marker, Popup} from 'react-mapbox-gl'
import turfInside from '@turf/inside'
import turf from '@turf/helpers'

import {store} from 'store/firebase'
import {HazardMap} from 'components/map'


// Center of the US (lng, lat).
const START_LOCATION = [-96.328530, 38.321018]


class AdminView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getUserProfiles(userProfiles => {
      this.setState({userProfiles}, this.computeProximity)
    })
    store.getHazards(({groupedHazards, hazardColorMapping, hazards}) => {
      this.setState({groupedHazards, hazardColorMapping, hazards})
    })
  }

  state = {
    zoomLevel: 4,
    openedHazard: null,
    groupedHazards: null,
    hazards: null,
    hazardColorMapping: null,
    userProfiles: null,
  }

  render() {
    const {groupedHazards, hazardColorMapping,
      openedHazard, userProfiles, zoomLevel, hazards} = this.state
    const mapboxContainerStyle = {
      // 80px is the height of the global header.
      height: 'calc(100vh - 80px)',
      width: '100vw',
    }
    const markerStyle = {
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: '#E0E0E0',
      border: '2px solid #C9C9C9',
    }

    let usersInOpenedHazard
    if (openedHazard) {
      const hazardPoly = turf.polygon([openedHazard.geometry.coordinates])
      usersInOpenedHazard = Object.values(userProfiles).filter(userProfile => {
        var userPoint = turf.point(userProfile.location)
        return turfInside(userPoint, hazardPoly)
      })
    }
    return (
      <div>
        <HazardMap
            style={mapboxContainerStyle}
            center={START_LOCATION} zoom={[zoomLevel]}
            onZoom={map => this.setState({zoomLevel: map.getZoom()})}
            onHazardClick={hazardId => this.setState({openedHazard: hazards[hazardId]})}
            groupedHazards={groupedHazards} hazardColorMapping={hazardColorMapping}>
          {Object.keys(userProfiles || []).map(userId => {
            return <Marker
                key={userId} style={markerStyle}
                coordinates={userProfiles[userId].location} />
          })}
          {openedHazard ?
            <NotificationPopup
                onClose={() => this.setState({openedHazard: null})}
                users={usersInOpenedHazard} hazard={openedHazard} /> : null}
        </HazardMap>
      </div>
    )
  }
}


class NotificationPopup extends React.Component {
  static propTypes = {
    hazard: React.PropTypes.object.isRequired,
    onClose: React.PropTypes.func,
    users: React.PropTypes.array.isRequired,
  }

  componentWillMount() {
    this.setNotificationTextFromProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.setNotificationTextFromProps(nextProps)
  }

  setNotificationTextFromProps(props) {
    const {hazard} = props
    const hazardName = hazard.properties.prod_type
    this.setState({
      notificationText: `You are in the area of a '${hazardName}'. Move to a safe location now!`,
    })
  }

  handleSendWarning(usersInProximity) {
    if (!usersInProximity) {
      return
    }
    const {notificationText} = this.state
    store.sendWarning(usersInProximity, notificationText)
    this.setState({sendingMessage: 'Sending…'})
    setTimeout(() => {
      this.setState({sendingMessage: 'Warning sent!'})
      setTimeout(() => {
        this.setState({sendingMessage: ''})
      }, 3000)
    }, 3000)
  }

  state = {
    notificationText: '',
    sendingMessage: '',
  }

  render() {
    const {hazard, onClose, users} = this.props
    const {notificationText, sendingMessage} = this.state
    const popupStyle = {
      padding: '0 30px 30px 30px',
      position: 'relative',
    }
    const lineStyle = {
      border: 0,
      height: 0,
      borderBottom: '1px solid #f1f1f1',
      margin: '15px 0',
    }
    const textareaStyle = {
      border: 'solid 1px #d6d7d9',
      borderRadius: 4,
      color: '#313131',
      fontStyle: 'italic',
      height: 100,
      marginBottom: 20,
      width: 280,
    }
    const closeButtonStyle = {
      cursor: 'pointer',
      fontSize: 18,
      position: 'absolute',
      right: 10,
      top: -30,
    }
    return (
      <Popup anchor="bottom" coordinates={hazard.properties.center[0]}>
        <div style={popupStyle}>
          {onClose ? <div onClick={onClose} style={closeButtonStyle}>x</div> : null}
          <h3>{hazard.properties.prod_type}</h3>
          <hr style={lineStyle} />
          <div style={{display: 'flex', fontSize: 15}}>
            <div><b>Affected Noah users</b></div>
            <div style={{flex: 1}} />
            <div>{users.length}</div>
          </div>
          <hr style={lineStyle} />

          <label htmlFor="notice-text">Warn message</label>
          <textarea
              value={notificationText}
              onChange={event => this.setState({notificationText: event.target.value})}
              style={textareaStyle} id="notice-text" name="notice-text" />

          <button
              disabled={!users.length} className={users.length ? '' : 'usa-button-disabled'}
              onClick={() => this.handleSendWarning(users)}>
            {sendingMessage || 'Warn them now'}
          </button>
        </div>
      </Popup>
    )
  }
}


export {AdminView}

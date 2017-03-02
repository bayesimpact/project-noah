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
            <NotificationPopup users={usersInOpenedHazard} hazard={openedHazard} /> : null}
        </HazardMap>
      </div>
    )
  }
}


class NotificationPopup extends React.Component {
  static propTypes = {
    hazard: React.PropTypes.object.isRequired,
    users: React.PropTypes.array.isRequired,
  }

  handleSendWarning(usersInProximity) {
    store.sendWarning(usersInProximity)
    this.setState({sendingMessage: 'Sending…'})
    setTimeout(() => {
      this.setState({sendingMessage: 'Warning sent!'})
      setTimeout(() => {
        this.setState({sendingMessage: ''})

      }, 3000)
    }, 3000)
  }

  state = {
    sendingMessage: '',
  }

  render() {
    const {hazard, users} = this.props
    const {sendingMessage} = this.state
    return (
      <Popup anchor="bottom" coordinates={hazard.properties.center[0]}>
        <h3>{hazard.properties.prod_type}</h3>
        <div>Affected people {users.length}</div>
        <button onClick={() => this.handleSendWarning(users)}>
          {sendingMessage || 'Warn them now'}
        </button>
      </Popup>
    )
  }
}


export {AdminView}

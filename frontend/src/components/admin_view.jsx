import React from 'react'
import {Marker} from 'react-mapbox-gl'
import haversine from 'haversine'
import Dialog from 'material-ui/Dialog'

import {store} from 'store/firebase'
import {HazardMap} from 'components/map'


// Center of the US (lng, lat).
const START_LOCATION = [-96.328530, 38.321018]
const PROXIMITY_THRESHOLD = 50


class AdminView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getUserProfiles(userProfiles => {
      this.setState({userProfiles}, this.computeProximity)
    })
    store.getHazards(({groupedHazards, hazardColorMapping}) => {
      this.setState({groupedHazards, hazardColorMapping})
    })
  }

  state = {
    zoomLevel: 4,
    openedHazard: null,
    groupedHazards: null,
    hazardColorMapping: null,
  }

  render() {
    const {groupedHazards, hazardColorMapping, openedHazard, userProfiles, zoomLevel} = this.state
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
    let usersInProximityToOpenedHazard = []
    if (openedHazard !== null && this.hazardProximity) {
      usersInProximityToOpenedHazard = (this.hazardProximity[openedHazard] || []).map(userId => {
        return userProfiles[userId]
      })
    }
    return (
      <div>
        <UserAlertDialog
            onClose={() => this.setState({openedHazard: null})}
            open={openedHazard !== null}
            usersInProximity={usersInProximityToOpenedHazard} />
        <HazardMap
            style={mapboxContainerStyle}
            center={START_LOCATION}
            onZoom={map => this.setState({zoomLevel: map.getZoom()})}
            zoom={[zoomLevel]}
            groupedHazards={groupedHazards} hazardColorMapping={hazardColorMapping}>
          {Object.keys(userProfiles || []).map(userId => {
            return <Marker
                key={userId} style={markerStyle}
                coordinates={userProfiles[userId].location} />
          })}
        </HazardMap>
      </div>
    )
  }
}


class UserAlertDialog extends React.Component {
  static propTypes = {
    onClose: React.PropTypes.func.isRequired,
    open: React.PropTypes.bool,
    usersInProximity: React.PropTypes.array,
  }

  handleSendWarning(usersInProximity) {
    store.sendWarning(usersInProximity)
    this.setState({isSending: true})
    setTimeout(() => this.setState({isSending: false}), 3000)
  }

  state = {
    isSending: false,
  }

  render() {
    const {isSending} = this.state
    const {onClose, open, usersInProximity} = this.props
    return (
      <Dialog title="Hazard information" modal={true} open={open}>
        <div>
          {(usersInProximity || []).length}
          people in proximity
        </div>
        <div>
          <h2>Warn them!</h2>
          {isSending ?
            <span>sending...</span> :
            <button onClick={() => this.handleSendWarning(usersInProximity)}>
              Send warning to all of them
            </button>}
        </div>
        <button onClick={onClose}>close</button>
      </Dialog>
    )
  }
}



export {AdminView}

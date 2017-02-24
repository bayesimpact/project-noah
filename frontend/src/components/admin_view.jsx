import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'
import haversine from 'haversine'
import Dialog from 'material-ui/Dialog'

import config from 'config'
import {store} from 'store/firebase'


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
    store.getHazards(hazards => {
      this.setState({hazards}, this.computeProximity)
    })
  }

  distanceBetweenCoordinatesKm(coord1, coord2) {
    return haversine(
      {longitude: coord1[0], latitude: coord1[1]},
      {longitude: coord2[0], latitude: coord2[1]},
      {unit: 'meter'}) / 1000
  }

  // TODO: Move this computation to database using geofire-js.
  computeProximity() {
    const {hazards, userProfiles} = this.state
    const hazardProximity = {}
    if (!hazards || !userProfiles) {
      return
    }
    for (var i = 0; i < (hazards || []).length; i++) {
      for (var userId in userProfiles) {
        const distKm = this.distanceBetweenCoordinatesKm(hazards[i], userProfiles[userId].location)
        if (distKm < PROXIMITY_THRESHOLD) {
          hazardProximity[i] = (hazardProximity[i] || []).concat([userId])
        }
      }
    }
    this.hazardProximity = hazardProximity
  }

  state = {
    zoomLevel: 4,
    openedHazard: null,
  }

  render() {
    const {hazards, hoveredHazard, openedHazard, userProfiles, zoomLevel} = this.state
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    const markerStyle = {
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: '#E0E0E0',
      border: '2px solid #C9C9C9',
    }
    return (
      <div>
        <h1>Welcome Admin</h1>
        <h2>
          Hover over the hazards to highlight people in its proximity ({PROXIMITY_THRESHOLD} Km)
        </h2>
        <Dialog title="Hazard information" modal={true} open={!!openedHazard}>
          <div>
            {this.hazardProximity && (this.hazardProximity[openedHazard] || []).length}
            people in proximity
          </div>
          <button onClick={() => this.setState({openedHazard: null})}>close</button>
        </Dialog>
        <ReactMapboxGl
            style="mapbox://styles/mapbox/streets-v8"
            accessToken={config.mapboxAccessToken}
            center={START_LOCATION}
            containerStyle={mapboxContainerStyle}
            onZoom={map => this.setState({zoomLevel: map.getZoom()})}
            zoom={[zoomLevel]}>
          {Object.keys(userProfiles || []).map(userId => {
            const isInProximity = this.hazardProximity &&
              hoveredHazard !== null &&
              (this.hazardProximity[hoveredHazard] || []).includes(userId)
            return <Marker
                key={userId} coordinates={userProfiles[userId].location}
                style={{...markerStyle, backgroundColor: isInProximity ? 'red' : '#E0E0E0'}} />
          })}
          <Layer type="symbol" id="hazards" layout={{'icon-image': 'fire-station-15'}}>
            {(hazards || []).map((coordinates, i) => {
              return <Marker
                  key={i} coordinates={coordinates}
                  onHover={() => this.setState({hoveredHazard: i})}
                  onEndHover={() => this.setState({hoveredHazard: null})}
                  onClick={() => this.setState({openedHazard: i})} />
            })}
          </Layer>
        </ReactMapboxGl>
      </div>
    )
  }
}

export {AdminView}

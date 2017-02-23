import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'

import config from 'config'
import {store} from 'store/firebase'


// Center of the US.
const START_LOCATION = [-96.328530, 38.321018]


class AdminView extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
  };

  componentWillMount() {
    store.getUserProfiles(userProfiles => this.setState({userProfiles}))
    store.getHazards(hazards => this.setState({hazards}))
  }

  state = {}

  render() {
    const {hazards, userProfiles} = this.state
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    return (
      <div>
        <h1>Welcome Admin</h1>
        <ReactMapboxGl
            style="mapbox://styles/mapbox/streets-v8"
            accessToken={config.mapboxAccessToken}
            center={START_LOCATION}
            containerStyle={mapboxContainerStyle}
            zoom={[4]}>
          <Layer type="symbol" id="users" layout={{'icon-image': 'marker-15'}}>
            {(userProfiles || []).map((userProfile, i) => {
              return <Marker key={i} coordinates={userProfile.location} />
            })}
          </Layer>
          <Layer type="symbol" id="hazards" layout={{'icon-image': 'fire-station-15'}}>
            {(hazards || []).map((coordinates, i) => <Marker key={i} coordinates={coordinates} />)}
          </Layer>
        </ReactMapboxGl>
      </div>
    )
  }
}

export {AdminView}

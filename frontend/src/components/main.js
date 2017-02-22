require('normalize.css/normalize.css')
require('styles/App.css')

import React from 'react'
import ReactMapboxGl, {Layer, Marker} from 'react-mapbox-gl'

import config from 'config'


class AppComponent extends React.Component {

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(location => {
      this.setState({location: [location.coords.longitude, location.coords.latitude]})
    })
  }

  state = {
    location: [-0.481747846041145, 51.3233379650232],
  }

  render() {
    const {location} = this.state
    const appStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }
    const mapboxContainerStyle = {
      height: '100vh',
      width: '100vw',
    }
    return (
      <div style={appStyle}>
        <h1>Agile Prototype!</h1>
        <h2>This is going to be amazing!</h2>
        <ReactMapboxGl
          style="mapbox://styles/mapbox/streets-v8"
          accessToken={config.mapboxAccessToken}
          center={location}
          containerStyle={mapboxContainerStyle}>
          <Layer
              type="symbol"
              id="marker"
              layout={{'icon-image': 'marker-15'}}>
            <Marker coordinates={location} />
          </Layer>
        </ReactMapboxGl>
      </div>
    )
  }
}


export default AppComponent

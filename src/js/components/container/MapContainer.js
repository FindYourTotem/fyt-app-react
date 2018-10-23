import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

class LeafletMap extends Component {
	constructor(props) {
		super(props);

		this.state = {
	    lat: 28.537733,
	    lng: -81.402409,
	    zoom: 17,
  	}
	}

	componentDidMount() {
		console.log(this.map);
	}

  render() {
  	const position = [this.state.lat, this.state.lng];

    return (
      <Map center={position} zoom={this.state.zoom} ref={(map) => {this.map = map}}>
        <TileLayer
          attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </Map>
    );
  }
}

export default LeafletMap;
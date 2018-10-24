import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

class LeafletMap extends Component {
	constructor(props) {
		super(props);

		this.state = {
	    lat: 28.537833,
	    lng: -81.399609,
	    zoom: 17,
  	}
	}

	componentDidMount() {
		console.log(this.map);
	}

  render() {
  	const position = [this.state.lat, this.state.lng];
  	const stages = {
  		circuitGROUNDS: {lat: 28.536933, lng: -81.399709},
  		neonGARDEN: {lat: 28.536033, lng: -81.401809},
  		kineticFIELD: {lat: 28.539833, lng: -81.404609},
  	};

    return (
      <Map center={position} zoom={this.state.zoom} ref={(map) => {this.map = map}}>
        <TileLayer
          attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[stages.circuitGROUNDS.lat, stages.circuitGROUNDS.lng]}>
          <Popup>
            circuitGROUNDS
          </Popup>
        </Marker>
        <Marker position={[stages.neonGARDEN.lat, stages.neonGARDEN.lng]}>
          <Popup>
            neonGARDEN
          </Popup>
        </Marker>
        <Marker position={[stages.kineticFIELD.lat, stages.kineticFIELD.lng]}>
          <Popup>
            kineticFIELD
          </Popup>
        </Marker>
      </Map>
    );
  }
}

export default LeafletMap;
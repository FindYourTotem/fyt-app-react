import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { tealTotem, pinkTotem, blueTotem } from '../Bundler';

var _ = require("lodash");

const cameras = {
  "deeplens_DUkF8LPsR3OTIuCucy2vDQ": "circuitGROUNDS",
  "deeplens_7how6uNkTuGL0A4XA-dk8g": "neonGARDEN",
  "camera_4": "kineticFIELD"
};

const stages = {
  circuitGROUNDS: {lat: 28.536933, lng: -81.399709},
  neonGARDEN: {lat: 28.536033, lng: -81.401809},
  kineticFIELD: {lat: 28.539833, lng: -81.404609},
};

class LeafletMap extends Component {
	constructor(props) {
		super(props);

		this.state = {
	    lat: 28.537833,
	    lng: -81.399609,
	    zoom: 17,
      totems: {
        circuitGROUNDS: [],
        neonGARDEN: [],
        kineticFIELD: []
      },
      totemsWithCoords: {
        circuitGROUNDS: [],
        neonGARDEN: [],
        kineticFIELD: []
      }
  	}

    this.refreshMap = this.refreshMap.bind(this);
    this.generateTotemLocation = this.generateTotemLocation.bind(this);
    this.buildTotemMarker = this.buildTotemMarker.bind(this);
    this.getRandomCoord = this.getRandomCoord.bind(this);
    this.getS3Url = this.getS3Url.bind(this);
	}

  getRandomCoord(base, variation, offset = 0) {
    return base + (Math.random() * variation) - offset;
  }

  generateTotemLocation(stage) {
    switch(stage) {
      case "circuitGROUNDS":
        return [this.getRandomCoord(stages.circuitGROUNDS.lat, .0003, .0003), this.getRandomCoord(stages.circuitGROUNDS.lng, -.0015)];
      case "neonGARDEN":
        return [this.getRandomCoord(stages.neonGARDEN.lat, .0005), this.getRandomCoord(stages.neonGARDEN.lng, -.001)];
      case "kineticFIELD":
        return [this.getRandomCoord(stages.kineticFIELD.lat, -.0015), this.getRandomCoord(stages.kineticFIELD.lng, .0005, .0005)];
      default:
        return [this.state.lat, this.state.lng];
    }
  }

  buildTotemMarker(totem) {
    var i = Math.floor(Math.random() * 3);
    var pins = [tealTotem, pinkTotem, blueTotem];

    return (
      <Marker icon={pins[i]} key={totem.totem_id} position={this.generateTotemLocation(cameras[totem.deeplens_id])}>
        <Popup>
          <div className="map-popup">
            <img className="map-popup-image" src={this.getS3Url(totem)}/>
            <div>
              <div className="map-popup-stage-name">{cameras[totem.deeplens_id]}</div>
              <div className="map-popup-totem-name">{totem.totem_id}</div>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }

  getS3Url(item) {
    return "https://s3.amazonaws.com/" + item.s3_bucket + "/" + item.s3_key;
  }

  refreshMap() {
    console.log("Refreshing map...");

    fetch('data/dynamo/map')
      .then(res => res.json())
      .then(json => {
        const map = JSON.parse(json.map_state);
        var totems = {
          circuitGROUNDS: [],
          neonGARDEN: [],
          kineticFIELD: []
        };
        for (var key in map) {
          const stage = cameras[key];
          if (stage !== undefined) {
            if (totems[cameras[key]] !== undefined) {
              totems[cameras[key]] = map[key];
            }
          }
        }
        if (!_.isEqual(totems, this.state.totems)) {
          this.setState({totems: totems});
        }
      });
  }

  componentWillMount() {
    this.refreshMap();
  }

	componentDidMount() {
    this.timer = setInterval(() => this.refreshMap(), 5000);
	}

  render() {
  	const position = [this.state.lat, this.state.lng];

    return (
      <Map center={position} zoom={this.state.zoom} ref={(map) => {this.map = map}}>
        <TileLayer
          attribution="Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
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
        {this.state.totems.circuitGROUNDS.size === 0 ? null : this.state.totems.circuitGROUNDS.map(totem => this.buildTotemMarker(totem))}
        {this.state.totems.neonGARDEN.size === 0 ? null : this.state.totems.neonGARDEN.map(totem => this.buildTotemMarker(totem))}
        {this.state.totems.kineticFIELD.size === 0 ? null : this.state.totems.kineticFIELD.map(totem => this.buildTotemMarker(totem))}
      </Map>
    );
  }
}

export default LeafletMap;
import React, { Component } from "react";
import { Map, ImageOverlay, TileLayer, Marker, Popup } from 'react-leaflet';
import { tealTotem, pinkTotem, blueTotem } from '../Bundler';

var map_cropped = require("../../../res/map_cropped.png");
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
    this.reconcileMap = this.reconcileMap.bind(this);
    this.generateTotemLocation = this.generateTotemLocation.bind(this);
    this.buildTotemMarker = this.buildTotemMarker.bind(this);
    this.buildTotemPopup = this.buildTotemPopup.bind(this);
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
    return (
      <Marker icon={totem.icon} key={totem.totem_id} position={totem.coords} ref={(marker) => {
          if (totem.isMostRecent) {
            marker.leafletElement.openPopup();      
          }
        }}
        totem={totem}>
        {this.buildTotemPopup(totem)}
      </Marker>
    );
  }

  buildTotemPopup(totem) {
    return (
      <Popup>
        <div className="map-popup">
          <img className="map-popup-image" src={this.getS3Url(totem)}/>
          <div>
            <div className="map-popup-stage-name">{cameras[totem.deeplens_id]}</div>
            <div className="map-popup-totem-name">{totem.totem_id}</div>
          </div>
        </div>
      </Popup>
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
        for (var stage in totems) {
          for (var totem in totems[stage]) {
            var i = Math.floor(Math.random() * 3);
            var pins = [tealTotem, pinkTotem, blueTotem];
            totems[stage][totem].icon = pins[i];
            totems[stage][totem].coords = this.generateTotemLocation(stage);

          }
        }
        this.setState({totems: this.reconcileMap(this.state.totems, totems)});
      });
  }

  reconcileMap(previousMap, newMap) {
    var differences = {
      circuitGROUNDS: [],
      neonGARDEN: [],
      kineticFIELD: []
    };
    if (_.isEqual(differences, previousMap)) {
      return newMap;
    }

    function totemIsPresent(newTotem, otherStage) {
      for (var j in otherStage) {
        var totem = otherStage[j];
        if (newTotem.totem_id === totem.totem_id
          && newTotem.s3_bucket === totem.s3_bucket
          && newTotem.s3_key === totem.s3_key
          && newTotem.rekognition_time === totem.rekognition_time) {
          return true;
        }
      }
      return false;
    }

    var mostRecentTotem = "";

    // Add new totems
    for (var stage in differences) {
      var map1Stage = previousMap[stage];
      var map2Stage = newMap[stage];

      for (var i in map2Stage) {
        var newTotem = map2Stage[i];
        if (!totemIsPresent(newTotem, map1Stage)) {
          differences[stage].push(newTotem);
          mostRecentTotem = newTotem.totem_id;
        }
      }

      // Remove old totems
      for (var i in map1Stage) {
        var totem = map1Stage[i];
        if (totemIsPresent(totem, map2Stage)) {
          differences[stage].push(totem);
        }
      }
    }

    for (var stage in differences) {
      for (var totem in differences[stage]) {
        var totem = differences[stage][totem];
        totem.isMostRecent = (mostRecentTotem === totem.totem_id);
      }
    }
    return differences;
  }

  componentWillMount() {
    this.refreshMap();
  }

	componentDidMount() {
    this.timer = setInterval(() => {
      this.refreshMap();
    }, 5000);
	}

  render() {
  	const position = [this.state.lat, this.state.lng];

    return (
      <Map center={position} zoom={this.state.zoom} ref={(map) => {this.map = map}}>
        <TileLayer
          attribution="Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          opacity={0.4}
        />
        <ImageOverlay
        	url = {map_cropped}
        	bounds={[[28.5404900,-81.4057600], [28.535375, -81.399075]]}
        	opacity={0.45}
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
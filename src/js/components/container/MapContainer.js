import React, { Component } from "react";
import { Map, ImageOverlay, TileLayer, Marker, Popup } from 'react-leaflet';
import { tealTotem, pinkTotem, blueTotem } from '../Bundler';

var festival_map = require("../../../res/festival_map.png");
var _ = require("lodash");

const cameras = {
  "deeplens_3acGkRAKQs6P8oQK-s3CkA": "neonGARDEN",
  "deeplens_q0a9bL0DQsWsa9ZHT6tcCw": "neonGARDEN",
  "deeplens_NHry9HuHTsKtkZ3cnwwCzA": "carnivalSQUARE",
  "deeplens_X2wf7yRYRMGS3BUXK1sRlw": "carnivalSQUARE",
  "deeplens_E5oVvr_4SgGJG20pXTfVdA": "circuitGROUNDS",
  "deeplens__WQ7e4RZSti6WXrnc3dmmg": "circuitGROUNDS",
};

const stages = {
  circuitGROUNDS: {lat: 28.537275, lng: -81.401365},
  neonGARDEN: {lat: 28.537075, lng: -81.402250},
  carnivalSQUARE: {lat: 28.537350, lng: -81.404150},
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
        carnivalSQUARE: []
      },
      totemsWithCoords: {
        circuitGROUNDS: [],
        neonGARDEN: [],
        carnivalSQUARE: []
      }
    }

    this.refreshMap = this.refreshMap.bind(this);
    this.reconcileMap = this.reconcileMap.bind(this);
    this.generateTotemLocation = this.generateTotemLocation.bind(this);
    this.buildTotemMarker = this.buildTotemMarker.bind(this);
    this.buildTotemPopup = this.buildTotemPopup.bind(this);
    this.getRandomCoord = this.getRandomCoord.bind(this);
    this.getS3Url = this.getS3Url.bind(this);
    this.formatTimestamp = this.formatTimestamp.bind(this);
  }

  getRandomCoord(base, variation, offset = 0) {
    return base + (Math.random() * variation) - offset;
  }

  generateTotemLocation(stage) {
    switch(stage) {
      case "circuitGROUNDS":
        return [this.getRandomCoord(stages.circuitGROUNDS.lat, .0005, .0001), this.getRandomCoord(stages.circuitGROUNDS.lng, -.0005)];
      case "neonGARDEN":
        return [this.getRandomCoord(stages.neonGARDEN.lat, .001, .0005), this.getRandomCoord(stages.neonGARDEN.lng, -.0002, .0001)];
      case "carnivalSQUARE":
        return [this.getRandomCoord(stages.carnivalSQUARE.lat, .0008, .0003), this.getRandomCoord(stages.carnivalSQUARE.lng, .0005, .00025)];
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
            <div className="map-popup-totem-name">
            {
              totem.totem_id.replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(name) { return name.toUpperCase()})
            }
            <span className="map-popup-totem-divider">{" | "}</span>
            <span className="map-popup-timestamp">{this.formatTimestamp(totem.rekognition_time)}</span>
            </div>
          </div>
        </div>
      </Popup>
    );
  }

  getS3Url(item) {
    return "https://s3.amazonaws.com/" + item.s3_bucket + "/" + item.s3_key;
  }

  formatTimestamp(rekognition_time) {
    var d = new Date(rekognition_time);
    var hours = d.getHours() - 5;
    var ampm = "AM";
    if (hours >= 12) {
      ampm = "PM";
      if (hours > 12) {
        hours -= 12;
      }
    }
    return hours + ":" + d.getMinutes() + ":" + d.getSeconds() + " " + ampm;
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
          carnivalSQUARE: []
        };
        for (var key in map) {
          const stage = cameras[key];
          if (stage !== undefined) {
            if (totems[cameras[key]] !== undefined) {
              for (var totem in map[key]) {
                totems[cameras[key]].push(map[key][totem]);
              }
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
      carnivalSQUARE: []
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
        	url = {festival_map}
        	bounds={[[28.5404900,-81.4057600], [28.535375, -81.399075]]}
        	opacity={0.45}
        />
        <Marker position={[stages.circuitGROUNDS.lat, stages.circuitGROUNDS.lng]}>
          <Popup>
            <div className="map-popup">
              <span className="stage-popup">circuitGROUNDS</span>
            </div>
          </Popup>
        </Marker>
        <Marker position={[stages.neonGARDEN.lat, stages.neonGARDEN.lng]}>
          <Popup>
            <div className="map-popup">
              <span className="stage-popup">neonGARDEN</span>
            </div>
          </Popup>
        </Marker>
        <Marker position={[stages.carnivalSQUARE.lat, stages.carnivalSQUARE.lng]}>
          <Popup>
            <div className="map-popup">
              <span className="stage-popup">carnivalSQUARE</span>
            </div>
          </Popup>
        </Marker>
        {this.state.totems.circuitGROUNDS.size === 0 ? null : this.state.totems.circuitGROUNDS.map(totem => this.buildTotemMarker(totem))}
        {this.state.totems.neonGARDEN.size === 0 ? null : this.state.totems.neonGARDEN.map(totem => this.buildTotemMarker(totem))}
        {this.state.totems.carnivalSQUARE.size === 0 ? null : this.state.totems.carnivalSQUARE.map(totem => this.buildTotemMarker(totem))}
      </Map>
    );
  }
}

export default LeafletMap;

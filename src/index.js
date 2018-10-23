import React from "react";
import ReactDOM from "react-dom"; 

import Root from "./js/components/container/Root";
import './css/app.css'

import { MapContainer } from './js/components/Bundler';

const wrapper = document.getElementById("root");
ReactDOM.render(<Root />, wrapper);

ReactDOM.render(<MapContainer/>, document.getElementById('leaflet-background-map'));
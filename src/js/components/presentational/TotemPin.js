import L from 'leaflet';

const tealTotem = new L.Icon({
    iconUrl: require("../../../res/teal-pin.svg"),
    iconRetinaUrl: require("../../../res/teal-pin.svg"),
    iconSize: new L.Point(36, 36),
    className: 'totem-icon'
});

const pinkTotem = new L.Icon({
    iconUrl: require("../../../res/pink-pin.svg"),
    iconRetinaUrl: require("../../../res/pink-pin.svg"),
    iconSize: new L.Point(36, 36),
    className: 'totem-icon'
});

const blueTotem = new L.Icon({
    iconUrl: require("../../../res/blue-pin.svg"),
    iconRetinaUrl: require("../../../res/blue-pin.svg"),
    iconSize: new L.Point(36, 36),
    className: 'totem-icon'
});

export { tealTotem, pinkTotem, blueTotem };
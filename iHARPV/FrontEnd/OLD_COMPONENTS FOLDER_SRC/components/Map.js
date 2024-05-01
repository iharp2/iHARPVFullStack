// Map.js
import React from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import "react-leaflet-fullscreen/styles.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { FullscreenControl } from "react-leaflet-fullscreen";
import DrawControl from "./DrawControl";
const Map = () => {
  return (
    // List of alla vailable tile layers https://leaflet-extras.github.io/leaflet-providers/preview/
    <MapContainer
      className="map-container"
      center={[52, -19]}
      zoom={2.5}
      zoomControl={false}
      minZoom={2}
      maxZoom={18}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <FullscreenControl position="topleft" />
      <DrawControl />
    </MapContainer>
  );
};

export default Map;

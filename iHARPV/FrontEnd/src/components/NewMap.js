import React, { useState, useContext } from "react";
import { Map, TileLayer, FeatureGroup, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw";
import L from "leaflet";
import { BoundsContext } from "./BoundsContext";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";

// import "react-leaflet-fullscreen/styles.css";
// import { FullscreenControl } from "react-leaflet-fullscreen";
const NewMap = () => {
  const { setDrawnShapeBounds } = useContext(BoundsContext);

  const [editableFG, setEditableFG] = useState(null);
  // let drawnShapeBounds;
  const onCreated = (e) => {
    // console.log(e);
    // console.log(editableFG);
    const drawnItems = editableFG.leafletElement._layers;
    // console.log("Before");
    // console.log(drawnItems);
    if (Object.keys(drawnItems).length > 1) {
      Object.keys(drawnItems).forEach((layerid, index) => {
        // lastLayerID = layerid;
        if (index > 0) return;
        const layer = drawnItems[layerid];
        editableFG.leafletElement.removeLayer(layer);
      });
    }
    let lastLayerID = Object.keys(drawnItems)[0];
    const bounds = drawnItems[lastLayerID]._bounds;
    setDrawnShapeBounds(bounds);
    // console.log("After");
    // console.log(drawnItems);
    // console.log(lastLayerID);
    // console.log(bounds);
  };

  const onFeatureGroupReady = (reactFGref) => {
    // store the ref for future access to content
    setEditableFG(reactFGref);
  };
  // Define the bounds of your constrained map
  const southWest = [-90.0, -180]; // Example: New York City
  const northEast = [90, 180]; // Example: New York City
  const bounds = [southWest, northEast];
  return (
    <Map
      center={[52, -19]}
      zoom={3}
      zoomControl={false}
      minZoom={2}
      maxZoom={18}
      className="map-container"
      maxBounds={bounds} // Set the maxBounds option
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <ScaleControl position="bottomleft" imperial={false} />
      <FullscreenControl position="topleft" title="Show full screen" />
      <FeatureGroup
        ref={(featureGroupRef) => {
          onFeatureGroupReady(featureGroupRef);
        }}
      >
        <EditControl
          position="topleft"
          edit={{ edit: false, remove: false }}
          onCreated={onCreated}
          draw={{
            rectangle: {
              icon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: "leaflet-div-icon leaflet-editing-icon",
              }),
              shapeOptions: {
                guidelineDistance: 10,
                color: "blue",
                weight: 3,
              },
            },
            polyline: false,
            circlemarker: false,
            circle: false,
            polygon: false,
            marker: false,
          }}
        />
      </FeatureGroup>
    </Map>
  );
};

export default NewMap;

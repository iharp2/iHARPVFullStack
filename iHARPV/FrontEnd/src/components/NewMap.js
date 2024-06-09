import React, { useState, useContext, useEffect } from "react";
import {
  Map,
  TileLayer,
  FeatureGroup,
  ScaleControl,
  Polygon,
} from "react-leaflet";
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
  const { drawnShapeBounds, setDrawnShapeBounds } = useContext(BoundsContext);
  const [editableFG, setEditableFG] = useState(null);

  useEffect(() => {
    if (drawnShapeBounds) {
      if (
        drawnShapeBounds._southWest.lat &&
        drawnShapeBounds._southWest.lng &&
        drawnShapeBounds._northEast.lat &&
        drawnShapeBounds._northEast.lng
      ) {
        // console.log("DrawnShapeBounds in Map have changed", drawnShapeBounds);
        if (editableFG.leafletElement) {
          const drawnItems = editableFG.leafletElement._layers;
          // Remove the existing layer
          if (Object.keys(drawnItems).length > 1) {
            Object.keys(drawnItems).forEach((layerid, index) => {
              // lastLayerID = layerid;
              if (index > 0) return;
              const layer = drawnItems[layerid];
              editableFG.leafletElement.removeLayer(layer);
            });
          } else {
            editableFG.leafletElement.clearLayers();
          }

          // Draw a new rectangle with updated bounds
          const southWest = [
            drawnShapeBounds._southWest.lat,
            drawnShapeBounds._southWest.lng,
          ];
          const northEast = [
            drawnShapeBounds._northEast.lat,
            drawnShapeBounds._northEast.lng,
          ];
          const bounds = [southWest, northEast];
          const rectangle = L.rectangle(bounds, {
            color: "blue",
            weight: 1,
            guidelineDistance: 10,
          }); // Create the rectangle
          rectangle.addTo(editableFG.leafletElement); // Add the rectangle to the feature group
        }
      }
    }
  }, [drawnShapeBounds]);
  // let drawnShapeBoundsu;
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
  const initialRectangleBounds = [
    [72, -57], // Top-left
    [72, -11], // Top-right
    [58, -11], // Bottom-right
    [58, -57], // Bottom-left
  ]; // Define the initial bounds for the rectangle

  return (
    <Map
      center={[70, -40]}
      zoom={2.5}
      zoomControl={false}
      minZoom={2}
      maxZoom={12}
      className="map-container"
      maxBounds={bounds} // Set the maxBounds option
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <ScaleControl position="bottomleft" imperial={true} />
      <FullscreenControl position="topleft" title="Show full screen" />
      <FeatureGroup
        ref={(featureGroupRef) => {
          onFeatureGroupReady(featureGroupRef);
        }}
      >
        <Polygon positions={initialRectangleBounds} color="blue" weight={1} />

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
                weight: 1,
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

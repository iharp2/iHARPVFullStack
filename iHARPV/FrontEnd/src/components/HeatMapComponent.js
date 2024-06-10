import React from "react";
import myVideo from '../assets/heatmapVideo.mp4'

const HeatMapComponent = ({ videoSrc }) => {
  const videoBlob = videoSrc || null; // Ensure videoBlob is null if videoSrc is not provided

  if (!videoBlob) {
    // Render a default video if videoBlob is null
    return (
      <video muted
      controls
        autoPlay
        loop
        style={{ width: "500px", height: "325px" }}
          >

          <source src={myVideo}/>
         
        
        // Your browser does not support the video tag.
      </video>
    );
  }

  // If videoBlob is provided, render the video with the specified blob
  return (
    <video
      controls
      autoPlay
      loop
      style={{ width: "500px", height: "325px" }}
      key={URL.createObjectURL(videoBlob)}
    >
      <source
        src={URL.createObjectURL(videoBlob)}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  );
};

export default HeatMapComponent;

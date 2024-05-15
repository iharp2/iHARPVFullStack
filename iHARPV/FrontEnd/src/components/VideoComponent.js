import React from "react";

const VideoComponent = ({ videoSrc }) => {
  const videoBlob = videoSrc || "";

  // console.log("Video Logging....", videoBlob);
  if (!videoBlob) {
    // Render a loading indicator or placeholder while video data is being fetched
    return <div>Placeholder for the HeatMap Video...</div>;
  }

  return (
    <video
      controls
      autoPlay
      loop
      // muted
      style={{ width: "100%", height: "100%", maxWidth: "520px" }}
      // key={require("/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/FrontEnd/src/assets/heatmapVideo.mp4")}
      key={URL.createObjectURL(videoBlob)}
    >
      <source
        // src={require("/home/husse408/iHARP New Project/iHARPVFullStack/iHARPV/FrontEnd/src/assets/heatmapVideo.mp4")}
        src={URL.createObjectURL(videoBlob)}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoComponent;

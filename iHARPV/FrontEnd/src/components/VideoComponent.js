import React, { useEffect, useState } from "react";

const VideoComponent = ({ videoSrc }) => {
  const [url, setSource] = useState(videoSrc);

  useEffect(() => {
    setSource(videoSrc);
  }, [videoSrc]);

  if (!url) {
    // Render a loading indicator or placeholder while video data is being fetched
    return <div>Video Loading...</div>;
  }

  return (
    <video
      controls
      autoPlay
      loop
      muted
      style={{ width: "100%", height: "100%" }}
      key={url}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoComponent;

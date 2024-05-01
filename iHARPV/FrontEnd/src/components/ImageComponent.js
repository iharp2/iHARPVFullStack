import React from "react";

const ImageComponent = ({ imageData }) => {
  if (!imageData) {
    // Render a loading indicator or placeholder while imageData is being fetched
    return <div>Loading...</div>;
  }
  return (
    <div>
      <img
        src={`data:image/png;base64,${imageData}`}
        alt="Your Image"
        style={{ maxWidth: "500px" }}
        loading="lazy"
        controls
      />
    </div>
  );
};

export default ImageComponent;

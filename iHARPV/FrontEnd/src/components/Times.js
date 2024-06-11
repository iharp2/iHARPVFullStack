import React from "react";
import Plot from 'react-plotly.js';
import myImage from '../assets/times.json'
const TimesComponent = ({ imageData }) => {
     
  if (!imageData) {
      // Render a loading indicator or placeholder while imageData is being fetched
      if(myImage){
        const Initialconfig = {
            ...myImage.config,
            displaylogo: false,
        
        };
      return <div><Plot
      data={myImage.data}
      layout={myImage.layout}
      frames={myImage.frames}
      config={Initialconfig}
      style={{width: "750px",height: "325px"}}         
      /></div>;}
        else{
            return <div>Loading Initial Times Graph..</div>;
        }
  }


  // // Create a new config object with zoom buttons removed
  const config = {
      ...imageData.config,
      displaylogo: false,

      // scrollZoom:true,
      // showLink:true,
      
  };


  return (
      <div>
          <Plot
              data={imageData.data}
              layout={imageData.layout}
              frames={imageData.frames}
              config={config}
              style={{width: "750px",height: "325px"}}         
                 />
      </div>
  );
};


export default TimesComponent;

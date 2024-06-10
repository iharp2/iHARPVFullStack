import React from 'react';
import Plot from 'react-plotly.js';
import myFigure from '../assets/plotly_figure.json'
const AreasComponentMap = ({ jsonData }) => {
  
    if (!jsonData) {
     // Render a loading indicator or placeholder while imageData is being fetched
     if(myFigure){
        const Initialconfig = {
            ...myFigure.config,
            displaylogo: false,
        
        };
        return <div><Plot
        data={myFigure.data}
        layout={myFigure.layout}
        frames={myFigure.frames}
        config={Initialconfig}
        style={{width: "500px",height: "325px"}}      
           /></div>;}
          else{
              return <div>Loading Initial Figure</div>;
          }
    }

    // // Create a new config object with zoom buttons removed
    const config = {
        ...jsonData.config,
        displaylogo: false,

        // scrollZoom:true,
        // showLink:true,
        
    };
 
    return (
        <div>
            <Plot
                data={jsonData.data}
                layout={jsonData.layout}
                frames={jsonData.frames}
                config={config}
                style={{width: "500px",height: "325px"}}            />
        </div>
    );
};

export default AreasComponentMap;

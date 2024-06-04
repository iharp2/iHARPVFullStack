import React from 'react';
import Plot from 'react-plotly.js';

const PlotlyFigure = ({ jsonData }) => {
    if (!jsonData) {
        // Render a loading indicator or placeholder while imageData is being fetched
        return <div>Placeholder for the GetArea Query...</div>;
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
                style={{width: "400px",height: "300px"}}            />
        </div>
    );
};

export default PlotlyFigure;

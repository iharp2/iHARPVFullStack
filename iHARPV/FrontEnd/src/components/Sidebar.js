import React, { useState, useContext, useEffect } from "react";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css";
import { BoundsContext } from "./BoundsContext";
import Dropdown from "./Dropdown";

const drawerWidth = 375;
dayjs.extend(utc);
dayjs.extend(timezone);
const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    color: "black", // Set the background color to black
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
}));
// const now = 10;
export default function SideBar({
  open,
  handleDrawerClose,
  handleImageUpdate,
  handleVideoUpdate,
  handleAreaQuery,
  // videoUrl,
}) {
  // const { updateImageData } = props;
  const [variable, setVariable] = React.useState([]);

  const handleChangeDropDown = (event) => {
    setVariable(event.target.value);
  };
  const { drawnShapeBounds, setDrawnShapeBounds } = useContext(BoundsContext);
  const classes = useStyles();
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(null); // Initialize selectedStartDateTime with null
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(null); // Initialize selectedEndDateTime with null
  // const [videoUrl, setVideoUrl] = useState("");
  // const [responseRecieved, setresponseRecieved] = useState("");
  const maxDate = dayjs("2024-02-28T23");
  const [progress, setProgress] = useState(0); // State to manage progress
  const [progressDesc, setProgressDesc] = useState(""); // State to manage progress

  const [videoRecieved, setVideoReceived] = useState(null);
  const [imageRecieved, setImageRecieved] = useState(null); // Initialize selectedEndDateTime with null

  const [formData, setFormData] = useState({
    requestType: "",
    variable:"",
    startDateTime: "",
    endDateTime: "",
    temporalLevel: "Hourly",
    aggLevel: "",
    spatialLevel: "0.25",
    north: 72,
    south: 58,
    east: -11,
    west: -57,
  });
  const [areaRecieved, setAreaRecieved] = useState(null); // Initialize selectedEndDateTime with null

  useEffect(() => {
    if (drawnShapeBounds) {
      const north_val = drawnShapeBounds._northEast.lat;
      const east_val = drawnShapeBounds._northEast.lng;
      const south_val = drawnShapeBounds._southWest.lat;
      const west_val = drawnShapeBounds._southWest.lng;

      setFormData((prevFormData) => ({
        ...prevFormData,
        north: north_val,
        east: east_val,
        south: south_val,
        west: west_val,
      }));
    }
    // if (variable){
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     variable: variable, // Update formData.variable with the selected variable
    //   }));
    // }
  }, [drawnShapeBounds]);

  useEffect(() => {

    if (variable){
      setFormData((prevFormData) => ({
        ...prevFormData,
        variable: variable, // Update formData.variable with the selected variable
      }));
    }
  }, [variable]);

  const handleChange = (e) => {
    let myValue;
    const { name, value } = e.target;
    // Convert the input value to a number
    if (
      name === "north" ||
      name === "south" ||
      name === "east" ||
      name === "west"
    ) {
      let numericValue = parseFloat(value);

      // Define the range boundaries based on the input name
      let min, max;
      if (name === "north" || name === "south") {
        min = -90;
        max = 90;
      } else if (name === "east" || name === "west") {
        min = -180;
        max = 180;
      }

      // Clamp the value to the range
      numericValue = Math.min(Math.max(numericValue, min), max);
      myValue = numericValue;
      // Update the form data with the clamped value
      
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
    } else {
      // For other inputs, update the form data as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
      // setTemporalLevelSelected(value !== "");
    }
    if (drawnShapeBounds) {
      setDrawnShapeBounds((prevBounds) => ({
        _southWest: {
          lat: name === "south" ? myValue : prevBounds._southWest.lat,
          lng: name === "west" ? myValue : prevBounds._southWest.lng,
        },
        _northEast: {
          lat: name === "north" ? myValue : prevBounds._northEast.lat,
          lng: name === "east" ? myValue : prevBounds._northEast.lng,
        },
      }));
    } else {
      if (formData.south && formData.north && formData.east && formData.west) {
        setDrawnShapeBounds(() => ({
          _southWest: {
            lat: formData.south,
            lng: formData.west,
          },
          _northEast: {
            lat: formData.north,
            lng: formData.east,
          },
        }));
      }
    }
    // setTemporalLevelSelected(value !== "");
  };

  const handleAreas = async (e) =>  {
    if (e) e.preventDefault();
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.temporalLevel === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a temporal level resolution before proceeding..."
      );
      return; // Exit the function early
    } else if (
      formData.temporalLevel !== "Hourly" &&
      formData.aggLevel === ""
    ) {
      alert("ERROR: Please select an aggregation method before proceeding...");
      return; // Exit the function early
    } else if (!selectedStartDateTime) {
      alert("ERROR: Please select a start date and time before proceeding.");
      return; // Exit the function early
    } else if (!selectedEndDateTime) {
      alert("ERROR: Please select an end date and time before proceeding..");
      return; // Exit the function early
    } else if (
      formData.north === "" ||
      formData.south === "" ||
      formData.east === "" ||
      formData.west === ""
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Area Query";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      setProgress(20);
      setProgressDesc("Getting an Area");
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("area/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const jsonData = await response.json();
        setAreaRecieved(jsonData);
      } else {
        setProgress(5);
        setProgressDesc("Failed", response.status);
        console.error(
          "Failed to fetch get area. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  const handleHeatMap = async (e) => {
    if (e) e.preventDefault();
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.temporalLevel === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a temporal level resolution before proceeding..."
      );
      return; // Exit the function early
    } else if (
      formData.temporalLevel !== "Hourly" &&
      formData.aggLevel === ""
    ) {
      alert("ERROR: Please select an aggregation method before proceeding...");
      return; // Exit the function early
    } else if (!selectedStartDateTime) {
      alert("ERROR: Please select a start date and time before proceeding.");
      return; // Exit the function early
    } else if (!selectedEndDateTime) {
      alert("ERROR: Please select an end date and time before proceeding..");
      return; // Exit the function early
    } else if (
      formData.north === "" ||
      formData.south === "" ||
      formData.east === "" ||
      formData.west === ""
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Heat Map";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      setProgress(20);
      setProgressDesc("Creating HeatMap");
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("heatmap/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is successful
      if (response.ok) {
        // handleVideoUpdate("");
        // Parse the response as JSON
        const videoBlob = await response.blob();
        // Create a URL for the video blob
        // const url = URL.createObjectURL(videoBlob);
        // Set the video URL state
        // setVideoUrl(url);
        setVideoReceived(videoBlob);
      } else {
        setProgress(5);
        setProgressDesc("Failed", response.status);
        console.error(
          "Failed to fetch heat map data. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  const handleTimeSeries = async (e) => {
    if (e) e.preventDefault();
    // if (variable){
    //   console.log
    //   setFormData((prevFormData) => ({
    //     ...prevFormData,
    //     variable: variable, // Update formData.variable with the selected variable
    //   }));
    // }
    // console.log(formData.variable);
    // Check if a temporal level option has been selected
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.temporalLevel === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a temporal level resolution before proceeding..."
      );
      return; // Exit the function early
    } else if (!selectedStartDateTime) {
      alert("ERROR: Please select a start date and time before proceeding.");
      return; // Exit the function early
    } else if (!selectedEndDateTime) {
      alert("ERROR: Please select an end date and time before proceeding..");
      return; // Exit the function early
    } else if (
      formData.north === "" ||
      formData.south === "" ||
      formData.east === "" ||
      formData.west === ""
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Time Series";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;
    try {
      setProgress(20);
      setProgressDesc("Creating Timeseries");
      console.log(formData);
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("timeseries/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is successful
      if (response.ok) {
        // Parse the response as JSON
        const responseData = await response.json();
        // console.log("Successfully requested time series data:", responseData);
        setImageRecieved(responseData.imageData);
      } else {
        setProgress(5);
        setProgressDesc("Failed", response.status);
        console.error(
          "Failed to fetch time series data. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  useEffect(() => {
    if (videoRecieved) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Video received:", videoRecieved);
      handleVideoUpdate(videoRecieved);
      setProgress(100);
      setProgressDesc("Created HeatMap");
    }
  }, [videoRecieved, handleVideoUpdate]);
// console.log("Hey,",variable);
  useEffect(() => {
    if (imageRecieved) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Image received:");
      handleImageUpdate(imageRecieved);
      // Update progress to 100 when response is received
      setProgress(100);
      setProgressDesc("Created Time Series");
    }
  }, [imageRecieved, handleImageUpdate]);
  useEffect(() => {
    if (areaRecieved) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Image received:");
      handleAreaQuery(areaRecieved);
      // Update progress to 100 when response is received
      setProgress(100);
      setProgressDesc("Received Areas");
    }
  }, [areaRecieved, handleAreaQuery]);
  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />

      <div className="sidebar-content">
        <div className="nine">
          <h1>iHARPV</h1>
        </div>
        <div class="instruction-text">
          <h7>
            Explore <strong>iHARPV</strong> by selecting an area on the map or
            using the range options below. Customize your query by choosing
            parameters from the <strong>Query Menu</strong> below to generate a
            TimeSeries or HeatMap. Additionally, download data of interest for
            further analysis.
          </h7>
        </div>
        <div className="nine">
          <h1>
            <span>Query Menu</span>
          </h1>
        </div>
        <div style={{ marginBottom: "-20px" }}></div>

        <div className="sidebar-container">
          <Dropdown personName={variable} handleChange={handleChangeDropDown}  />
          <div style={{ marginBottom: "10px" }}></div>

          {/* <h4 className="sidebar-heading">Select Start Date and Time</h4> */}
          <div style={{ marginBottom: "3px" }}></div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              // name=""
              name="startDateTime"
              disableFuture
              label="Start Date & Time"
              ampm={false} // Disable AM/PM selector
              minutesStep={60} // Set minutes step to 60 to skip minutes selection
              secondsStep={0} // Set seconds step to 0 to remove seconds
              value={selectedStartDateTime}
              sx={{ width: "60%", marginLeft: "10px" }}
              timezone="UTC"
              maxDateTime={maxDate}
              onChange={(newDateTime) => setSelectedStartDateTime(newDateTime)}
            />
          </LocalizationProvider>
          <div style={{ marginBottom: "10px" }}></div>
          {/* <h4 className="sidebar-heading">Select End Date and Time</h4> */}
          <div style={{ marginBottom: "3px" }}></div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              disableFuture
              label="End Date & Time"
              ampm={false} // Disable AM/PM selector
              minutesStep={60} // Set minutes step to 60 to skip minutes selection
              secondsStep={0} // Set seconds step to 0 to remove
              name="endDateTime"
              value={selectedEndDateTime}
              timezone="UTC"
              maxDateTime={maxDate}
              sx={{ width: "60%", marginLeft: "10px" }}
              onChange={(newDateTime) => setSelectedEndDateTime(newDateTime)}
            />
          </LocalizationProvider>
          <div style={{ marginBottom: "20px" }}></div>
          <h4 className="sidebar-heading">Select Temporal Resolution</h4>
          <Form label="Select Output Level">
            <div className="mb-4">
              <Form.Check
                inline
                label="Hourly"
                name="temporalLevel"
                type="radio"
                id="inline-radio-1"
                value="Hourly" // Set value of radio input to Hourly
                style={{ fontSize: "small", marginLeft: "10px" }}
                onChange={handleChange}
                checked={formData.temporalLevel === "Hourly"}
              />
              <Form.Check
                inline
                label="Daily"
                name="temporalLevel"
                type="radio"
                id="inline-radio-2"
                value="Daily" // Set value of radio input to Daily
                style={{ fontSize: "small" }}
                onChange={handleChange}
                checked={formData.temporalLevel === "Daily"}
              />
              <Form.Check
                inline
                name="temporalLevel"
                label="Monthly"
                type="radio"
                id="inline-radio-3"
                value="Monthly" // Set value of radio input to Monthly
                style={{ fontSize: "small" }}
                onChange={handleChange}
                checked={formData.temporalLevel === "Monthly"}
              />
              <Form.Check
                inline
                name="temporalLevel"
                label="Yearly"
                type="radio"
                id="inline-radio-4"
                value="Yearly" // Set value of radio input to Yearly
                style={{ fontSize: "small" }}
                onChange={handleChange}
                checked={formData.temporalLevel === "Yearly"}
              />
            </div>
          </Form>
          <h4 className="sidebar-heading">
            For HeatMap: Select Aggregation Level
          </h4>
          <Form>
            {["radio"].map((type) => (
              <div key={`inline-${type}`} className="mb-3">
                <Form.Check
                  inline
                  label="Minimum"
                  name="aggLevel"
                  type={type}
                  id={`inline-2-${type}-1`}
                  value="Minimum" // Set value of radio input to Minimum
                  style={{ fontSize: "small", marginLeft: "10px" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.aggLevel === "Minimum"}
                />
                <Form.Check
                  inline
                  label="Maximum"
                  name="aggLevel"
                  type={type}
                  id={`inline-2-${type}-2`}
                  value="Maximum" // Set value of radio input to Maximum
                  style={{ fontSize: "small" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.aggLevel === "Maximum"}
                />
                <Form.Check
                  inline
                  label="Average"
                  name="aggLevel"
                  type={type}
                  id={`inline-2-${type}-3`}
                  value="Average" // Set value of radio input to Average
                  style={{ fontSize: "small" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.aggLevel === "Average"}
                />
              </div>
            ))}
          </Form>
          <h4 className="sidebar-heading">Select Spatial Resolution</h4>
          <Form>
            {["radio"].map((type) => (
              <div key={`inline-${type}`} className="mb-5">
                <Form.Check
                  inline
                  label="0.25"
                  name="spatialLevel"
                  type={type}
                  id={`inline-2-${type}-1`}
                  value="0.25" // Set value of radio input to Minimum
                  style={{ fontSize: "small", marginLeft: "10px" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.spatialLevel === "0.25"}
                  // disabled
                />
                <Form.Check
                  inline
                  label="0.5"
                  name="spatialLevel"
                  type={type}
                  id={`inline-2-${type}-2`}
                  value="0.5" // Set value of radio input to Maximum
                  style={{ fontSize: "small" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.spatialLevel === "0.5"}
                  disabled
                />
                <Form.Check
                  inline
                  label="1.0"
                  name="spatialLevel"
                  type={type}
                  id={`inline-2-${type}-3`}
                  value="1.0" // Set value of radio input to Average
                  style={{ fontSize: "small" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.spatialLevel === "1.0"}
                  disabled
                />
                <Form.Check
                  inline
                  label="2.0"
                  name="spatialLevel"
                  type={type}
                  id={`inline-2-${type}-3`}
                  value="2.0" // Set value of radio input to Average
                  style={{ fontSize: "small" }}
                  onChange={handleChange} // Add onChange handler
                  checked={formData.spatialLevel === "2.0"}
                  disabled
                />
              </div>
            ))}
          </Form>
          <div style={{ marginBottom: "-30px" }}></div>

          <h4 className="sidebar-heading">
            Optional: Select Longitude Latitude Range
          </h4>
          <div className="coordinates-container">
            <div className="row">
              <div className="cell">
                <label className="label"> North:</label>
                <input
                  type="number"
                  name="north"
                  value={formData.north}
                  onChange={handleChange}
                  className="input"
                  max="90"
                  min="-90"
                />
              </div>
            </div>
            <div className="column">
              <div className="cell">
                <label className="label">West:</label>
                <input
                  name="west"
                  value={formData.west}
                  onChange={handleChange}
                  className="input"
                  type="number"
                  max="180"
                  min="-180"
                />
              </div>
              <div style={{ marginLeft: "20px" }}></div>
              <div className="cell">
                <label className="label">East:</label>
                <input
                  name="east"
                  value={formData.east}
                  onChange={handleChange}
                  className="input"
                  type="number"
                  max="180"
                  min="-180"
                />
              </div>
            </div>
            <div className="row">
              <div className="cell">
                <label className="label">South:</label>

                <input
                  name="south"
                  value={formData.south}
                  onChange={handleChange}
                  className="input"
                  type="number"
                  max="90"
                  min="-90"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}></div>
          <div
            className="sidebar-buttons"
            style={{ display: "flex", gap: "10px", position: "right" }}
          >
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleTimeSeries}
              // disabled={!temporalLevelSelected} // Disable the button if no temporal level option is selected
            >
              TimeSeries
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleHeatMap}>
              HeatMap
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAreas}
              // disabled
            >
              Get Areas
            </Button>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p>{progressDesc}</p>
          </div>
          <div
            style={{
              // marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* TODO: Look at this website later to do the progress bar  */}
            <ProgressBar
              // animated
              now={progress} // Set progress dynamically
              label={`Progress: ${progress}%`}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}

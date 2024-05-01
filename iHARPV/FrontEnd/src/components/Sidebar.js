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

const drawerWidth = 355;
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
}) {
  // const { updateImageData } = props;

  const { drawnShapeBounds } = useContext(BoundsContext);
  const classes = useStyles();
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(null); // Initialize selectedStartDateTime with null
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(null); // Initialize selectedEndDateTime with null
  const [imageResponse, setImageResponse] = useState(""); // Initialize selectedEndDateTime with null
  const [videoUrl, setVideoUrl] = useState("");

  const [formData, setFormData] = useState({
    requestType: "",
    startDateTime: "",
    endDateTime: "",
    temporalLevel: "",
    aggLevel: "",
    north: "",
    south: "",
    east: "",
    west: "",
  });
  useEffect(() => {
    if (drawnShapeBounds) {
      // Update formData with the value of drawnShapeBounds.southWest
      const validLatitude = (lat) => lat >= -90 && lat <= 90;
      const validLongitude = (lng) => lng >= -180 && lng <= 180;

      const north_val = validLatitude(drawnShapeBounds._northEast.lat)
        ? drawnShapeBounds._northEast.lat.toFixed(3)
        : 90;
      const east_val = validLongitude(drawnShapeBounds._northEast.lng)
        ? drawnShapeBounds._northEast.lng.toFixed(3)
        : 180;
      const south_val = validLatitude(drawnShapeBounds._southWest.lat)
        ? drawnShapeBounds._southWest.lat.toFixed(3)
        : -90;
      const west_val = validLongitude(drawnShapeBounds._southWest.lng)
        ? drawnShapeBounds._southWest.lng.toFixed(3)
        : -180;

      setFormData((prevFormData) => ({
        ...prevFormData,
        north: north_val,
        east: east_val,
        south: south_val,
        west: west_val,
      }));
    }
  }, [drawnShapeBounds]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle range validation only for the "north" input
    if (name === "north" || name === "south") {
      // Convert the input value to a number
      let numericValue = parseFloat(value);

      // Define the range boundaries
      const min = -90; // Minimum allowed value for latitude
      const max = 90; // Maximum allowed value for latitude

      // Clamp the value to the range
      numericValue = Math.min(Math.max(numericValue, min), max);

      // Update the form data with the clamped value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
    } else if (name === "east" || name === "west") {
      // Convert the input value to a number
      let numericValue = parseFloat(value);

      // Define the range boundaries
      const min = -180; // Minimum allowed value for latitude
      const max = 180; // Maximum allowed value for latitude

      // Clamp the value to the range
      numericValue = Math.min(Math.max(numericValue, min), max);

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
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    formData.requestType = "Data Download";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;
    try {
      await fetch("http://127.0.0.1:6080/download/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      // console.log("Successfuly request for Downloading Data");
    } catch (error) {
      console.error("Error requesting Data Download:", error);
    }
  };

  const handleHeatMap = async (e) => {
    if (e) e.preventDefault();
    formData.requestType = "Heat Map";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("http://127.0.0.1:6080/heatmap/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is successful
      if (response.ok) {
        // Parse the response as JSON
        const videoBlob = await response.blob();
        // Create a URL for the video blob
        const url = URL.createObjectURL(videoBlob);
        // Set the video URL state
        setVideoUrl(url);

        // console.log("I am at the Sidebar.js and recieved, the video ");

        // setImageData(imageResponse);
        // Call the parent component's function to update the image data
        handleVideoUpdate(videoUrl);
      } else {
        console.error(
          "Failed to fetch time series data. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };

  const handleTimeSeries = async (e) => {
    if (e) e.preventDefault();
    formData.requestType = "Time Series";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("http://127.0.0.1:6080/timeseries/", {
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
        setImageResponse(responseData.imageData);

        // console.log(
        //   "I am at the Sidebar.js and recieved, ",
        //   JSON.stringify(imageResponse)
        // );

        // setImageData(imageResponse);
        // Call the parent component's function to update the image data
        handleImageUpdate(imageResponse);
      } else {
        console.error(
          "Failed to fetch time series data. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };

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
        <div class="nine">
          <h1>
            iHARPV<span>Query Menu</span>
          </h1>
        </div>
        <div className="sidebar-container">
          <div style={{ marginBottom: "10px" }}></div>

          <h4 className="sidebar-heading">Select Start Date and Time</h4>
          <div style={{ marginBottom: "10px" }}></div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              // name=""
              name="startDateTime"
              disableFuture
              label="Start Date & Time"
              minutesStep={60}
              value={selectedStartDateTime}
              sx={{ width: "60%", marginLeft: "10px" }}
              timezone="UTC"
              onChange={(newDateTime) => setSelectedStartDateTime(newDateTime)}
            />
          </LocalizationProvider>
          <div style={{ marginBottom: "20px" }}></div>
          <h4 className="sidebar-heading">Select End Date and Time</h4>
          <div style={{ marginBottom: "10px" }}></div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              disableFuture
              label="End Date & Time"
              minutesStep={60}
              name="endDateTime"
              value={selectedEndDateTime}
              timezone="UTC"
              sx={{ width: "60%", marginLeft: "10px" }}
              onChange={(newDateTime) => setSelectedEndDateTime(newDateTime)}
            />
          </LocalizationProvider>
          <div style={{ marginBottom: "20px" }}></div>
          <h4 className="sidebar-heading">Select Temporal Output Level</h4>
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
            For HeatMap: Select Aggregation Method
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
          <h4 className="sidebar-heading">
            Optional: Select Longitude Latitude Range
          </h4>
          <div class="coordinates-container">
            <div class="row">
              <div class="cell">
                <label class="label"> North:</label>
                <input
                  type="number"
                  name="north"
                  value={formData.north}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div class="column">
              <div class="cell">
                <label class="label">West:</label>
                <input
                  name="west"
                  value={formData.west}
                  onChange={handleChange}
                  className="input"
                  type="number"
                />
              </div>
              <div style={{ marginLeft: "20px" }}></div>
              <div class="cell">
                <label class="label">East:</label>
                <input
                  name="east"
                  value={formData.east}
                  onChange={handleChange}
                  className="input"
                  type="number"
                />
              </div>
            </div>
            <div class="row">
              <div class="cell">
                <label class="label">South:</label>
                <input
                  name="south"
                  value={formData.south}
                  onChange={handleChange}
                  className="input"
                  type="number"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}></div>
          <div
            className="sidebar-buttons"
            style={{ display: "flex", gap: "10px", position: "right" }}
          >
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleTimeSeries}
            >
              TimeSeries
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleHeatMap}>
              HeatMap
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleDownload}
            >
              Download Data
            </Button>
          </div>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ProgressBar
              animated
              now={45}
              label="Progress"
              style={{ width: "65%" }}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
}

import React, { useState, useContext, useEffect } from "react";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css";
import { BoundsContext } from "./BoundsContext";
import VariablesDropDown from "./VariablesDropDown";
import ComparisonsDropDown from "./ComparisonsDropDownComponent";
import SecondAggDropDown from "./SecondAggDropDownComponent";
import Divider from '@mui/material/Divider';
import QuantityInput from "./NumberInputComponent";
import DownloadDropDownComponent from "./DownloadDropDownComponent";
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
  handleTable,
  handleTimeQuery,
  handleQueryType,
  videoUrl,
}) {
  // const { updateImageData } = props;
  const [variable, setVariable] = React.useState("2m Temperature");
  const [comparison, setComparison] = React.useState("");
  const [secondAgg, setSecondAgg] = React.useState("");
  const [downloadOption, setDownloadOption] = React.useState("");

  const [myValue, setMyValue] = React.useState(0);

  const { drawnShapeBounds, setDrawnShapeBounds } = useContext(BoundsContext);
  const classes = useStyles();
  const [selectedStartDateTime, setSelectedStartDateTime] = useState(dayjs("2023-01-01T00")); // Initialize selectedStartDateTime with null
  const [selectedEndDateTime, setSelectedEndDateTime] = useState(dayjs("2023-01-15T01")); // Initialize selectedEndDateTime with null
  // const [videoUrl, setVideoUrl] = useState("");
  // const [responseRecieved, setresponseRecieved] = useState("");
  const maxDate = dayjs("2023-12-31T23");
  const minDate = dayjs("2014-01-01T00");

  const [progress, setProgress] = useState(0); // State to manage progress
  const [progressDesc, setProgressDesc] = useState(""); // State to manage progress

  const [videoRecieved, setVideoReceived] = useState(null);
  const [imageRecieved, setImageRecieved] = useState(null); // Initialize selectedEndDateTime with null
  const [tableRecieved, setTableRecieved] = useState([]); // Initialize selectedEndDateTime with null

  const [formData, setFormData] = useState({
    requestType: "",
    variable: "2m Temperature",
    startDateTime: selectedStartDateTime,
    endDateTime: selectedEndDateTime,
    temporalLevel: "daily",
    aggLevel: "mean",
    spatialLevel: "1.0",
    north: 72,
    south: 58,
    east: -11,
    west: -57,
    secondAgg: "",
    comparison: "",
    value: 0,
    downloadOption: "",

  });
  const [areaRecieved, setAreaRecieved] = useState(null); // Initialize selectedEndDateTime with null
  const [timeRecieved, setTimeRecieved] = useState(null); // Initialize selectedEndDateTime with null

  const handleValueChange = (newValue) => {
    setMyValue(newValue);
  };
  const handleChangeDropDown = (event) => {
    setVariable(event.target.value);
  };
  const handleChangeComparisonDropDown = (event) => {
    setComparison(event.target.value);
  };
  const handleChangeDownloadDropDown = (event) => {
    setDownloadOption(event.target.value);
  };
  const handleChangeSecondAggDropDown = (event) => {
    setSecondAgg(event.target.value);
  };

  console.log("Inside Sidebar myvale", myValue);
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
  const handleAreas = async (e) => {
    if (e) e.preventDefault();
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
      );
      return; // Exit the function early
    }
    else if (formData.secondAgg === "") {
      alert(
        "ERROR: Please select second aggregation level method before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.comparison === "") {
      alert(
        "ERROR: Please select comparison operator before proceeding..."
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
      formData.temporalLevel !== "hourly" &&
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Area Query";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      setProgress(20);
      setProgressDesc("Getting Areas");
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("areas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const jsonData = await response.json();
        setAreaRecieved(jsonData.plotlyData);
        setTableRecieved(jsonData.dfData);
      } else {
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to fetch areas. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  const handleTimes = async (e) => {
    if (e) e.preventDefault();
    // if (fo)
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
      );
      return; // Exit the function early
    }
    else if (formData.secondAgg === "") {
      alert(
        "ERROR: Please select second aggregation level method before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.comparison === "") {
      alert(
        "ERROR: Please select comparison operator before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.value === "") {
      alert(
        "ERROR: Please Enter Value before proceeding..."
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
      formData.temporalLevel !== "hourly" &&
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Times Query";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;

    try {
      setProgress(20);
      setProgressDesc("Finding Time Units");
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("times/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const jsonData = await response.json();
        setTimeRecieved(jsonData.plotlyData);
        setTableRecieved(jsonData.dfData);
      } else {
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to fetch times. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  const handleDownload = async (e) => {
    if (e) e.preventDefault();
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
      );
      return; // Exit the function early
    }

    formData.requestType = "Download";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;
    try {
      setProgress(20);
      setProgressDesc("Downloading Data");
      console.log(formData);
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("download/", {
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
        const fileName = responseData.fileName;
        alert("Receive file name: " + fileName);
        const fileUrl = `static/media/${fileName}`;
        window.open(fileUrl);
        setProgress(100);
        setProgressDesc("Data Served");
      } else {
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to download data. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  console.log(downloadOption);
  const handleDownloadAreasTimes = async (e) => {
    if (e) e.preventDefault();
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (downloadOption === "") {
      alert(
        "ERROR: Please select Areas or Times from Download Dropdown....."
      );
      return; // Exit the function early
    }
    else if (formData.secondAgg === "") {
      alert(
        "ERROR: Please select second aggregation level method before proceeding..."
      );
      return; // Exit the function early
    }
    else if (formData.comparison === "") {
      alert(
        "ERROR: Please select comparison operator before proceeding..."
      );
      return; // Exit the function early
    }
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
      );
      return; // Exit the function early
    }

    formData.requestType = "DownloadAreasTimes";
    formData.startDateTime = selectedStartDateTime;
    formData.endDateTime = selectedEndDateTime;
    formData.downloadOption = downloadOption;
    try {
      setProgress(20);
      setProgressDesc("Downloading Data");
      console.log(formData);
      // Send request to the backend to fetch both time series data and image data
      const response = await fetch("downloadareastimes/", {
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
        const fileName = responseData.fileName;
        alert("Receive file name: " + fileName);
        const fileUrl = `static/media/${fileName}`;
        window.open(fileUrl);
        setProgress(100);
        setProgressDesc("Data Served");
      } else {
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to download data. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
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
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
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
      formData.temporalLevel !== "hourly" &&
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
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
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to fetch heat map data. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
  console.log(formData.value);

  const handleTimeSeries = async (e) => {
    if (e) e.preventDefault();
    isNaN(variable)
    if (formData.variable === "") {
      // If not, display an error message or perform any other action to prompt the user to select a temporal level
      alert(
        "ERROR: Please select a variable before proceeding..."
      );
      return; // Exit the function early
    }
    else if (selectedEndDateTime.isBefore(selectedStartDateTime)) {
      alert(
        "ERROR: End Date Time Must Be After Than Start Date Time"
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
      isNaN(formData.north) ||
      isNaN(formData.south) ||
      isNaN(formData.east) ||
      isNaN(formData.west) ||
      (formData.north > 90) ||
      (formData.south < -90) ||
      (formData.west < -180) ||
      (formData.east > 180)
    ) {
      alert(
        "ERROR: Please select an area on the map or enter FOUR coordinates of interest manually(S,N,W,E) before proceeding..."
      );
      alert(
        "Coordinates should be between -90:90 and -180:180 for (S,N,W,E) respectively..."
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
        setImageRecieved(responseData);
      } else {
        const errorResponse = await response.json();
        setProgress(5);
        setProgressDesc(errorResponse.error, response.status);
        console.error(
          "Failed to fetch time series data. HTTP status:",
          response.status,
          "Error message:",
          errorResponse.error
        );
      }
    } catch (error) {
      console.error("Error requesting Time Series:", error);
    }
  };
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

    if (variable) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        variable: variable, // Update formData.variable with the selected variable
      }));
    }
  }, [variable]);
  useEffect(() => {

    if (secondAgg) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        secondAgg: secondAgg, // Update formData.variable with the selected variable
      }));
    }
  }, [secondAgg]);
  useEffect(() => {

    if (comparison) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        comparison: comparison, // Update formData.variable with the selected variable
      }));
    }
  }, [comparison]);
  useEffect(() => {

    if (myValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        value: myValue, // Update formData.variable with the selected variable
      }));
    }
  }, [myValue]);
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
      // handleQueryType(formData.requestType);
      // Update progress to 100 when response is received
      setProgress(100);
      setProgressDesc("Received Areas On Map");
    }
  }, [areaRecieved, handleAreaQuery]);
  useEffect(() => {
    if (formData.requestType) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Image received:");
      // handleTimeQuery(timeRecieved);
      handleQueryType(formData.requestType);
      // Update progress to 100 when response is received
      // setProgress(100);
      // setProgressDesc("Received Times On Plot");
    }
  }, [formData.requestType, handleQueryType]);
  useEffect(() => {
    if (timeRecieved) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Image received:");
      handleTimeQuery(timeRecieved);
      // handleQueryType(formData.requestType);
      // Update progress to 100 when response is received
      setProgress(100);
      setProgressDesc("Received Times On Plot");
    }
  }, [timeRecieved, handleTimeQuery]);

  useEffect(() => {
    if (tableRecieved) {
      // Execute any code you want to run after responseReceived changes
      // This code will run every time responseReceived changes
      // For example, you can trigger a re-render here or perform other actions
      // console.log("Image received:");
      handleTable(tableRecieved);
      // Update progress to 100 when response is received
      setProgress(100);
      setProgressDesc("Received Data on Table");
    }
  }, [tableRecieved, handleTable]);
  const isAggregationDisabled = formData.temporalLevel === 'hourly';
  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={true}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      {/* <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div> */}
      {/* <Divider /> */}

      <div className="sidebar-content" >
        <div className="nine" style={{ backgroundColor: "black", color: 'whitesmoke', marginTop: '-17px', marginLeft: '-13px', marginRight: '-10px', marginBottom: '10px' }}>
          <h1 style={{ color: 'white' }}>iHARPV</h1>
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
        <div className="ninem">
          <h1>
            <span>Query Menu</span>
          </h1>
        </div>
        <div style={{ marginBottom: "-20px" }}></div>

        <div className="sidebar-container">
          <div style={{ marginLeft: "5px" }}>
            <div style={{ marginBottom: "10px", marginLeft: "-5px" }}>
              <VariablesDropDown personName={variable} handleChange={handleChangeDropDown} />
            </div>

            {/* <h4 className="sidebar-heading">Select Start Date and Time</h4> */}
            <div style={{ marginBottom: "15px" }}>
              <div className="datetime-container">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    // name=""
                    views={['year', 'day', 'hours']}
                    name="startDateTime"
                    disableFuture
                    label="Start Date & Time"
                    ampm={false} // Disable AM/PM selector
                    minutesStep={0} // Set minutes step to 60 to skip minutes selection
                    secondsStep={0} // Set seconds step to 0 to remove seconds
                    value={selectedStartDateTime}
                    sx={{ width: "175px", marginLeft: "2px" }}
                    timezone="UTC"
                    maxDateTime={maxDate}
                    minDateTime={minDate}
                    onChange={(newDateTime) => setSelectedStartDateTime(newDateTime)}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    views={['year', 'day', 'hours']}
                    disableFuture
                    label="End Date & Time"
                    ampm={false} // Disable AM/PM selector
                    minutesStep={60} // Set minutes step to 60 to skip minutes selection
                    secondsStep={0} // Set seconds step to 0 to remove
                    name="endDateTime"
                    value={selectedEndDateTime}
                    timezone="UTC"
                    maxDateTime={maxDate}
                    minDateTime={minDate}
                    sx={{ width: "175px", marginLeft: "1px" }}
                    onChange={(newDateTime) => setSelectedEndDateTime(newDateTime)}
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* <h4 className="sidebar-heading">Select End Date and Time</h4> */}
            <div style={{ marginBottom: "20px" }}>

            </div>
            <div style={{ marginBottom: "-16px" }}>
              <h4 className="sidebar-heading">Temporal Resolution</h4>
              <Form label="Select Output Level">
                <div className="mb-4">
                  <Form.Check
                    inline
                    label="hourly"
                    name="temporalLevel"
                    type="radio"
                    id="inline-radio-1"
                    value="hourly" // Set value of radio input to hourly
                    style={{ fontSize: "small", marginLeft: "10px" }}
                    onChange={handleChange}
                    checked={formData.temporalLevel === "hourly"}
                  />
                  <Form.Check
                    inline
                    label="daily"
                    name="temporalLevel"
                    type="radio"
                    id="inline-radio-2"
                    value="daily" // Set value of radio input to Daily
                    style={{ fontSize: "small" }}
                    onChange={handleChange}
                    checked={formData.temporalLevel === "daily"}
                  />
                  <Form.Check
                    inline
                    name="temporalLevel"
                    label="monthly"
                    type="radio"
                    id="inline-radio-3"
                    value="monthly" // Set value of radio input to monthly
                    style={{ fontSize: "small" }}
                    onChange={handleChange}
                    checked={formData.temporalLevel === "monthly"}
                  />
                  <Form.Check
                    inline
                    name="temporalLevel"
                    label="yearly"
                    type="radio"
                    id="inline-radio-4"
                    value="yearly" // Set value of radio input to yearly
                    style={{ fontSize: "small" }}
                    onChange={handleChange}
                    checked={formData.temporalLevel === "yearly"}
                  />
                </div>
              </Form>
            </div>
            <div style={{ marginTop: "10px" }}>

              <h4 className="sidebar-heading">
                Temporal Aggregation
              </h4>
              <Form>
                {["radio"].map((type) => (
                  <div key={`inline-${type}`} className="mb-3">
                    <Form.Check
                      inline
                      label="min"
                      name="aggLevel"
                      type={type}
                      id={`inline-2-${type}-1`}
                      value="min" // Set value of radio input to Minimum
                      style={{ fontSize: "small", marginLeft: "10px" }}
                      onChange={handleChange} // Add onChange handler
                      checked={formData.aggLevel === "min"}
                      disabled={isAggregationDisabled}
                    />
                    <Form.Check
                      inline
                      label="max"
                      name="aggLevel"
                      type={type}
                      id={`inline-2-${type}-2`}
                      value="max" // Set value of radio input to Maximum
                      style={{ fontSize: "small" }}
                      onChange={handleChange} // Add onChange handler
                      checked={formData.aggLevel === "max"}
                      disabled={isAggregationDisabled}
                    />
                    <Form.Check
                      inline
                      label="mean"
                      name="aggLevel"
                      type={type}
                      id={`inline-2-${type}-3`}
                      value="mean" // Set value of radio input to Average
                      style={{ fontSize: "small" }}
                      onChange={handleChange} // Add onChange handler
                      checked={formData.aggLevel === "mean"}
                      disabled={isAggregationDisabled}
                    />
                  </div>
                ))}
              </Form>
            </div>
            <div style={{ marginTop: "10px" }}>
              <h4 className="sidebar-heading">Spatial Resolution</h4>
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
                    // disabled
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
                    // disabled
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
                    // disabled
                    />
                  </div>
                ))}
              </Form>
            </div>
            <div style={{ marginBottom: "-40px" }}></div>

            <h4 className="sidebar-heading">
              Longitude Latitude Range
            </h4>
            <div className="coordinates-container">
              <div style={{ marginLeft: "50px" }}>
                <div className="row">

                </div>
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
                <div style={{ marginLeft: "40px" }}></div>
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
              <div style={{ marginLeft: "50px", marginBottom: "10px" }}>
                <div className="row">
                </div>
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
              style={{ display: "flex", gap: "10px", position: "right", marginLeft: "25px" }}
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
                onClick={handleDownload}
              // disabled
              >
                Download
              </Button>
            </div>
          </div>
          <Divider
            sx={{
              height: 1,
              margin: '10px 0px 0px 0px',
              border: '1px solid #ccc',

              // borderTop: '1px dashed #bbb',
            }}
          />
          <div
            style={{
              marginTop: "5px", marginLeft: "-15px", maringBottom: "30px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                marginRight: "1px",
              }}
            >
              <SecondAggDropDown personName={secondAgg} handleChange={handleChangeSecondAggDropDown} />
            </div>
            <div
              style={{
                marginRight: "10px",
                // mrginLeft:"-20px"
              }}
            >
              <ComparisonsDropDown personName={comparison} handleChange={handleChangeComparisonDropDown} />
            </div>
            <div
              style={{
                marginTop: "10px",
                // mrginLeft:"-20px"
              }}
            >
              <QuantityInput myValue={myValue} onChange={handleValueChange} />
            </div>
          </div>
          <div
            className="sidebar-buttons"
            style={{ display: "flex", gap: "10px", position: "left", marginTop: "25px", marginLeft: "0px" }}
          >
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAreas}
            // disabled
            >
              Find Areas
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleTimes}
            // disabled
            >
              Find Times
            </Button>
            <div
              style={{
                marginTop: "-16px",
                mrginLeft: "-50px"
              }}
            >
              <DownloadDropDownComponent personName={downloadOption} handleChange={handleChangeDownloadDropDown} />
            </div>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip id="button-tooltip">&nbsp;&nbsp;Download</Tooltip>}
            >
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadAreasTimes}
                style={{ padding: "0.375rem 0.75rem" }} // Adjust padding to make it more compact
              >
                <FontAwesomeIcon icon={faDownload} />
              </Button>
            </OverlayTrigger>
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

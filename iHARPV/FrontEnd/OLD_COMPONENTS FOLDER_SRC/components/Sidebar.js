import React, { useState } from "react";
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
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
const drawerWidth = 355;

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
const now = 10;
export default function ({ open, handleDrawerClose }) {
  const classes = useStyles();
  // State variables to store longitude and latitude values
  const [north, setNorth] = useState("90");
  const [south, setSouth] = useState("-90");
  const [west, setWest] = useState("-180");
  const [east, setEast] = useState("180");

  // Function to handle changes in input values
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "north":
        setNorth(value);
        break;
      case "south":
        setSouth(value);
        break;
      case "west":
        setWest(value);
        break;
      case "east":
        setEast(value);
        break;
      default:
        break;
    }
  };

  // Function to handle download button click
  const handleDownload = async () => {
    try {
      // Send a POST request to the backend
      const response = await axios.post("/api/download-data", {
        north,
        south,
        west,
        east,
      });

      // Check if request was successful
      if (response.status === 200) {
        // Data successfully downloaded
        console.log({ north });
        console.log("Data downloaded successfully");
      } else {
        // Handle error
        console.error("Failed to download data");
      }
    } catch (error) {
      console.error("Error:", error);
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
              disableFuture
              label="Start Date & Time"
              minutesStep={60}
              sx={{ width: "60%", marginLeft: "10px" }}
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
              sx={{ width: "60%", marginLeft: "10px" }}
            />
          </LocalizationProvider>
          <div style={{ marginBottom: "20px" }}></div>
          <h4 className="sidebar-heading">Select Temporal Output Level</h4>
          <Form label="Select Output Level ">
            <div className="mb-4">
              <Form.Check
                inline
                label="Hourly"
                name="group1"
                type="radio"
                id="inline-radio-1"
                style={{ fontSize: "small", marginLeft: "10px" }}
              />
              <Form.Check
                inline
                label="Daily"
                name="group1"
                type="radio"
                id="inline-radio-2"
                style={{ fontSize: "small" }}
              />
              <Form.Check
                inline
                name="group1"
                label="Monthly"
                type="radio"
                id="inline-radio-3"
                style={{ fontSize: "small" }}
              />
              <Form.Check
                inline
                name="group1"
                label="Yearly"
                type="radio"
                id="inline-radio-4"
                style={{ fontSize: "small" }}
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
                  name="group2"
                  type={type}
                  id={`inline-2-${type}-1`}
                  style={{ fontSize: "small", marginLeft: "10px" }}
                />
                <Form.Check
                  inline
                  label="Maximum"
                  name="group2"
                  type={type}
                  id={`inline-2-${type}-2`}
                  style={{ fontSize: "small" }}
                />
                <Form.Check
                  inline
                  name="group2"
                  label="Average"
                  type={type}
                  id={`inline-2-${type}-3`}
                  style={{ fontSize: "small" }}
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
                  type="text"
                  name="north"
                  value={north}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
            <div class="column">
              <div class="cell">
                <label class="label">West:</label>
                <input
                  type="text"
                  name="west"
                  value={west}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              <div style={{ marginLeft: "20px" }}></div>
              <div class="cell">
                <label class="label">East:</label>
                <input
                  type="text"
                  name="east"
                  value={east}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
            <div class="row">
              <div class="cell">
                <label class="label">South:</label>
                <input
                  type="text"
                  name="south"
                  value={south}
                  onChange={handleInputChange}
                  className="input"
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
              onClick={handleDownload}
            >
              TimeSeries
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleDownload}
            >
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

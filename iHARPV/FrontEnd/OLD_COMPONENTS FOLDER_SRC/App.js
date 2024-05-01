import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, ThemeProvider, createMuiTheme } from "@material-ui/core";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Table from "react-bootstrap/Table";

import Map from "./components/Map";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";
import QueryForm from "./components/MyForm";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },

  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: -15,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
}));

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Make an HTTP request to the Django backend
    fetch("/api/temperature-data/")
      .then((response) => response.json())
      .then((data) => {
        // Log the received data to the console
        console.log("Temperature data:", data);
      })
      .catch((error) => {
        console.error("Error fetching temperature data:", error);
      });
    const fetchData = async () => {
      try {
        const response = await fetch("/api/temperature-data/");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = createMuiTheme({
    palette: {
      type: darkMode ? "dark" : "light",
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <Header
          handleDrawerToggle={handleDrawerToggle}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />

        {/* <Sidebar handleDrawerClose={handleDrawerClose} open={open} /> */}
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          <QueryForm />
          <Map />
          <Box
            component="ul"
            sx={{ display: "flex", gap: 1, flexWrap: "wrap", p: 0, m: 0 }}
          >
            <Card
              component="li"
              sx={{ maxWidth: 500, backgroundColor: "white" }}
            >
              <CardContent>
                {/* <div component="li" style={{ maxWidth: 500 }}> */}
                <img
                  src={require("./assets/temp_per_day.png")}
                  loading="lazy"
                  alt="Time Series Graph"
                  controls
                />
                {/* </div> */}
              </CardContent>
            </Card>
            <div component="li" style={{ maxWidth: 500 }}>
              <video
                controls
                autoPlay
                loop
                muted
                poster="https://assets.codepen.io/6093409/river.jpg"
                style={{ width: "100%", height: "100%" }}
              >
                <source
                  src={require("./assets/heatmapVideo.mp4")}
                  type="video/mp4"
                />
              </video>
            </div>
            <div component="li">
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                <Table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Temperature</th>
                    </tr>
                  </thead>
                </Table>
              </div>
            </div>
          </Box>
        </main>
      </div>
    </ThemeProvider>
  );
}

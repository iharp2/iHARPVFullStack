import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import Box from "@mui/joy/Box";
// import Table from "react-bootstrap/Table";
import ImageComponent from "./components/ImageComponent";
import VideoComponent from "./components/VideoComponent";
import NewMap from "./components/NewMap";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";
import logo from './components/umnlogo.ico'
import PlotlyFigure from './components/plotlyFigure';

// import QueryForm from "./components/MyForm";
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
    marginLeft: -20,
    marginRight: -21,
    marginTop: -20,
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
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [jsonFile,setJsonFile] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = createTheme({
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
        >
          <img src={logo} className="App-logo" alt="logo" />
        </Header>
        <Sidebar
          handleDrawerClose={handleDrawerClose}
          open={open}
          handleImageUpdate={setImageSrc}
          handleVideoUpdate={setVideoUrl}
          handleAreaQuery={setJsonFile}
          // videoUrl={videoUrl}
        />

        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />

          <NewMap />
          <Box
            component="ul"
            sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 0, m: 0 }}
          >
            <div component="li">
              <ImageComponent imageData={imageSrc} />
            </div>
            <div component="li">
              <VideoComponent videoSrc={videoUrl} />
            </div>
            <PlotlyFigure jsonData={jsonFile}/>

            {/* <div component="li">
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
            </div> */}
          </Box>
        </main>
      </div>
    </ThemeProvider>
  );
}

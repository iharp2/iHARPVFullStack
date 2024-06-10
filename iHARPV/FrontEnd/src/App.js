import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import Box from "@mui/joy/Box";
import TimeSeriesComponent from "./components/TimeSeriesComponent";
import HeatMapComponent from "./components/HeatMapComponent";
import MyMap from "./components/Map";
import Sidebar from "./components/Sidebar";
import "./App.css";
import AreasComponentMap from './components/AreasComponentMap';
import TableComponent from "./components/TableComponent";
import CollapsibleCard from "./components/CollapsibleCard";
const drawerWidth = 375;

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
    marginTop: -85,
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
  const [tableDataM, setTableDataM] = useState(null);

  // const handleDrawerToggle = () => {
  //   setOpen(!open);
  // };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = createTheme({
    palette: {
      type: darkMode ? "dark" : "light",
    },
  });

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  // };


  return (
    
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <Sidebar
          handleDrawerClose={handleDrawerClose}
          open={open}
          handleImageUpdate={setImageSrc}
          handleVideoUpdate={setVideoUrl}
          handleAreaQuery={setJsonFile}
          handleTable={setTableDataM}
          // videoUrl={videoUrl}
        />

        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          
          <Box sx={{ marginLeft: 0 , marginRight: 0,marginTop:0 }}> {/* Add margin to the left */}
              <MyMap />
          </Box>

          <Box
            component="ul"
            sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 0, m: 1 }}
          >
            <CollapsibleCard title="Image">
              <TimeSeriesComponent imageData={imageSrc} />
            </CollapsibleCard>
            <CollapsibleCard title="Table">
              <TableComponent tableData={tableDataM} />
            </CollapsibleCard>
          </Box>
          <Box
            component="ul"
            sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 0, m: 0 }}
          >
            <CollapsibleCard title="Video">
              <HeatMapComponent videoSrc={videoUrl} />
            </CollapsibleCard>
            <CollapsibleCard title="Plotly Figure">
              <AreasComponentMap jsonData={jsonFile} />
            </CollapsibleCard>
            <CollapsibleCard title="Video">
            <AreasComponentMap jsonData={jsonFile} />
            </CollapsibleCard>
           
          </Box>
        </main>
      </div>
    </ThemeProvider>
  );
}

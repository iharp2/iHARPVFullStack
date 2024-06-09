import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "2m Temperature",
  "Surface Pressure",
  "Total Precipitation",
  "2m dewpoint temperature",
  "10m u-component of wind",
  "10m v-component of wind",
  "Mean sea level pressure",
  "Mean wave direction",
  "Mean wave period",
  "Sea surface temperature",
];

export default function MyDropdown({ personName, handleChange }) {
  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">
          Select Variable
        </InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={personName}
          onChange={handleChange}
          autoWidth
          
          MenuProps={MenuProps}
          input={<OutlinedInput  label="Select Variable"/>}
        >
          
          {names.map((name) => (
            <MenuItem
              key={name}
              value={name}
              disabled={!["Surface Pressure", "2m Temperature", "Total Precipitation"].includes(name)}
            >
              {/* <Checkbox checked={personName.includes(name)} /> */}
              <ListItemText primary={name} />
            </MenuItem>
          ))}
          </Select>
      </FormControl>
    </div>
  );
}

// import * as React from "react";
// import OutlinedInput from "@mui/material/OutlinedInput";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import ListItemText from "@mui/material/ListItemText";
// import Select from "@mui/material/Select";
// import Checkbox from "@mui/material/Checkbox";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

// const names = [
//   "2m Temperature",
//   "Surface Pressure",
//   "Total Precipitation",
//   "2m dewpoint temperature",
//   "10m u-component of wind",
//   "10m v-component of wind",
//   "Mean sea level pressure",
//   "Mean wave direction",
//   "Mean wave period",
//   "Sea surface temperature",
//   "Significant height of combined wind waves and swell",
// ];

// export default function MyDropdown() {
//   const [personName, setPersonName] = React.useState([]);

//   const handleChange = (event) => {
//     setPersonName(event.target.value);
//   };


//   return (
//     <div>
//       <FormControl sx={{ m: 1, width: 300 }}>
//         <InputLabel id="demo-multiple-checkbox-label">
//           Select Variable(s)
//         </InputLabel>
//         <Select
//           labelId="demo-simple-select-autowidth-label"
//           id="demo-simple-select-autowidth"
//           value={personName}
//           onChange={handleChange}
//           autoWidth
//           label="Select Variable"
//         >
          
//           {names.map((name) => (
//             <MenuItem
//               key={name}
//               value={name}
//               disabled={!["Surface Pressure", "2m Temperature", "Total Precipitation"].includes(name)}
//             >
//               {/* <Checkbox checked={personName.includes(name)} /> */}
//               <ListItemText primary={name} />
//             </MenuItem>
//           ))}
//         </Select>
// {/*         
//         <Select
//           labelId="demo-multiple-checkbox-label"
//           id="demo-multiple-checkbox"
//           // multiple
//           value={personName}
//           onChange={handleChange}
//           input={<OutlinedInput label="Select Variable(s)" />}
//           renderValue={(selected) => selected.join(", ")}
//           MenuProps={MenuProps}
//         >
//           {names.map((name) => (
//             <MenuItem
//               key={name}
//               value={name}
//               disabled={!["Surface Pressure", "2m Temperature", "Total Precipitation"].includes(name)}
//             >
//               <Checkbox checked={personName.includes(name)} />
//               <ListItemText primary={name} />
//             </MenuItem>
//           ))}
//         </Select> */}
//       </FormControl>
//     </div>
//   );
// }

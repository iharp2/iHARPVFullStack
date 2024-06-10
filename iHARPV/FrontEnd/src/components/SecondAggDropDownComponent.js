import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 30;
const ITEM_PADDING_TOP = 1;
const MenuProps = {
  PaperProps: {
    style: {
      height: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      maxWidth: 100,
    },
  },
};

const names = [
 
  "min",
  "max",
  "mean",
  
];

export default function SecondAggDropDown({ personName, handleChange }) {
  return (
    <div>
      <FormControl sx={{ m: 1, width: '110px',height:'15px' }}>
        <InputLabel id="demo-multiple-checkbox-label" sx={{ fontSize: '15px',marginTop:"2px",marginRight:"2px"}}>
          Aggregation
        </InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={personName}
          onChange={handleChange}
          autoWidth
          
          MenuProps={MenuProps}
          input={<OutlinedInput  label="Select Variable"/>}
          sx={{ m: 1, width: '115px',height:'40px' }}
          
        >
          
          {names.map((name) => (
            <MenuItem
              key={name}
              value={name}
              // disabled={!["Surface Pressure", "2m Temperature", "Total Precipitation"].includes(name)}
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


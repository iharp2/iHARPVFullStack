import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 45;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      // width: 100,
    },
  },
};

const names = [
  "Areas",
  "Timees",


];

export default function DownloadDropDownComponent({ personName, handleChange }) {
  return (
    <div>
      <FormControl sx={{ m: 1, width: '105px', height: '10px', marginLeft: "-10px" }}>
        <InputLabel id="demo-multiple-checkbox-label" sx={{ fontSize: '14px', marginTop: "-2px", marginLeft: "3px" }}>
          Download
        </InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={personName}
          onChange={handleChange}
          autoWidth

          MenuProps={MenuProps}
          input={<OutlinedInput label="Select Variable" />}
          sx={{ m: 1, width: '102px', height: '35px' }}

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


// import * as React from 'react';
// import * as BaseNumberField from '@base_ui/react/NumberField';
// import { styled } from '@mui/system';
// import { useState,useEffect } from 'react';
// export default function QuantityInput({myValue,onChange}) {
//   const id = React.useId();
//   const [value, setValue] = useState(myValue);

//   useEffect(() => {
//     setValue(myValue); // Sync internal state when myValue prop changes
//   }, [myValue]);

//   const handleChange = (event, newValue) => {
//     setValue(newValue); // Update internal state
//     onChange(newValue); // Pass updated value to parent component
//   };
//   console.log("Inside Number, ",value);

//   return (
//     <NumberField allowWheelScrub value={value} onChange={handleChange} >
//       {/* <NumberLabel htmlFor={id}>Amount</NumberLabel> */}
//       <NumberFieldGroup>
//         <NumberFieldInput />
//       </NumberFieldGroup>
//     </NumberField>
//   );
// }

// const blue = {
//   100: '#CCE5FF',
//   200: '#99CCFF',
//   300: '#66B3FF',
//   400: '#3399FF',
//   600: '#0072E6',
//   800: '#004C99',
// };

// const grey = {
//   50: '#F9FAFB',
//   100: '#E5EAF2',
//   200: '#DAE2ED',
//   300: '#C7D0DD',
//   400: '#B0B8C4',
//   500: '#9DA8B7',
//   600: '#6B7A90',
//   700: '#434D5B',
//   800: '#303740',
//   900: '#1C2025',
// };

// // const NumberLabel = styled('label')`
// //   font-family: 'IBM Plex Sans', sans-serif;
// //   font-size: 1rem;
// //   font-weight: bold;
  
// // `;

// const NumberField = styled(BaseNumberField.Root)`
//   font-family: 'IBM Plex Sans', sans-serif;
//   font-size: 1rem;
//     margin-top:6px;

// `;

// const NumberFieldGroup = styled(BaseNumberField.Group)`
//   display: flex;
//   align-items: center;
//   margin-top: 0.25rem;
//   border-radius: 0.25rem;
//   border: 1px solid ${grey[300]};
//   border-color: ${grey[300]};
//   overflow: hidden;

//   &:focus-within {
//     outline: 2px solid ${blue[100]};
//     border-color: ${blue[400]};
//   }

//   .dark & {
//     border: 1px solid ${grey[700]};
//     border-color: ${grey[700]};

//     &:focus-within {
//       outline: 2px solid ${blue[800]};
//       border-color: ${blue[400]};
//     }
//   }
// `;

// const NumberFieldInput = styled(BaseNumberField.Input)`
//   position: relative;
//   z-index: 10;
//   align-self: stretch;
//   padding: 0.25rem 0.5rem;
//   line-height: 1.5;
//   border: none;
//   background-color: #fff;
//   color: ${grey[800]};
//   box-shadow: 0 1px 2px 0 rgba(0 0 0 / 0.05);
//   overflow: hidden;
//   max-width: 150px;
//   font-family: inherit;
//   font-size: inherit;
//   padding: 5px;
//   width: 100px;
//   height: 37.5px;
//   margin-top:0px;
//   &:focus {
//     outline: none;
//     z-index: 10;
//   }

//   .dark & {
//     background-color: ${grey[900]};
//     border-color: ${grey[700]};
//     color: ${grey[300]};

//     &:focus {
//       border-color: ${blue[600]};
//     }
//   }
// `;



import * as React from 'react';
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';

const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInputElement,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: '▴',
        },
        decrementButton: {
          children: '▾',
        },
      }}
      {...props}
      ref={ref}
    />
  );
});
export default function NumberInputBasic({myValue,onChange}) {
    const handleChange = (event, val) => {
        onChange(val); // Call the onChange prop with the updated value
      };
  return (
    <NumberInput
      aria-label="Demo number input"
      placeholder="value"
      // value={Math.round(myValue * 10) / 10}
      step={0.1}
      onChange={handleChange}
    />
  );
}

const blue = {
  100: '#DAECFF',
  200: '#80BFFF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 1px;
    width: 100px;
    height: 41px;
    margin-top:5px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
);



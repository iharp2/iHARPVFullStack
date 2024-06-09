import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CollapsibleCard = ({ title, children }) => {
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxHeight:'325px'}}>
      <CardHeader sx={{padding: '0px 0px' }}  />
      <CardActions disableSpacing sx={{ padding: '1px 1px', maxHeight: '15px',backgroundColor: 'black' }}>
        <IconButton onClick={handleExpandClick} aria-expanded={expanded} sx={{ color: 'white',backgroundColor:'black'}} >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ padding: '0px 0px' }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CollapsibleCard;

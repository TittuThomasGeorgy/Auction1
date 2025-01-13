import { Search } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Grid2 as Grid, InputAdornment, Stack, TextField } from '@mui/material';
import React from 'react'

interface PlayerFilterProps {
    filter: 'all' | 'sold' | 'unsold';
    onChange: (newVal: 'all' | 'sold' | 'unsold') => void;
}
const PlayerFilter = (props: PlayerFilterProps) => (
 
<Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <ButtonGroup >
        <Button
            variant={props.filter === "all" ? "contained" : "outlined"}
            onClick={() => props.onChange("all")}
        >
            All
        </Button>
        <Button
            variant={props.filter === "sold" ? "contained" : "outlined"}
            onClick={() => props.onChange("sold")}
        >
            Sold
        </Button>
        <Button
            variant={props.filter === "unsold" ? "contained" : "outlined"}
            onClick={() => props.onChange("unsold")}
        >
            Unsold
        </Button>
    </ButtonGroup>
</Box>
)

export default PlayerFilter
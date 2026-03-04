import { Search } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Grid2 as Grid, InputAdornment, Stack, TextField } from '@mui/material';
import React from 'react'

interface AuctionFilterProps {
    filter: 'all' | 'football' | 'cricket';
    onChange: (newVal: 'all' | 'football' | 'cricket') => void;
}
const AuctionFilter = (props: AuctionFilterProps) => (
 
<Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <ButtonGroup >
        <Button
            variant={props.filter === "all" ? "contained" : "outlined"}
            onClick={() => props.onChange("all")}
        >
            All
        </Button>
        <Button
            variant={props.filter === "football" ? "contained" : "outlined"}
            onClick={() => props.onChange("football")}
        >
            Football
        </Button>
        <Button
            variant={props.filter === "cricket" ? "contained" : "outlined"}
            onClick={() => props.onChange("cricket")}
        >
            Cricket
        </Button>
    </ButtonGroup>
</Box>
)

export default AuctionFilter
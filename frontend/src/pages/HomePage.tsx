import React from 'react';
import { Button, Box } from '@mui/material';
import { Gavel as GavelIcon, LocalPolice as ClubIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            flexDirection="column"
        >
            <Button variant="contained"
                size='large'
                startIcon={<GavelIcon />} sx={{ width: '120px' }}
                onClick={() => navigate('/auction')}>

                Auction
            </Button>
            <Button variant="contained"
                size='large'
                startIcon={<ClubIcon />} sx={{ width: '120px' }}
                onClick={() => navigate('/club')}>
                club
            </Button>
            <Button variant="contained"
                size='large'
                startIcon={<GroupsIcon />} sx={{ width: '120px' }}
                onClick={() => navigate('/player')}>

                Player
            </Button>
        </Box>
    );
};

export default HomePage;

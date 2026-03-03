import React from 'react';
import { Box, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { SportsSoccer as FootballIcon, SportsCricket as CricketIcon, Groups as GroupsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Authenticate';
import { IClub } from '../types/ClubType';
import NavBar from '../components/NavBar';

const HomePage = () => {
    const curClub= useAuth();
    const navigate = useNavigate();

    const handleCardClick = (route: string) => {
        navigate(route);
    };

    return (
       <>
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={3}
        >
            {/* Auction Card */}
            <Card
                sx={{
                    width: 250,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0f3a67',
                    borderRadius: '15px',
                    boxShadow: 4,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease-in-out',
                    },
                    cursor: 'pointer',
                }}
                onClick={() => handleCardClick('/auction/football')}
            >
                <CardActionArea>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: '#fff',
                        }}
                    >
                        <FootballIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            FOOTBALL
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            {/* Club Card */}
            <Card
                sx={{
                    width: 250,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#154777',
                    borderRadius: '15px',
                    boxShadow: 4,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease-in-out',
                    },
                    cursor: 'pointer',
                }}
                onClick={() => handleCardClick('/auction/cricket')}
            >
                <CardActionArea>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: '#fff',
                        }}
                    >
                        <CricketIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            CRICKET
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

        </Box>
        </>
    );
};

export default HomePage;

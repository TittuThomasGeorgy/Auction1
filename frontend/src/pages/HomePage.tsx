import React from 'react';
import { Box, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { Gavel as GavelIcon, LocalPolice as ClubIcon, Groups as GroupsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleCardClick = (route: string) => {
        navigate(route);
    };

    return (
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
                onClick={() => handleCardClick('/auction')}
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
                        <GavelIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            AUCTION
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
                onClick={() => handleCardClick('/club')}
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
                        <ClubIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            CLUB
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>

            {/* Player Card */}
            <Card
                sx={{
                    width: 250,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#1b5587',
                    borderRadius: '15px',
                    boxShadow: 4,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease-in-out',
                    },
                    cursor: 'pointer',
                }}
                onClick={() => handleCardClick('/players')}
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
                        <GroupsIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            PLAYER
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card
                sx={{
                    width: 250,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#216397',
                    borderRadius: '15px',
                    boxShadow: 4,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease-in-out',
                    },
                    cursor: 'pointer',
                }}
                onClick={() => handleCardClick('/settings')}
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
                        <SettingsIcon sx={{ fontSize: 50 }} />
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            SETTINGS
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default HomePage;

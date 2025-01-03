import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Avatar, Stack } from '@mui/material';
import { IClub } from '../types/ClubType';
import { useNavigate } from 'react-router-dom';



interface ClubCardProps {
    club: IClub;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
    const navigate = useNavigate();
    return (
        <Card
            sx={{
                maxWidth: 300,
                bgcolor: '#f0f4ff',
                borderRadius: 4,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
            }}
            onClick={() => navigate(`/club/${club._id}`)}
        >
            {/* Club Logo */}
            <CardMedia
                component="img"
                image={club.logo}
                alt={`${club.name} logo`}
                sx={{
                    height: 150,
                    objectFit: 'contain',
                    bgcolor: '#e3f2fd',
                }}
            />
            {/* Club Details */}
            <CardContent>
                <Stack
                    direction="row"
                    alignItems="center"
                    textAlign="center"
                    justifyContent="center"
                    spacing={1} // Adds spacing between the items
                    sx={{ mb: 1 }} // Adds bottom margin to the Stack
                >
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#1e88e5' }}
                    >
                        {club.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#757575' }}
                    >
                        {`(${club.code})`}
                    </Typography>
                </Stack>

                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2 }}
                >
                    <Avatar
                        src={club.manager.img}
                        alt={club.manager.name}
                        sx={{ width: 56, height: 56, boxShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}
                    />
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: '500', color: '#1e88e5' }}>
                            {club.manager.name}
                        </Typography>
                    </Box>
                </Box>

            </CardContent>
        </Card>
    );
};

export default ClubCard;

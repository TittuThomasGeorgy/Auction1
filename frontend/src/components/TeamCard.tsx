import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Avatar, Stack } from '@mui/material';
import { ITeam } from '../types/TeamType';
import { useNavigate } from 'react-router-dom';



interface ClubCardProps {
    team: ITeam;
}

const TeamCard: React.FC<ClubCardProps> = ({ team }) => {
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
            onClick={() => navigate(`/team/${team._id}`)}
        >
            {/* Club Logo */}
            <CardMedia
                component="img"
                image={team.logo}
                alt={`${team.name} logo`}
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
                        {team.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#757575' }}
                    >
                        {`(${team.code})`}
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
                        src={team.manager.img}
                        alt={team.manager.name}
                        sx={{ width: 56, height: 56, boxShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}
                    />
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: '500', color: '#1e88e5' }}>
                            {team.manager.name}
                        </Typography>
                    </Box>
                </Box>

            </CardContent>
        </Card>
    );
};

export default TeamCard;

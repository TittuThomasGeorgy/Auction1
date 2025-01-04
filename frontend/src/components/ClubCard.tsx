import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { IClub } from '../types/ClubType';
import { useNavigate } from 'react-router-dom';

interface ClubCardProps {
    club: IClub;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                width: 240,
                height: 320,
                background: 'linear-gradient(135deg, #0f3a67, #1c5c94)', // Dark blue to complementary blue gradient
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.4)',
                padding: '10px 15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { transform: 'scale(1.05)' },
                cursor: 'pointer',
            }}
            onClick={() => navigate(`/club/${club._id}`)}
        >
            {/* Decorative Background Element */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 0 100%)',
                    zIndex: 1,
                }}
            />

            {/* Club Logo */}
            <Box
                component="img"
                src={club.logo}
                alt={`${club.name} logo`}
                sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    position: 'absolute',
                    top: 20,
                    zIndex: 2,
                }}
            />

            {/* Club Name */}
            <Typography
                sx={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.9)',
                    position: 'absolute',
                    top: 110,
                    left: 15,
                    right: 15,
                    textAlign: 'center',
                    zIndex: 2,
                }}
            >
                {club.name}
            </Typography>

            {/* Manager Info */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    textAlign: 'center',
                    zIndex: 2,
                }}
            >
                <Avatar
                    src={club.manager.img}
                    alt={club.manager.name}
                    sx={{
                        width: 50,
                        height: 50,
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.3)',
                    }}
                />
                <Typography
                    sx={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    {club.manager.name}
                </Typography>
            </Box>
        </Box>
    );
};

export default ClubCard;

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ClubCardProps {
    club: { _id: string; name: string; logo: string; balance: number };
    disabled?: boolean;
    onClick: () => void;
    playerCount: number;
    maxPlayers: number;
}

const AuctionClubCard: React.FC<ClubCardProps> = ({ club, disabled, onClick, playerCount, maxPlayers }) => {
    const fillPercentage = (playerCount / maxPlayers) * 100;
    const getProgressColor = () => (fillPercentage === 100 ? '#FF4747' : fillPercentage >= 75 ? '#FFA500' : '#4CAF50');

    return (
        <Box
            sx={{
                width: { xs: 150, sm: 180, md: 220 },
                height: { xs: 180, sm: 220, md: 260 },
                background: disabled ? 'gray' : 'linear-gradient(135deg, #4b5320, #a9ba9d)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: disabled ? '0px 4px 10px rgba(0, 0, 0, 0.3)' : '0px 8px 20px rgba(0, 0, 0, 0.4)',
                padding: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                '&:hover': disabled ? undefined : { transform: 'scale(1.05)' },
            }}
            onClick={() => !disabled && onClick()}
            onDoubleClick={() => !disabled && window.open(`/club/${club._id}`, '_blank')}
        >
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
            <Box
                component="img"
                src={club.logo}
                alt={`${club.name} logo`}
                sx={{
                    width: { xs: 60, sm: 70, md: 90 },
                    height: { xs: 60, sm: 70, md: 90 },
                    objectFit: 'contain',
                    position: 'absolute',
                    top: { xs: 10, sm: 15, md: 20 },
                    zIndex: 2,
                }}
            />
            <Typography
                sx={{
                    fontSize: { xs: '14px', sm: '16px', md: '18px' },
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.9)',
                    position: 'absolute',
                    top: { xs: 80, sm: 100, md: 120 },
                    left: 10,
                    right: 10,
                    textAlign: 'center',
                    zIndex: 2,
                }}
            >
                {club.name}
            </Typography>
            <Box sx={{ position: 'absolute', bottom: { xs: 40, sm: 50, md: 60 }, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
                <Typography sx={{ fontSize: { xs: '12px', sm: '14px', md: '16px' }, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                    ${club.balance.toLocaleString()} M
                </Typography>
            </Box>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    right: 10,
                    textAlign: 'center',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: '4px', md: '10px' },
                }}
            >
                <LinearProgress
                    variant="determinate"
                    value={fillPercentage}
                    sx={{
                        width: { xs: '90%', md: '70%' },
                        height: { xs: 4, sm: 5, md: 6 },
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { backgroundColor: getProgressColor() },
                    }}
                />
                <Typography sx={{ fontSize: { xs: '10px', sm: '12px', md: '14px' }, fontWeight: 'bold', color: getProgressColor(), whiteSpace: 'nowrap' }}>
                    {playerCount} / {maxPlayers}
                </Typography>
            </Box>
        </Box>
    );
};

export default AuctionClubCard;

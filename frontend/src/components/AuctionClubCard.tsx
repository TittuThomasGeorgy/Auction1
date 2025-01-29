import React from 'react';
import { Box, Typography } from '@mui/material';
import { IClub } from '../types/ClubType';
// import { useNavigate } from 'react-router-dom';

interface ClubCardProps {
    club: IClub;
    disabled?: boolean; // Optional property to disable the card
    onClick: () => void
}

const AuctionClubCard = (props: ClubCardProps) => {
    // const navigate = useNavigate();

    return (
        <Box
            sx={{
                width: 200,
                height: 200, // Adjusted height to accommodate extra info
                background: props.disabled
                    ? 'gray' // Disabled state background
                    : 'linear-gradient(135deg, #4b5320, #a9ba9d)', // Alternate green gradient for active cards
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: props.disabled
                    ? '0px 4px 10px rgba(0, 0, 0, 0.3)' // Subtle shadow for disabled
                    : '0px 8px 20px rgba(0, 0, 0, 0.4)', // More pronounced shadow for active
                padding: '10px 15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.6 : 1, // Dim the card if disabled
                '&:hover': props.disabled
                    ? undefined // No hover effect if disabled
                    : { transform: 'scale(1.05)' },
            }}
            onClick={() => {
                if (!props.disabled) {
                    // navigate(`/club/${props.club._id}`);
                    props.onClick();
                }
            }}
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
                src={props.club.logo}
                alt={`${props.club.name} logo`}
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
                {props.club.name}
            </Typography>

            {/* Club Balance */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 30,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 2,
                }}
            >
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    ${props.club.balance.toLocaleString()} M
                </Typography>
            </Box>


        </Box>
    );
};

export default AuctionClubCard;

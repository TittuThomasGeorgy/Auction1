import React from 'react';
import { Box, Typography } from '@mui/material';
import { IClub } from '../types/ClubType';
import { IPlayer } from '../types/PlayerType';

interface PlayerCardProps {
    player: IPlayer;
    club: IClub | null;
    onClick?: () => void;
}

const PlayerCard = (props: PlayerCardProps) => {
    return (
        <Box
            sx={{
                width: 260,
                height: 360,
                background: 'linear-gradient(145deg, #12263f, #1c4a7d)', // Strong blue gradient
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.5)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': props.onClick ? { transform: 'scale(1.03)' } : undefined,
                cursor: props.onClick ? 'pointer' : undefined,
            }}
            onClick={() => {
                props.onClick && props.onClick();
            }}
        >
            {/* Player Position (Top Left) */}
            <Typography
                sx={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 3,
                    textShadow: '0px 3px 6px rgba(0, 0, 0, 0.8)',
                }}
            >
                {props.player.position}
            </Typography>

            {/* Club Logo (Below Position, Left Side) */}
            {props.player.club && (
                <Box
                    component="img"
                    src={props.club?.logo}
                    alt={props.club?.name}
                    sx={{
                        width: 60,
                        height: 60,
                        position: 'absolute',
                        top: 60,
                        left: 10,
                        zIndex: 3,
                        // backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slight transparent background to match the design
                    }}
                />
            )}

            {/* Decorative Background Element */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    zIndex: 1,
                }}
            />

            {/* Player Image (Right Side) */}
            <Box
                sx={{
                    width: 200,
                    // height: 200,
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '40%',
                    right: -10,
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            >
                <Box
                    component="img"
                    src={props.player.image}
                    alt={props.player.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </Box>

            {/* Player Name */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 70,
                    width: '100%',
                    textAlign: 'center',
                    zIndex: 3,
                }}
            >
                <Typography
                    sx={{
                        fontSize: '22px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)',
                    }}
                >
                    {props.player.name}
                </Typography>
            </Box>

            {/* Price and Bid Section */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 30,
                    width: '100%',
                    textAlign: 'center',
                    zIndex: 3,
                }}
            >

                {props.player.bid ? (
                    <Typography
                        variant='h6'
                        sx={{
                            fontWeight: 700,
                            color: '#a3ffb3',
                            // marginTop: '4px',
                        }}
                    >
                        BID AMOUNT: ${props.player.bid}M
                    </Typography>
                ) : <Typography
                    variant='h6'

                    sx={{
                        fontWeight: 600,
                        color: '#86c5ff',
                    }}
                >
                    BASE PRICE: ${props.player.basePrice}M
                </Typography>}
            </Box>

            {/* Bottom Gradient Decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '25%',
                    background: 'linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.6))',
                    zIndex: 1,
                }}
            />
        </Box>
    );
};

export default PlayerCard;

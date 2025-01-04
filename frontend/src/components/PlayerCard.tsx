import React from 'react';
import { Box, Typography } from '@mui/material';
import { IClub } from '../types/ClubType';

export interface IPlayer {
    _id: string;
    name: string;
    image: string; // Player image (transparent PNG)
    position: PlayerPosition; // Position (e.g., ST, CM)
    basePrice: number; // Base price
    bid?: string; // Optional bid
    club?: string; // Optional club
}

export type PlayerPosition = 'ST' | 'CM' | 'DF' | 'GK';


const PlayerCard = (props: { player: IPlayer, club: IClub | null, onClick?: () => void }) => {
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
                // backdropFilter: 'blur(3px)', // Glassy effect
                '&:hover': { transform: 'scale(1.05)' },
            }}
            onClick={() => { props.onClick && props.onClick() }}
        >
            {/* Top Section: Position */}
            <Typography
                sx={{
                    fontSize: '30px',
                    fontWeight: 'bold',
                    color: 'rgba(255, 255, 255, 0.9)',
                    position: 'absolute',
                    // top: 10,
                    left: 10,
                }}
            >
                {props.player.position}
            </Typography>

            {/* Club Image */}
            {props.player.club && (<Box
                component="img"
                src={props.club?.logo}
                alt={props.player.name}
                sx={{
                    width: 50,
                    height: 50,
                    left: 10,
                    top: 60,
                    position: 'absolute'
                }}

            />)}
            {/* Player Image */}
            <Box
                component="img"
                src={props.player.image}
                alt={props.player.name}
                sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '30%',
                    right: -10,
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            />

            {/* Player Details */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 25,
                    left: 15,
                    textAlign: 'center',
                    color: '#fffff',
                    width: '100%'
                }}

            >
                <Typography
                    sx={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                    }}

                >
                    {props.player.name}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '16px',
                        marginTop: '4px',
                    }}
                >
                    Base Price: ${props.player.basePrice}M
                </Typography>
                {props.player.bid && (
                    <Typography
                        sx={{
                            fontSize: '14px',
                            marginTop: '4px',
                        }}
                    >
                        Bid: ${props.player.bid}M
                    </Typography>
                )}

            </Box>

            {/* Decorative Background Element */}
            {/* Decorative Background Element */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 0 100%)',
                }}
            />
        </Box>

    );
};

export default PlayerCard;


import React from 'react';
import { Box, Typography, Zoom } from '@mui/material';
import { IClub } from '../types/ClubType';
import { IPlayer } from '../types/PlayerType';
import { IAuction } from '../types/AuctionType';

interface AuctionCardProps {
    auction: IAuction;
    onClick?: () => void;
}

const AuctionCard = (props: AuctionCardProps) => {
    return (
        <>
            {/* Main Auction Card */}
            <Box
                sx={{
                    width: 240,
                    height: 280,
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
                onClick={() => props.onClick && props.onClick()}
            >


                {/* Decorative Background */}
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

                {/* Player Image */}
                {/* <Box
                    sx={{
                        width: 200,
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
                </Box> */}

                {/* Player Name */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 30,
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
                        {props.auction.name}
                    </Typography>
                </Box>


            </Box>
        </>
    );
};

export default AuctionCard;

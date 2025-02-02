import { Dialog, Box, Fade, Typography, DialogActions, Button, DialogContent, IconButton, Zoom } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { IPlayer } from '../types/PlayerType';
import { IClub } from '../types/ClubType';
import PlayerCard from './PlayerCard';
import Animations from '../animations';
import Lottie from 'react-lottie';
import { Close as CloseIcon } from '@mui/icons-material';
interface PopupProps {
    open: boolean;
    onClose: () => void;
    player: IPlayer;
    club: IClub;
    // timer: number;
}

const PlayerSoldModal = (props: PopupProps) => {
    const defaultOptions = useMemo(() => ({
        loop: true,
        autoplay: true, // Reduce initial load impact
        animationData: Animations.firework,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    }), []);
    const MemoizedPlayerCard = React.memo(PlayerCard, (prevProps, nextProps) =>
        prevProps.player._id === nextProps.player._id && prevProps.club?._id === nextProps.club?._id
    );

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            maxWidth="md"
            sx={{
                '& .MuiDialog-paper': {
                    background: 'rgba(15, 30, 50, 0.95)', // Deep navy blue, clean sports feel
                    borderRadius: '16px',
                    padding: '30px',
                    color: '#fff',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                },
            }}
            disableEnforceFocus
            disableAutoFocus
            keepMounted
        >
            {/* Close Button */}
            <IconButton
                onClick={() => props.onClose()}
                sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                    },
                }}
            >
                <CloseIcon fontSize="medium" />
            </IconButton>
            {/* Fireworks on both sides */}
            {/* <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                }}
            >
                <Lottie options={defaultOptions} height={200} width={200} />
            </Box> */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 100,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    display: props.open ? 'flex' : 'none',  // Instead of unmounting
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Lottie options={defaultOptions} width="100%" height="100%" />
            </Box>
            {/* Welcome Message */}
            <Fade in={props.open} timeout={{ enter: 2000, exit: 300 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        fontFamily: '"Rajdhani", sans-serif', // Sporty and sleek
                        letterSpacing: '2px',
                        background: 'linear-gradient(90deg, #1DB954, #17A589)', // Sporty green-teal gradient
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textTransform: 'uppercase',
                    }}
                >
                    Welcome
                </Typography>
            </Fade>
            {/* Centered Player Card with Fade Effect */}
            {/* {props.open && ( */}
            <Zoom in={props.open} timeout={2500}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <MemoizedPlayerCard player={props.player} club={props.club} />
                </Box>
            </Zoom>
            {/* )} */}

            {/* Club Logo & Name */}
            <Fade in={props.open} timeout={{ enter: 2000, exit: 300 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}>
                    <Box
                        component="img"
                        src={props.club.logo}
                        alt={props.club.name}
                        sx={{
                            width: 60,
                            height: 60,
                            transition: 'all 0.5s ease-in-out',
                        }}
                    />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            fontFamily: '"Teko", sans-serif', // Clean and sporty
                            letterSpacing: '1.5px',
                            background: 'linear-gradient(90deg, #FFC107, #FF9800)', // Golden-orange sports gradient
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textTransform: 'uppercase',
                            ml: 2,
                        }}
                    >
                        {props.club.name}
                    </Typography>
                </Box>
            </Fade>


        </Dialog>
    );
};

export default PlayerSoldModal;

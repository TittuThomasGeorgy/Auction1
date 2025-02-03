import { Dialog, Box, Fade, Typography, DialogActions, Button, DialogContent, IconButton, Zoom } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { IPlayer } from '../types/PlayerType';
import { IClub } from '../types/ClubType';
import PlayerCard from './PlayerCard';
import { Close as CloseIcon } from '@mui/icons-material';
import Lottie from 'react-lottie';
import Animations from '../animations';

interface PopupProps {
    open: boolean;
    onClose: () => void;
    player: IPlayer;
    club: IClub;
}

const PlayerSoldModal = (props: PopupProps) => {
    const MemoizedPlayerCard = React.memo(PlayerCard, (prevProps, nextProps) =>
        prevProps.player._id === nextProps.player._id && prevProps.club?._id === nextProps.club?._id
    );
    const [flash, setFlash] = useState(false);

    // Trigger flash on open
    useEffect(() => {
        if (props.open) {
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 2000); // Flash duration
            return () => clearTimeout(timer); // Cleanup on close
        }
    }, [props.open]);
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            maxWidth="md"
            sx={{
                '& .MuiDialog-paper': {
                    background: 'rgba(15, 30, 50, 0.95)',
                    borderRadius: '16px',
                    padding: '30px',
                    color: '#fff',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: flash ? 'flashColor 0.2s ease-in-out  infinite' : 'none',
                    '@keyframes flashColor': {
                        '0%': { background: 'rgba(211, 211, 211, 0.95)', },  // Orange Red
                        '50%': { background: 'rgba(15, 30, 50, 0.95)', },  // Gold Flash
                        '100%': { background: 'rgba(211, 211, 211, 0.95)', },
                    },

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

            {/* Welcome Message */}
            <Fade in={props.open} timeout={{ enter: 2000, exit: 300 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        fontFamily: 'Rajdhani, sans-serif',
                        letterSpacing: '2px',
                        background: 'linear-gradient(90deg, #1DB954, #17A589)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textTransform: 'uppercase',
                    }}
                >
                    Welcome
                </Typography>
            </Fade>

            {/* Centered Player Card with Fade Effect */}
            <Zoom in={props.open} timeout={2500}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <MemoizedPlayerCard player={props.player} club={props.club} />
                </Box>
            </Zoom>

            {/* Club Logo & Name */}
            <Fade in={props.open} timeout={{ enter: 2000, exit: 300 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}>
                    <Box
                        component="img"
                        src={props.club.logo}
                        alt={props.club.name}
                        sx={{ width: 60, height: 60, transition: 'all 0.5s ease-in-out' }}
                    />
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            fontFamily: 'Teko, sans-serif',
                            letterSpacing: '1.5px',
                            background: 'linear-gradient(90deg, #FFC107, #FF9800)',
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

import { Modal, Fade, Box, Typography, Dialog, Slide } from '@mui/material'
import React from 'react'
import { IPlayer } from '../types/PlayerType';
import { IClub } from '../types/ClubType';
import { TransitionProps } from '@mui/material/transitions';

interface PopupProps {
    open: boolean;
    onClose: () => void;
    player: IPlayer;
    club: IClub;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const PlayerSoldModal = (props: PopupProps) => {
    return (
        <Dialog
            open={props.open}
            onClose={() => props.onClose()}
            TransitionComponent={Transition}
            keepMounted
            sx={{
                '& .MuiDialog-paper': {
                    background: 'linear-gradient(145deg, #12263f, #1c4a7d)',
                    borderRadius: '16px',
                    padding: '20px',
                    color: '#fff',
                    textAlign: 'center',
                },
            }}
        >
            {/* Player Image */}
            <Box
                component="img"
                src={props.player.image}
                alt={props.player.name}
                sx={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.5)',
                }}
            />

            {/* Player Name */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    marginTop: '16px',
                    textTransform: 'uppercase',
                    textShadow: '0px 3px 6px rgba(0, 0, 0, 0.8)',
                }}
            >
                {props.player.name}
            </Typography>

            {/* Club Logo */}
            <Box
                component="img"
                src={props.club.logo}
                alt={props.club.name}
                sx={{
                    width: '100px',
                    height: '100px',
                    marginTop: '16px',
                    objectFit: 'contain',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.5)',
                }}
            />

            {/* Club Name */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    marginTop: '8px',
                    textShadow: '0px 2px 5px rgba(0, 0, 0, 0.7)',
                }}
            >
                {props.club.name}
            </Typography>
        </Dialog>
    )
}

export default PlayerSoldModal
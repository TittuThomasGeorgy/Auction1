import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import useClub from '../services/ClubService';
import { defPlayer, defSettings } from '../services/DefaultValues';
import usePlayer from '../services/PlayerService';
import useSettings from '../services/SettingsService';
import { IPlayer } from '../types/PlayerType';
import { ISettings } from '../types/SettingsType';
import { Container, Button, Stack, Box, Typography, Grid2 as Grid, Divider, LinearProgress } from '@mui/material';
import AddClubDialog from '../components/AddClubDialog';
import BackButton from '../components/BackButton';
import SquadComponent from '../components/Squad';
import { AccountCircle as UserIcon, Edit as EditIcon, Delete as DeleteIcon, AttachMoney as SellIcon } from '@mui/icons-material';
import AddPlayerDialog from '../components/AddPlayerDialog';
import PlayerCard from '../components/PlayerCard';
import { IClub } from '../types/ClubType';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { enqueueSnackbar } from 'notistack';

const PlayerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const ClubServ = useClub();
    const PlayerServ = usePlayer();
    const settingsServ = useSettings();
    const [open, setOpen] = useState<'edit' | 'sell' | 'delete' | null>(null);
    const [player, setPlayer] = useState<IPlayer>(defPlayer)
    const [club, setClub] = useState<IClub | null>(null);
    const [settings, setSettings] = useState<ISettings>(defSettings);
    const getData = async (_id: string) => {
        const res = await PlayerServ.getById(_id);
        setPlayer(res.data);
    }
    const getClub = async (_id: string) => {
        const res = await ClubServ.getById(_id);
        setClub(res.data);
    }
    useEffect(() => {
        if (id)
            getData(id);
    }, [id])
    useEffect(() => {
        if (player.club)
            getClub(player.club)
    }, [player])

    return (
        <>
            <BackButton />
            <br />
            <Container sx={{
                bgcolor: 'rgba(24, 24, 24, 0.75)'
            }}>
                <br />

                <Typography variant="h4" color="initial" >
                    <UserIcon sx={{ mr: 1 }} fontSize="large" />
                    PLAYER</Typography>
                {/* <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>

                    <Box
                        component="img"
                        src={club.logo}
                        alt={`${club.name} logo`}
                        sx={{
                            width: 50,
                            height: 50,
                            objectFit: 'contain',
                            // position: 'absolute',
                            top: 20,
                            zIndex: 2,
                        }}
                    />

                    <Typography
                        variant="h4"
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#1e88e5', justifyContent: 'center', textAlign: 'center' }}
                    >
                        {club.name}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#757575' }}>
                        {`(${club.code})`}
                    </Typography>

                </Stack> */}
                <Grid container spacing={1}>

                    <Grid size={{ xs: 12, md: 4 }} borderRight={{
                        md: '2px solid rgba(255, 255, 255, 0.2)',
                        xs: 'none'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            position: 'relative',
                        }}>
                            <PlayerCard player={player} club={club} onClick={() => {
                                // setAction('edit');
                                // setPlayer(_player)
                                // setOpen(true)
                                // navigate(`/player/${_player._id}`)
                            }} />
                            <Divider sx={{ my: 2 }} />
                            <Stack direction={'row'}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ textTransform: 'none', float: 'right', mr: .5 }}
                                    startIcon={<EditIcon />}
                                    onClick={() => setOpen('edit')}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ textTransform: 'none', float: 'right', mr: .5 }}
                                    startIcon={<SellIcon />}
                                    onClick={() => setOpen('sell')}
                                >
                                    Sell
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    sx={{ textTransform: 'none', float: 'right' }}
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setOpen('delete')}
                                >
                                    Delete
                                </Button>
                            </Stack>
                            <br />
                            {/* <Typography
                                    sx={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                    }}
                                >
                                    Balance:  ${club.balance.toLocaleString()} M
                                </Typography>
                                <br />
                                <Typography
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: getProgressColor(),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        flexDirection: 'column'
                                    }}
                                > */}
                            {/* <SportsSoccerIcon sx={{ fontSize: 18 }} />
                {/* Progress Bar */}
                            {/* <LinearProgress
                                        variant="determinate"
                                        value={fillPerCent}
                                        sx={{
                                            width: '80%',
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getProgressColor(),
                                            },
                                            margin: '5px auto',
                                        }}
                                    />
                                    {players.length} / {settings.playersPerClub}

                                </Typography> */}
                        </Box >

                        {/* </Box> */}

                    </Grid >
                    <Grid size={{ xs: 12, md: 8 }}>
                        {/* <SquadComponent squad={players} /> */}
                    </Grid>
                </Grid >
                <br />
            </Container >

            <AddPlayerDialog open={open === 'edit'} onClose={() => setOpen(null)}
                action={'edit'}
                onSubmit={(newValue) =>
                    setPlayer(newValue)
                }
                value={player}
                bidMultiple={settings.bidMultiple}
            />
            <ConfirmationDialog
                open={open === 'delete'} onClose={() => setOpen(null)}
                onConfirm={async () => {
                    const res = await PlayerServ.delete(player._id);
                    if (res.success) {
                        enqueueSnackbar({
                            variant: "success",
                            message: res.message
                        })
                        navigate('/players/')
                    }
                    else
                        enqueueSnackbar({
                            variant: "error",
                            message: `Deleting Failed`
                        })
                }} title={`Are sure  want to delete ${player.name}?`} />

        </>
    );
}

export default PlayerView
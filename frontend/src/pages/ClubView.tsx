import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Stack,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Button,
    Container,
    Grid2 as Grid,
    LinearProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IClub } from '../types/ClubType';
import useClub from '../services/ClubService';
import { Delete as DeleteIcon, Edit as EditIcon, Logout as LogoutIcon, } from '@mui/icons-material';
import AddClubDialog from '../components/AddClubDialog';
import BackButton from '../components/BackButton';
import { defClub, defSettings } from '../services/DefaultValues';
import usePlayer from '../services/PlayerService';
import { IPlayer } from '../types/PlayerType';
import SquadComponent from '../components/SquadComponent';
import useSettings from '../services/SettingsService';
import { ISettings } from '../types/SettingsType';
import { initSocket } from '../services/SocketClient';
import { IBid } from '../types/BidType';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '../hooks/Authenticate';
import SpeedDialComponent from '../components/SpeedDialComponent';
import NavBar from '../components/NavBar';


const ClubView = () => {
    const curClub = useAuth();

    const { id } = useParams();
    const navigate = useNavigate();

    const ClubServ = useClub();
    const settingsServ = useSettings();
    const PlayerServ = usePlayer();
    const [club, setClub] = useState<IClub>(defClub);
    const [open, setOpen] = useState(false);
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [settings, setSettings] = useState<ISettings>(defSettings);
    const [fillPerCent, setFillPerCent] = useState(0)

    // Define dynamic colors based on player count
    const getProgressColor = () => {
        if (fillPerCent === 100) return '#FF4747'; // Red if full
        if (fillPerCent >= 75) return '#FFA500'; // Orange if nearly full
        return '#4CAF50'; // Green if room available
    };
    const getData = async (_id: string) => {
        const res = await ClubServ.getById(_id);
        setClub(res.data);
        const res2 = await PlayerServ.getAll({ club: _id })
        setPlayers(res2.data)
        const res3 = await settingsServ.get()
        setSettings(res3.data)
        setFillPerCent((res2.data.length / res3.data.playersPerClub) * 100)

    }
    useEffect(() => {
        if (id)
            getData(id);
    }, [id])
    useEffect(() => {
        const socket = initSocket();
        // Listen for the start of a new auction
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            const bid = res.data.bid;
            if (bid && bid.club === id) {
                getData(id);
                enqueueSnackbar({ message: res.message, variant: 'info' })
            }
        })

        socket.on('playerUpdated', (res: { data: { player: IPlayer }, message: string }) => {
            const player = players.find(_player => res.data.player._id == _player._id);
            if (player) {
                setPlayers(_players => _players.map(_player => res.data.player._id === _player._id ? res.data.player : _player));
                enqueueSnackbar({ message: res.message, variant: 'info' })
            }
        })
        socket.on('playerClubRemoved', (res: { data: { _id: string }, message: string }) => {
            const player = players.find(_player => res.data._id === _player._id);
            if (player) {
                setPlayers(_players => _players.filter(_player => res.data._id !== _player._id));
                setClub(club => ({ ...club, balance: club.balance + Number(player.bid) }))
                enqueueSnackbar({ message: res.message, variant: 'info' })
            }
        })
        socket.on('playerDeleted', (res: { data: { _id: string }, message: string }) => {
            const player = players.find(_player => res.data._id === _player._id);
            if (player) {
                setPlayers(_players => _players.filter(_player => res.data._id !== _player._id));
                setClub(club => ({ ...club, balance: club.balance + Number(player.bid) }))
                enqueueSnackbar({ message: res.message, variant: 'info' })
            }

        })
        return () => {
            socket.off('playerSold');
            socket.off('playerClubRemoved');
            socket.off('playerUpdated');
            socket.off('playerDeleted');
        };
    }, []);
    return (
        <>
            <BackButton onClick={() => navigate('/club')} />

            <br />
            <Container sx={{
                bgcolor: 'rgba(24, 24, 24, 0.75)'
            }}>
                <br />
                {(curClub.club as IClub)._id === id && <Button
                    variant="contained"
                    color="error"
                    sx={{ textTransform: 'none', float: 'right', ml: .5 }}
                    startIcon={<LogoutIcon />}
                    onClick={() => {
                        localStorage.removeItem('curClub');
                        curClub.setClub(false);
                        navigate('/login');
                    }}
                >
                    LOGOUT
                </Button>}
                {(curClub.club as IClub).isAdmin && <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none', float: 'right' }}
                    startIcon={<EditIcon />}
                    onClick={() => setOpen(true)}
                >
                    EDIT
                </Button>}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>

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

                </Stack>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 3 }}
                        borderRight={{
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
                            <Box
                                component="img"

                                src={club.manager.img}
                                alt={club.manager.name}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold', color: '#1e88e5', mb: 0.5 }}
                            >
                                {club.manager.name}
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box>
                                <br />
                                <Typography
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
                                >
                                    {/* <SportsSoccerIcon sx={{ fontSize: 18 }} /> */}
                                    {/* Progress Bar */}
                                    <LinearProgress
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

                                </Typography>
                            </Box>

                        </Box>
                        {/* </Box> */}

                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <SquadComponent squad={players} />
                    </Grid>
                </Grid>
                <br />
                <AddClubDialog open={open} onClose={() => setOpen(false)}
                    action='edit'
                    onSubmit={(newValue) =>
                        // console.log(newValue)
                        setClub(newValue)
                    }
                    value={club}
                />
            </Container>
            <NavBar value={(curClub.club as IClub)._id === id ? (curClub.club as IClub).isAdmin ? 5 : 4 : 3} />

        </>
    );
};

export default ClubView;

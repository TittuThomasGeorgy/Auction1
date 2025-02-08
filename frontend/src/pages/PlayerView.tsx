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
import SquadComponent from '../components/SquadComponent';
import { AccountCircle as UserIcon, Edit as EditIcon, Delete as DeleteIcon, AttachMoney as SellIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import AddPlayerDialog from '../components/AddPlayerDialog';
import PlayerCard from '../components/PlayerCard';
import { IClub } from '../types/ClubType';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { enqueueSnackbar } from 'notistack';
import { IBid } from '../types/BidType';
import BidComponent from '../components/BidComponent';
import SellPlayerDialog from '../components/SellPlayerDialog';
import { initSocket } from '../services/SocketClient';

const PlayerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const ClubServ = useClub();
    const PlayerServ = usePlayer();
    const settingsServ = useSettings();
    const [open, setOpen] = useState<'edit' | 'sell' | 'delete' | 'removeClub' | null>(null);
    const [player, setPlayer] = useState<IPlayer>(defPlayer)
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [settings, setSettings] = useState<ISettings>(defSettings);
    const [bids, setBids] = useState<IBid[]>([])
    const getData = async (_id: string) => {
        const res = await PlayerServ.getById(_id);
        setPlayer(res.data);
        const res1 = await settingsServ.get()
        setSettings(res1.data)

    }
    const getClubs = async () => {
        const res = await ClubServ.getAll();
        setClubs(res.data);
    }
    const getBids = async (_id: string) => {
        const res2 = await PlayerServ.getAllBids(player._id)
        setBids(res2.data)
    }
    useEffect(() => {
        getClubs();
        if (id)
            getData(id);
    }, [id])
    useEffect(() => {
        if (player.club) {
            getBids(player.club);
        }
    }, [player])

    useEffect(() => {
        const socket = initSocket();
        // Listen for the start of a new auction
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            const bid = res.data.bid;
            if (bid && bid._id == player._id) {
                setPlayers(_players => _players.map(player => player._id === bid.player ? { ...player, club: bid.club, bid: bid.bid.toString() } : player));
                enqueueSnackbar({ message: res.message, variant: 'info' })
                setShowSold({
                    open: true,
                    player: bid.player,
                    club: bid.club,
                });
            }
        })
        socket.on('playerCreated', (res: { data: { player: IPlayer }, message: string }) => {
            console.log(res.data);

            setPlayers(_players => ([..._players, res.data.player].sort((a: IPlayer, b: IPlayer) => {
                // First, sort by position
                const positionComparison = positionOrder[a.position] - positionOrder[b.position];

                // If positions are the same, sort by name alphabetically
                if (positionComparison === 0) {
                    return a.name.localeCompare(b.name); // Sort by name in ascending order
                }

                return positionComparison; // If positions differ, prioritize position sorting
            })));
            enqueueSnackbar({ message: res.message, variant: 'info' })
        })
        socket.on('playerUpdated', (res: { data: { player: IPlayer }, message: string }) => {
            console.log(res.data);
            setPlayers(_players => _players.map(_player => res.data.player._id === _player._id ? res.data.player : _player).sort((a: IPlayer, b: IPlayer) => {
                // First, sort by position
                const positionComparison = positionOrder[a.position] - positionOrder[b.position];

                // If positions are the same, sort by name alphabetically
                if (positionComparison === 0) {
                    return a.name.localeCompare(b.name); // Sort by name in ascending order
                }

                return positionComparison; // If positions differ, prioritize position sorting
            }));
            enqueueSnackbar({ message: res.message, variant: 'info' })

        })
        socket.on('playerClubRemoved', (res: { data: { _id: string }, message: string }) => {
            setPlayers(_players => _players.map(_player => res.data._id === _player._id ? ({ ..._player, club: '', bid: '' }) : _player));
            enqueueSnackbar({ message: res.message, variant: 'info' })

        })
        socket.on('playerDeleted', (res: { data: { _id: string }, message: string }) => {
            setPlayers(_players => _players.filter(_player => res.data._id !== _player._id).sort((a: IPlayer, b: IPlayer) => {
                // First, sort by position
                const positionComparison = positionOrder[a.position] - positionOrder[b.position];

                // If positions are the same, sort by name alphabetically
                if (positionComparison === 0) {
                    return a.name.localeCompare(b.name); // Sort by name in ascending order
                }

                return positionComparison; // If positions differ, prioritize position sorting
            }));
            enqueueSnackbar({ message: res.message, variant: 'info' })

        })
        return () => {
            socket.off('playerSold');
            socket.off('playerCreated');
            socket.off('playerUpdated');
            socket.off('playerDeleted');
            socket.off('playerClubRemoved');

        };
    }, []);
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
                            <PlayerCard player={player}
                                club={clubs.find(clb => clb._id === player.club) ?? null}
                            />
                            <Divider sx={{ my: 2 }} />
                            <Stack direction={'row'}>
                                {player.club ?
                                    <>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            sx={{ textTransform: 'none', float: 'right', mr: .5 }}
                                            startIcon={<VisibilityIcon />}

                                            onClick={() => {
                                                window.open(`/club/${player.club}`, '_blank')
                                                // navigate(`/club/${player.club}`)
                                            }}
                                        >
                                            View Club
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            sx={{ textTransform: 'none', float: 'right', mr: .5 }}
                                            startIcon={<SellIcon />}
                                            onClick={() => setOpen('removeClub')}
                                        >
                                            Remove Club
                                        </Button>
                                    </>

                                    :
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ textTransform: 'none', float: 'right', mr: .5 }}
                                        startIcon={<SellIcon />}
                                        onClick={() => setOpen('sell')}
                                    >
                                        Sell
                                    </Button>}
                            </Stack>
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
                        <BidComponent bids={bids} clubs={clubs} />
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
                open={open === 'delete' || open === 'removeClub'}
                onClose={() => setOpen(null)}
                onConfirm={async () => {
                    if (open === 'delete') {
                        const res = await PlayerServ.delete(player._id);
                        if (res.success) {
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                            setPlayer(defPlayer)
                            setBids([])
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Deleting Failed`
                            })
                        navigate('/players')
                    }
                    else if (open === 'removeClub') {
                        const res = await PlayerServ.removeClub(player._id);
                        if (res.success) {
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                            setPlayer(player => ({ ...player, club: '', bid: '' }));
                            setBids([])
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Removing Club Failed`
                            })
                    }
                }} title={open === 'removeClub' ? `Are sure  want to remove ${player.name} from ${clubs.find(club => player.club === club._id)?.name}?` : `Are sure  want to delete ${player.name}?`} />
            <SellPlayerDialog clubs={clubs} open={open === 'sell'}
                onClose={() => setOpen(null)}
                player={player._id}
                bidMultiple={settings.bidMultiple}
                basePrice={player.basePrice}
            />
        </>
    );
}

export default PlayerView
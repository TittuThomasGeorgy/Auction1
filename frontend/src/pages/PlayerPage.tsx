import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Divider, Grid2 as Grid, Typography, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Groups as GroupsIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddPlayerDialog from '../components/AddPlayerDialog';
import { defPlayer, defSettings } from '../services/DefaultValues';
import usePlayer from '../services/PlayerService';
import { IPlayer } from '../types/PlayerType';
import ClubCard from '../components/ClubCard';
import PlayerCard from '../components/PlayerCard';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import BackButton from '../components/BackButton';
import PlayerFilter from '../components/PlayerFilter';
import { initSocket } from '../services/SocketClient';
import { IBid } from '../types/BidType';
import { ISettings } from '../types/SettingsType';
import useSettings from '../services/SettingsService';
import { enqueueSnackbar } from 'notistack';
import PlayerSoldModal from '../components/PlayerSoldModal';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};
const PlayerPage = () => {
    const navigate = useNavigate();
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const settingsServ = useSettings();

    const [open, setOpen] = useState(false)
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [newPlayer, setNewPlayer] = useState<IPlayer>(defPlayer)
    const [clubs, setClubs] = useState<IClub[]>([])
    const [action, setAction] = useState<'add' | 'edit'>('add');
    const [searchKey, setSearchKey] = useState('');
    const [filter, setFilter] = useState<'all' | 'sold' | 'unsold'>('all');
    const [settings, setSettings] = useState<ISettings>(defSettings);
    const [showSold, setShowSold] = useState<{
        open: boolean,
        player: string,
        club: string,
    }>({
        open: false,
        player: '',
        club: '',
    })
    useEffect(() => {
        ClubServ.getAll()
            .then((res) => setClubs(res.data))
        settingsServ.get()
            .then((res) =>
                setSettings(res.data))
    }, []);
    useEffect(() => {
        PlayerServ.getAll({ searchKey, filter })
            .then((res) => setPlayers(res.data))
    }, [searchKey, filter]);
    useEffect(() => {
        const socket = initSocket();
        // Listen for the start of a new auction
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            const bid = res.data.bid;
            if (bid) {
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
            <BackButton onClick={() => navigate('/')} />


            <br />
            <br />
            <Container sx={{
                bgcolor: 'rgba(24, 24, 24, 0.75)'
            }}>
                <br />
                <TextField
                    variant="standard"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                            // endAdornment: <InputAdornment position="end">M</InputAdornment>,
                            inputProps: { min: 0 },
                        }
                    }}
                    sx={{ float: 'right', bgcolor: 'grey' }}
                />
                <Typography variant="h4" color="initial" >
                    <GroupsIcon sx={{ mr: 1 }} fontSize="large" />
                    PLAYERS</Typography>
                <Divider />
                <PlayerFilter filter={filter} onChange={(newFilter) => setFilter(newFilter)} />
                <br />
                <Box
                    sx={{
                        display: 'flex', // Flexbox layout
                        flexWrap: 'wrap', // Allow wrapping if cards exceed container width
                        gap: '16px', // Controls the space between cards
                        justifyContent: 'center', // Center-align cards,
                        maxHeight: '70vh', // Set the maximum height for the container
                        overflowY: 'auto', // Enable vertical scrolling
                        padding: '16px',   // Add some padding for aesthetics
                    }}>

                    {players.map(_player =>
                        <PlayerCard key={_player._id} player={_player}
                            club={clubs.find(clb => clb._id === _player.club) ?? null}
                            onClick={() => {
                                // setAction('edit');
                                // setPlayer(_player)
                                // setOpen(true)
                                navigate(`/players/view/${_player._id}`)
                            }} />
                    )}
                </Box>
                <br />
            </Container>
            <FloatingButton actions={[
                {
                    name: 'Add',
                    icon: <AddIcon />,
                    onChange: () => {
                        setOpen(true);
                        setNewPlayer(defPlayer)
                    },
                },
            ]} />
            <AddPlayerDialog open={open} onClose={() => setOpen(false)}
                action={action}
                onSubmit={(newValue) => { }
                    // action === 'edit' ?
                    //     setPlayers((prevPlayers) =>
                    //         prevPlayers.map(prev => prev._id === newValue._id ? newValue : prev)) :
                    //     setPlayers((prevPlayers) => [
                    //         ...prevPlayers,
                    //         newValue
                    //     ].sort((a: IPlayer, b: IPlayer) => {
                    //         // First, sort by position
                    //         const positionComparison = positionOrder[a.position] - positionOrder[b.position];

                    //         // If positions are the same, sort by name alphabetically
                    //         if (positionComparison === 0) {
                    //             return a.name.localeCompare(b.name); // Sort by name in ascending order
                    //         }

                    //         return positionComparison; // If positions differ, prioritize position sorting
                    //     }))
                }
                value={{ ...newPlayer, basePrice: settings.minBid }}
                bidMultiple={settings.bidMultiple} />
            {(() => {
                const _club = clubs.find((clb) => clb._id === showSold.club);
                const _player = players.find((player) => player._id === showSold.player);

                return (
                    _club &&
                    _player && (
                        <PlayerSoldModal
                            open={showSold.open}
                            onClose={() =>
                                setShowSold({
                                    open: false,
                                    player: '',
                                    club: '',
                                })
                            }
                            club={_club}  // Fixed from `_clubs` to `_club`
                            player={_player}
                        />
                    )
                );
            })()}
        </>
    );
};

export default PlayerPage;

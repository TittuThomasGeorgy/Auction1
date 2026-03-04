import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Divider, Grid2 as Grid, Typography, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Groups as GroupsIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddPlayerDialog from '../components/AddPlayerDialog';
import { defAuction, defPlayer, defSettings } from '../services/DefaultValues';
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
import { useAuth } from '../hooks/Authenticate';
import SpeedDialComponent from '../components/SpeedDialComponent';
import NavBar from '../components/NavBar';
import useAuction from '../services/AuctionService';
import { IAuction } from '../types/AuctionType';
import AuctionCard from '../components/AuctionCard';
import AddAuctionDialog from '../components/AddAuctionDialog';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};
const AuctionsViewPage = (props: { type: 'cricket' | 'football' }) => {
    const curClub = useAuth();

    const navigate = useNavigate();
    const AuctionServ = useAuction();
    const settingsServ = useSettings();

    const [open, setOpen] = useState(false)
    const [auctions, setAuctions] = useState<IAuction[]>([])
    const [newAuction, setNewAuction] = useState<IAuction>(defAuction)
    const [action, setAction] = useState<'add' | 'edit'>('add');
    const [searchKey, setSearchKey] = useState('');

    useEffect(() => {
        AuctionServ.getAll(props.type)
            .then((res) => setAuctions(res.data))
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
                {(curClub.club as IClub).isAdmin &&
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: 'none', float: 'right' }}
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setOpen(true);
                            setNewAuction(defAuction)
                        }}
                    >
                        ADD
                    </Button>}
                <Typography variant="h4" color="initial" >
                    <GroupsIcon sx={{ mr: 1 }} fontSize="large" />
                    Auctions</Typography>
                <Divider />
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
                <br />
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

                    {auctions.map(_auction =>
                        <AuctionCard key={_auction._id} auction={_auction}
                            onClick={() => {
                                // setAction('edit');
                                // setPlayer(_player)
                                // setOpen(true)
                                navigate(`/auction/`)
                            }} />
                    )}
                </Box>
                <br />
            </Container>
            {/* <FloatingButton actions={[
                {
                    name: 'Add',
                    icon: <AddIcon />,
                    onChange: () => {
                        setOpen(true);
                        setNewPlayer(defPlayer)
                    },
                },
            ]} /> */}
            <AddAuctionDialog open={open} onClose={() => setOpen(false)}
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
                value={{ ...newAuction }}
            />
            {/* <NavBar value={2} /> */}


        </>
    );
};

export default AuctionsViewPage;

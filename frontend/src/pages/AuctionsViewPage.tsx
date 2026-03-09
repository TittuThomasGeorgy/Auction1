import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Divider, Grid2 as Grid, Typography, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon, Groups as GroupsIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddPlayerDialog from '../components/AddPlayerDialog';
import { defAuction, defClub, defPlayer, defSettings } from '../services/DefaultValues';
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
import AuctionFilter from '../components/AuctionFilter';


const AuctionsViewPage = (props: { type: 'cricket' | 'football' }) => {
    const curClub = useAuth();

    const navigate = useNavigate();
    const AuctionServ = useAuction();

    const [open, setOpen] = useState(false)
    const [auctions, setAuctions] = useState<IAuction[]>([])
    const [newAuction, setNewAuction] = useState<IAuction>(defAuction);
    const [creatableClub, setCreatableClub] = useState<IClub>(defClub);

    const [action, setAction] = useState<'add' | 'edit'>('add');
    const [searchKey, setSearchKey] = useState('');
    const [filter, setFilter] = useState<'all' | 'football' | 'cricket'>('all');

    useEffect(() => {
        if (props.type)
            AuctionServ.getAll({ searchKey, filter })
                .then((res) => setAuctions(res.data))
    }, [searchKey, filter]);

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
                <AuctionFilter filter={filter} onChange={(newFilter) => setFilter(newFilter)} />
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
                onSubmit={(newValue) => {
                    action === 'edit' && (newValue.auction.type == filter || filter == 'all') ?
                        setAuctions((prev) =>
                            prev.map(prev => prev._id === newValue.auction._id ? newValue.auction : prev)) :
                        setAuctions((prev) => [
                            ...prev,
                            newValue.auction
                        ].sort((a: IAuction, b: IAuction) => {
                            // First, sort by position

                            // If positions are the same, sort by name alphabetically
                            return a.name.localeCompare(b.name); // Sort by name in ascending order

                        }))
                }}
                value={{ auction: newAuction, club: creatableClub }}
            />
            {/* <NavBar value={2} /> */}


        </>
    );
};

export default AuctionsViewPage;

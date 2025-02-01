import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography, Tooltip } from '@mui/material';
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon, MoreVert as OptionIcon } from '@mui/icons-material';
import BackButton from '../components/BackButton';
import usePlayer from '../services/PlayerService';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import { IPlayer } from '../types/PlayerType';
import PlayerCard from '../components/PlayerCard';
import AuctionClubCard from '../components/AuctionClubCard';
import AuctionControls from '../components/AuctionControls';
import BidDialog from '../components/BidDialog';
import useAuction from '../services/AuctionService';
import { enqueueSnackbar } from 'notistack';
import { useLiveAuction } from '../hooks/AuctionProvider';
import ConfirmationDialog from '../components/ConfirmationDialog';
import MenuButton from '../components/MenuButton';
import { io } from 'socket.io-client';
import { IBid } from '../types/BidType';
import { initSocket } from '../services/SocketClient';
import PlayerSoldModal from '../components/PlayerSoldModal';
import useSettings from '../services/SettingsService';
import { ISettings } from '../types/SettingsType';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};

const AuctionPage = () => {
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const AuctionServ = useAuction();
    const settingsServ = useSettings();

    const liveAuction = useLiveAuction();
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [placeBidClub, setPlaceBidClub] = useState<IClub | null>(null);
    const [confirmation, setConfirmation] = useState<{
        open: boolean;
        action: "next" | "previous" | null;
    }>({ open: false, action: null });
    const [sortBy, setSortBy] = useState<'Sort by Position' | 'Sort by Status'>('Sort by Position');
    const [showSold, setShowSold] = useState(false)
    const [settings, setSettings] = useState<ISettings>({
        _id: '',
        bidTime: 0,
        addOnTime: 0,
        initialBalance: 0,
        playersPerClub: 0,
        bidMultiple: 0,
        keepMinBid: true,
        minBid: 0
    });

    useEffect(() => {
        ClubServ.getAll().then((res) => setClubs(res.data));
        PlayerServ.getAll().then((res) =>
            setPlayers(res.data)
        );
        settingsServ.get()
            .then((res) => setSettings(res.data))
            .catch((err) => console.error(err));
    }, []);


    const handleNextPlayer = async (type: 'next' | 'previous') => {
        if (liveAuction.auction?.bid && !players[currentPlayerIndex]?.club)
            setConfirmation({ open: true, action: type })
        else if (type === 'next')
            nextPlayer();
        else if (type === 'previous')
            previousPlayer();
    };
    const nextPlayer = async () => {
        setCurrentPlayerIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % players.length;
            liveAuction.auction && AuctionServ.switchPlayer(players[newIndex]._id);
            return newIndex;
        });
    }
    const previousPlayer = async () => {
        setCurrentPlayerIndex((prevIndex) => {
            const index = (prevIndex - 1) % players.length;
            const newIndex = index < 0 ? players.length - 1 : index
            liveAuction.auction && AuctionServ.switchPlayer(players[newIndex]._id);
            return newIndex;
        });
    };


    // Add keyboard navigation
    useEffect(() => {
        const handleKeyDown = async (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                await handleNextPlayer('next');
            } else if (event.key === 'ArrowLeft') {
                await handleNextPlayer('previous');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleNextPlayer]); // Add players as a dependency to ensure the effect updates correctly

    useEffect(() => {
        if (liveAuction.auction) {
            // liveAuction.auction.bid && liveAuction.auction.bid.player === players[currentPlayerIndex]?._id && setCurrentBid();
            const _player = liveAuction.auction.player;
            if (_player) {
                const currPlayerIdx = players.findIndex(player => player && player._id === _player);
                setCurrentPlayerIndex(currPlayerIdx >= 0 ? currPlayerIdx : 0)
            }
        }
    }, [liveAuction.auction, players])

    useEffect(() => {
        if (!(players.length > 0)) return
        let currentPlayer = liveAuction.auction?.player;
        let _players = players;
        if (sortBy === 'Sort by Position') {
            _players = _players
                .sort((a, b) => positionOrder[a.position] - positionOrder[b.position] || a.name.localeCompare(b.name));
        } else {
            _players = _players
                .sort((a, b) => {
                    const clubComparison = (b.club ? 1 : 0) - (a.club ? 1 : 0);
                    return clubComparison || a.name.localeCompare(b.name);
                })
        }
        const currPlayerIdx = _players.findIndex(player => player && player._id === currentPlayer);
        setCurrentPlayerIndex(currPlayerIdx > 0 ? currPlayerIdx : 0)
        setPlayers(_players)
    }, [sortBy, players]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showSold) {
                setShowSold(false);
            }
        }, 10000);

        return () => clearTimeout(timer); // ✅ Cleanup timeout properly
    }, [showSold]); // ✅ Dependency remains the same


    useEffect(() => {
        const socket = initSocket();
        if (liveAuction.auction) {
            const _player = liveAuction.auction.player;
            if (_player) {
                const currPlayerIdx = players.findIndex(player => player && player._id === _player);
                setCurrentPlayerIndex(currPlayerIdx >= 0 ? currPlayerIdx : 0)
            }
        }
        // Listen for the start of a new auction
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            const bid = res.data.bid;
            console.log(res.data);

            if (bid) {
                setPlayers(_players => _players.map(player => player._id === bid.player ? { ...player, club: bid.club, bid: bid.bid.toString() } : player));
                setClubs(clubs => clubs.map(club => club._id == bid.club ? { ...club, balance: club.balance - bid.bid } : club))
                enqueueSnackbar({ variant: 'success', message: res.message });
                setShowSold(true);
                setPlaceBidClub(null);

            }

        })
        return () => {
            socket.off('playerSold');
        };
    }, []);


    return (
        <>
            <BackButton />
            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)', padding: '20px' }}>

                <MenuButton menuItems={[
                    { label: 'Sort by Position', onClick: () => setSortBy('Sort by Position') },
                    { label: 'Sort by Status', onClick: () => setSortBy('Sort by Status') },
                ]} sx={{ float: 'right' }} selected={sortBy} />
                {/* <br /> */}
                <Typography textAlign={'right'}
                    sx={{
                        fontSize: '14px',
                        // fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'end',
                        gap: '2px',
                    }}
                >

                    {currentPlayerIndex + 1} / {players.length}

                </Typography>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    height="50%"
                    flexWrap="wrap" /* Enables wrapping for smaller screens */
                    gap={0} /* Adjusts spacing between sections */
                // sx={{mt:.5}}
                >
                    {/* Current Bid Section */}
                    <Box
                        display={{ xs: "none", md: "flex" }}
                        flexDirection="column"
                        alignItems="center"
                        flex={{ xs: '1 1 100%', md: '1 1 25%' }} /* Full width on small, fixed on large */
                    >
                        {liveAuction.auction?.bid && (() => {
                            const club = clubs.find(club => liveAuction.auction?.bid?.club === club._id);
                            return (
                                <>
                                    <Typography variant="h6" color="success" fontWeight="bold">
                                        CURRENT BID
                                    </Typography>
                                    <Typography variant="h4" color="error" fontWeight="bold">
                                        ${liveAuction.auction.bid?.bid}M
                                    </Typography>
                                    {club && (
                                        <Box
                                            component="img"
                                            src={club.logo}
                                            alt={`${club.name} logo`}
                                            sx={{
                                                // width: 80,
                                                height: 80,
                                                // objectFit: 'contain',
                                                // position: 'absolute',
                                                // top: 20,
                                                zIndex: 2,
                                            }}
                                        />
                                    )}
                                </>
                            );
                        })()}
                    </Box>


                    {/* Player Navigation Section */}
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={{ xs: '100%', md: '50%' }} /* Full width for small screens */
                        position="relative"
                        overflow="hidden"
                        flex="1 1 auto" /* Flexibly adjusts based on screen size */
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {/* Previous Player Button */}
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining >= 0))) && (
                            <IconButton
                                onClick={() => handleNextPlayer('previous')}
                                disabled={players.length === 0}
                                color="primary"
                                size="large"
                                style={{ position: 'absolute', left: 0, zIndex: 10 }}
                            >
                                <ArrowLeftIcon />
                            </IconButton>
                        )}

                        {/* Player Cards */}
                        <Box
                            display="flex"
                            gap={0}
                            width="100%"
                            style={{
                                transform: `translateX(-${currentPlayerIndex * 100}%)`,
                                transition: 'transform 0.5s ease-in-out',
                            }}
                        >

                            {players.map((player) => (
                                <Box
                                    key={player._id}
                                    flex="0 0 100%"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >

                                    <PlayerCard
                                        player={player}
                                        club={clubs.find((clb) => clb._id === player.club) ?? null}
                                    />
                                </Box>
                            ))}
                        </Box>

                        {/* Next Player Button */}
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining >= 0))) && (
                            <IconButton
                                onClick={() => handleNextPlayer('next')}
                                disabled={players.length === 0}
                                color="primary"
                                size="large"
                                style={{ position: 'absolute', right: 0, zIndex: 10 }}
                            >
                                <ArrowRightIcon />
                            </IconButton>)}
                    </Box>

                    {/* Time Left Section */}
                    <Box
                        display={{ xs: "none", md: "flex" }}
                        flexDirection="column"
                        alignItems="center"
                        flex={{ xs: '1 1 100%', md: '1 1 25%' }} /* Full width on small, fixed on large */
                    >
                        {(liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && (liveAuction.auction?.timeRemaining >= 0) ? (
                            <>
                                <Typography variant="h6" color="secondary" fontWeight="bold">
                                    TIME LEFT
                                </Typography>
                                <Typography
                                    variant="h2"
                                    color="primary"
                                    fontWeight="bold"
                                    sx={{
                                        animation: 'tick 1s infinite',
                                        '@keyframes tick': {
                                            '0%': { transform: 'scale(1)', color: '#FF4500' },  // Orange Red
                                            '50%': { transform: 'scale(1.07)', color: '#FFD700' },  // Gold Flash
                                            '100%': { transform: 'scale(1)', color: '#FF4500' },
                                        },
                                    }}
                                >
                                    {liveAuction.auction?.timeRemaining}
                                </Typography>
                            </>
                        ) : null}
                    </Box>

                    <Box
                        display={{ xs: "flex", md: "none" }}
                        flexDirection="column"
                        alignItems="center"
                        flex={{ xs: '1 1 100%', md: '1 1 25%' }} /* Full width on small, fixed on large */
                    >
                        {liveAuction.auction?.bid && (() => {
                            const club = clubs.find(club => liveAuction.auction?.bid?.club === club._id);
                            return (
                                <>
                                    <Typography variant="h6" color="success" fontWeight="bold">
                                        CURRENT BID
                                    </Typography>
                                    <Stack direction={'row'}>

                                        <Typography variant="h4" color="error" fontWeight={900}>
                                            ${liveAuction.auction.bid?.bid}M
                                        </Typography>
                                        {club && (
                                            <Box
                                                component="img"
                                                src={club.logo}
                                                alt={`${club.name} logo`}
                                                sx={{
                                                    // width: 80,
                                                    height: 40,
                                                    // objectFit: 'contain',
                                                    // position: 'absolute',
                                                    // top: 20,
                                                    zIndex: 2,
                                                    ml: .5
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </>

                            )
                        })()}

                        {(liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && (liveAuction.auction?.timeRemaining >= 0) ? (<>
                            <Stack direction={'row'}>
                                <Typography variant="h6" color="secondary" fontWeight="bold">
                                    TIME LEFT:
                                </Typography>&nbsp;
                                <Typography variant="h5" color="primary" fontWeight="bold"
                                    sx={{
                                        animation: 'tick 1s infinite',
                                        '@keyframes tick': {
                                            '0%': { transform: 'scale(1)', color: '#FF4500' },  // Orange Red
                                            '50%': { transform: 'scale(1.07)', color: '#FFD700' },  // Gold Flash
                                            '100%': { transform: 'scale(1)', color: '#FF4500' },
                                        },
                                    }}>
                                    {liveAuction.auction?.timeRemaining}
                                </Typography></Stack>
                        </>) : null}


                    </Box>

                </Box>




                <AuctionControls
                    onPlay={async () => {
                        await AuctionServ.playPause('resume'); // A default synchronous return if needed
                    }} onPause={async () => {
                        await AuctionServ.playPause('pause'); // A default synchronous return if needed
                    }} onAddTime={async () => {
                        await AuctionServ.addTime(); // A default synchronous return if needed
                    }} onSell={async () => {
                        await AuctionServ.sell(players[currentPlayerIndex]?._id); // A default synchronous return if needed
                    }} onUndo={async () => {
                        await AuctionServ.undoBid(); // A default synchronous return if needed
                    }} onStart={async () => {
                        await AuctionServ.start(players[currentPlayerIndex]?._id); // A default synchronous return if needed
                    }} onStop={async () => {
                        await AuctionServ.stop(); // A default synchronous return if needed

                    }}
                />
                <br />
                <Box
                    sx={{
                        display: 'grid',
                        gap: '16px',
                        justifyContent: 'center',
                        gridTemplateColumns: {
                            xs: 'repeat(2, minmax(140px, 1fr))', // Two per row on extra-small screens
                            sm: 'repeat(2, minmax(160px, 1fr))', // Two per row on small screens
                            md: 'repeat(3, minmax(180px, 1fr))', // Three per row on medium screens
                            lg: 'repeat(4, minmax(200px, 1fr))', // Four per row on large screens
                        },
                        width: '100%', // Ensure it takes full width
                        maxWidth: '1000px', // Optional: Set max width to limit stretching
                        margin: '0 auto', // Centers the grid within its container
                    }}
                >
                    {clubs.map(club => {
                        const _playerCount = players.filter(player => player.club === club._id).length;
                        return (

                            <AuctionClubCard
                                club={club}
                                key={club._id}
                                disabled={liveAuction.auction?.status !== 'live' || _playerCount === settings.playersPerClub}
                                onClick={() => setPlaceBidClub(club)}
                                playerCount={_playerCount}
                                maxPlayers={settings.playersPerClub}
                            />
                        )
                    })}
                </Box>

                {liveAuction.auction && placeBidClub &&
                    <BidDialog open={Boolean(placeBidClub)} onClose={() => setPlaceBidClub(null)}
                        currentBid={liveAuction.auction?.bid?.bid ?? 100} onSubmit={async (bid) => {
                            const res = await AuctionServ.placeBid(placeBidClub._id, players[currentPlayerIndex]?._id, bid);
                            if (res.success) {
                                // setCurrentBid(res.data.bid);
                                setPlaceBidClub(null)
                            }
                            enqueueSnackbar({
                                variant: res.success ? 'success' : 'error',
                                message: res.message
                            })
                        }}
                        club={placeBidClub}
                        timeRemaining={liveAuction.auction.timeRemaining ?? 0}
                    />}

                <Dialog open={confirmation.open} onClose={() => setConfirmation({ open: false, action: null })}>
                    <DialogTitle>
                        {`Are you sure want to move to ${confirmation.action} Player as bid exists.`}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setConfirmation({ open: false, action: null })} variant='outlined'>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            const action = confirmation.action;
                            if (action == 'next')
                                nextPlayer()
                            else
                                previousPlayer()
                            setConfirmation({ open: false, action: null });
                        }} variant='contained' color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
                {
                    players[currentPlayerIndex]?.club &&
                    <PlayerSoldModal
                        open={showSold}
                        onClose={() => setShowSold(false)}
                        club={clubs.find((clb) => clb._id === players[currentPlayerIndex].club) as IClub}
                        player={players[currentPlayerIndex]}
                    />
                }
            </Container >
        </>
    );
};

export default AuctionPage;

import React, { useCallback, useEffect, useState } from 'react';
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
import { defSettings } from '../services/DefaultValues';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Authenticate';
import SpeedDialComponent from '../components/SpeedDialComponent';
import NavBar from '../components/NavBar';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};

const AuctionPage = () => {
    const curClub = useAuth();

    const navigate = useNavigate();

    const liveAuction = useLiveAuction();
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const AuctionServ = useAuction();
    const settingsServ = useSettings();

    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [placeBidClub, setPlaceBidClub] = useState<IClub | null>(null);
    const [confirmation, setConfirmation] = useState<{
        open: boolean;
        action: "next" | "previous" | null;
    }>({ open: false, action: null });
    const [sortBy, setSortBy] = useState<'Sort by Position' | 'Sort by Status'>('Sort by Position');
    const [showSold, setShowSold] = useState<{
        open: boolean,
        player: string,
        club: string,
    }>({
        open: false,
        player: '',
        club: '',
    })
    const [settings, setSettings] = useState<ISettings>(defSettings);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const res = await ClubServ.getAll();
                const allClubs = res.data;

                if (curClub && curClub.club && curClub.club._id) {
                    // Find the club that matches the current user's club ID
                    const mainClub = allClubs.find(club => club._id === (curClub.club as IClub)?._id);

                    if (mainClub) {
                        // Filter out the main club to get the rest of the clubs
                        const otherClubs = allClubs.filter(club => club._id !== (curClub.club as IClub)?._id);

                        // Prepend the main club to the list of other clubs
                        setClubs([mainClub, ...otherClubs]);
                    } else {
                        // If the main club is not found, just set the original list
                        setClubs(allClubs);
                    }
                } else {
                    // If no current club is available, just set the original list
                    setClubs(allClubs);
                }

            } catch (error) {
                console.error("Failed to fetch clubs:", error);
            }
        };

        fetchClubs();
        PlayerServ.getAll({}).then((res) =>
            setPlayers(res.data)
        );
        settingsServ.get()
            .then((res) => setSettings(res.data))
            .catch((err) => console.error(err));
    }, []);

    const [isSwitching, setIsSwitching] = useState(false);

    const handleNextPlayer = useCallback(async (type: 'next' | 'previous') => {
        if (isSwitching) return;

        setIsSwitching(true);
        setTimeout(() => setIsSwitching(false), 300);

        if (liveAuction.auction?.bid && !players[currentPlayerIndex]?.club)
            setConfirmation({ open: true, action: type });
        else if (type === 'next')
            nextPlayer();
        else if (type === 'previous')
            previousPlayer();
    }, [isSwitching, currentPlayerIndex, players, liveAuction.auction]);

    const nextPlayer = useCallback(async () => {
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);

        if (liveAuction.auction) {
            await AuctionServ.switchPlayer(players[(currentPlayerIndex + 1) % players.length]._id);
        }
    }, [currentPlayerIndex, players, liveAuction.auction]);

    const previousPlayer = useCallback(async () => {
        setCurrentPlayerIndex((prevIndex) => (prevIndex - 1 + players.length) % players.length);

        if (liveAuction.auction) {
            await AuctionServ.switchPlayer(players[(currentPlayerIndex - 1 + players.length) % players.length]._id);
        }
    }, [currentPlayerIndex, players, liveAuction.auction]);

    const nextUnsoldPlayer = () => {
        const remainingPlayers1 = players.slice(currentPlayerIndex)
        const remainingPlayers2 = players.slice(0, currentPlayerIndex)
        const unsoldPlayer = [...remainingPlayers1, ...remainingPlayers2].find(player => !player.club )
        if (unsoldPlayer) {
            return unsoldPlayer._id
        }

        enqueueSnackbar({ variant: 'error', message: "No Unsold Players remaining" })
        return null
    }
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
                    if (a.club && !b.club) return -1;
                    return 1;
                });
        }
        const currPlayerIdx = _players.findIndex(player => player && player._id === currentPlayer);
        setCurrentPlayerIndex(currPlayerIdx > 0 ? currPlayerIdx : 0)
        setPlayers(_players)
    }, [sortBy, players]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showSold) {
                setShowSold({
                    open: false,
                    player: '',
                    club: '',
                });
            }
        }, 6000);

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
            // console.log(res.data);

            if (bid) {
                setPlayers(_players => _players.map(player => player._id === bid.player ? { ...player, club: bid.club, bid: bid.bid.toString() } : player));
                setClubs(clubs => clubs.map(club => club._id === bid.club ? { ...club, balance: club.balance - bid.bid } : club))
                enqueueSnackbar({ variant: 'success', message: res.message });
                setShowSold({
                    open: true,
                    player: bid.player,
                    club: bid.club,
                });
                setPlaceBidClub(null);
            }
        })
        socket.on('playerCreated', (res: { data: { player: IPlayer }, message: string }) => {
            // console.log(res.data);

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
        socket.on('bidPlaced', (res: { data: IBid | null; message: string }) => {

            setPlayers((prevPlayers) => {
                const updatedPlayer = prevPlayers.find(
                    (player) => String(player._id) === String(res.data?.player)
                );


                if (!updatedPlayer || !updatedPlayer.club) return prevPlayers; // No changes needed

                return prevPlayers.map((player) =>
                    player._id === res.data?.player
                        ? { ...updatedPlayer, club: '', bid: '', _id: updatedPlayer._id }
                        : player
                );
            });

            setClubs((prevClubs) =>
                prevClubs.map((club) =>
                    club._id === res.data?.club
                        ? { ...club, balance: club.balance + Number(res.data?.bid || 0) }
                        : club
                )
            );

            // enqueueSnackbar({ message: res.message, variant: 'info' });
        });


        socket.on('playerUpdated', (res: { data: { player: IPlayer }, message: string }) => {
            setPlayers(_players => _players.map(_player => res.data.player._id === _player._id ? res.data.player : _player));
            enqueueSnackbar({ message: res.message, variant: 'info' })
        }
        )
        socket.on('playerClubRemoved', (res: { data: { _id: string }, message: string }) => {
            const updatedPlayer = players.find(player => player._id === res.data._id);
            if (updatedPlayer) {
                setPlayers(_players => _players.map(player => player._id === updatedPlayer._id ? { ...updatedPlayer, club: '', bid: '' } : player));
                setClubs(clubs => clubs.map(club => club._id === updatedPlayer.club ? { ...club, balance: club.balance + Number(updatedPlayer.bid) } : club))
            }
            enqueueSnackbar({ message: res.message, variant: 'info' })
        })
        socket.on('playerDeleted', (res: { data: { _id: string }, message: string }) => {
            const deletedPlayer = players.find(player => player._id === res.data._id);
            if (deletedPlayer) {
                setPlayers(_players => _players.filter(player => player._id !== deletedPlayer._id));
                setClubs(clubs => clubs.map(club => club._id === deletedPlayer.club ? { ...club, balance: club.balance + Number(deletedPlayer.bid) } : club))
            }
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
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)', padding: '20px' }}>
                <Box sx={{ float: 'right' }}>
                    <Typography
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
                    <MenuButton menuItems={[
                        { label: 'Sort by Position', onClick: () => setSortBy('Sort by Position') },
                        { label: 'Sort by Status', onClick: () => setSortBy('Sort by Status') },
                    ]} selected={sortBy} />
                    {/* <br /> */}

                </Box>
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
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining >= 0) && (curClub.club as IClub).isAdmin)) && (
                            <IconButton
                                onClick={() => handleNextPlayer('previous')}
                                disabled={players.length === 0 || isSwitching}
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

                            {players.map((player) => {
                                const _club = clubs.find((clb) => clb._id === player.club);
                                return (
                                    <Box
                                        key={player._id}
                                        flex="0 0 100%"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >

                                        <PlayerCard
                                            player={player}
                                            club={_club ?? null}
                                            onClick={_club ? () => {
                                                setShowSold({
                                                    open: true,
                                                    player: player._id,
                                                    club: _club._id,
                                                });
                                            } : undefined}
                                        />
                                    </Box>
                                )
                            })}
                        </Box>

                        {/* Next Player Button */}
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining >= 0) && (curClub.club as IClub).isAdmin)) && (
                            <IconButton
                                onClick={() => handleNextPlayer('next') || isSwitching}
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




                {(curClub.club as IClub).isAdmin &&
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
                            const unsoldPlayer = nextUnsoldPlayer();
                            if (unsoldPlayer)
                                await AuctionServ.start(unsoldPlayer); // A default synchronous return if needed
                        }} onStop={async () => {
                            await AuctionServ.stop(); // A default synchronous return if needed

                        }}
                    />}
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
                        const _maxBid = club.balance - ((settings.playersPerClub - _playerCount - 1) * settings.minBid)
                        const maxBid = settings.keepMinBid ? _maxBid : club.balance;

                        return (

                            <AuctionClubCard
                                club={club}
                                key={club._id}
                                disabled={liveAuction.auction?.status !== 'live' || _playerCount === settings.playersPerClub || (typeof liveAuction.auction?.bid?.bid === 'number' && maxBid <= liveAuction.auction?.bid?.bid) || Boolean(players[currentPlayerIndex].club) || (!((curClub.club as IClub).isAdmin) && club._id != (curClub.club as IClub)._id)}
                                onClick={() => setPlaceBidClub(club)}
                                playerCount={_playerCount}
                                maxPlayers={settings.playersPerClub}
                            />
                        )
                    })}
                </Box>

                {liveAuction.auction && placeBidClub && (
                    (() => {
                        const noOfPlayer = players.filter(player => player.club === placeBidClub._id).length;
                        const _maxBid = placeBidClub.balance - ((settings.playersPerClub - noOfPlayer - 1) * settings.minBid)
                        const maxBid = settings.keepMinBid ? _maxBid : placeBidClub.balance;
                        return (
                            <BidDialog
                                open={Boolean(placeBidClub)}
                                onClose={() => setPlaceBidClub(null)}
                                currentBid={liveAuction.auction?.bid?.bid ?? 0}
                                onSubmit={async (bid) => {
                                    const res = await AuctionServ.placeBid(
                                        placeBidClub._id,
                                        players[currentPlayerIndex]?._id,
                                        bid
                                    );

                                    enqueueSnackbar({
                                        variant: res.success ? 'success' : 'error',
                                        message: res.message,
                                    });

                                    if (res.success) {
                                        setPlaceBidClub(null);
                                    }
                                }}
                                club={placeBidClub}
                                timeRemaining={liveAuction.auction.timeRemaining ?? 0}
                                bidMultiple={settings.bidMultiple}
                                maxBid={maxBid}
                                minBid={settings.minBid}
                                basePrice={players[currentPlayerIndex].basePrice}
                            />
                        );
                    })()
                )}


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
                            if (action === 'next')
                                nextPlayer()
                            else
                                previousPlayer()
                            setConfirmation({ open: false, action: null });
                        }} variant='contained' color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
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
            </Container >
            <NavBar value={1} />
        </>
    );
};

export default AuctionPage;

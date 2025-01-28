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
    const liveAuction = useLiveAuction();
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [placeBidClub, setPlaceBidClub] = useState<IClub | null>(null);
    const [confirmation, setConfirmation] = useState<{
        open: boolean;
        action: "next" | "previous" | null;
    }>({ open: false, action: null });
    const [soldBid, setSoldBid] = useState<IBid | null>(null)
    const [sortBy, setSortBy] = useState<'Sort by Position' | 'Sort by Status'>('Sort by Position')
    useEffect(() => {
        ClubServ.getAll().then((res) => setClubs(res.data));
        PlayerServ.getAll().then((res) =>
            setPlayers(res.data)
        );
    }, []);

    const nextPlayer = async () => {
        const currentIdx = (currentPlayerIndex + 1) % players.length
        setCurrentPlayerIndex(currentIdx);
        liveAuction.auction && await AuctionServ.switchPlayer(players[currentIdx]._id)
    }
    const handleNextPlayer = async (type: 'next' | 'previous') => {
        if (liveAuction.auction?.bid && !players[currentPlayerIndex]?.club)
            setConfirmation({ open: true, action: type })
        else if (type == 'next')
            nextPlayer();
        else if (type == 'previous')
            previousPlayer();
    };

    const previousPlayer = async () => {
        const currentIdx = (currentPlayerIndex - 1) % players.length;
        setCurrentPlayerIndex(currentIdx < 0 ? players.length - 1 : currentIdx);
        liveAuction.auction && await AuctionServ.switchPlayer(players[currentIdx < 0 ? players.length - 1 : currentIdx]._id)
    };


    // Add keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                handleNextPlayer('next');
            } else if (event.key === 'ArrowLeft') {
                handleNextPlayer('previous');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [players]); // Add players as a dependency to ensure the effect updates correctly

    useEffect(() => {
        if (liveAuction.auction) {
            // liveAuction.auction.bid && liveAuction.auction.bid.player === players[currentPlayerIndex]?._id && setCurrentBid();
            const _player = liveAuction.auction.player;
            if (_player) {
                const currPlayerIdx = players.findIndex(player => player && player._id === _player);
                setCurrentPlayerIndex(currPlayerIdx > 0 ? currPlayerIdx : 0)
            }
        }
    }, [liveAuction.auction])

    useEffect(() => {
        if (!(players.length > 0)) return
        let currentPlayer = players[currentPlayerIndex]?._id;
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
        const socket = initSocket();

        // Listen for the start of a new auction
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            const bid = res.data.bid;
            console.log(res.data);

            if (bid) {

                setPlayers(_players => _players.map(player => player._id === bid.player ? { ...player, club: bid.club, bid: bid.bid.toString() } : player));
                setClubs(clubs => clubs.map(club => club._id == bid.club ? { ...club, balance: club.balance - bid.bid } : club))
                enqueueSnackbar({ variant: 'success', message: res.message });
                // setSoldBid(bid);
            }

        })
        return () => {
            socket.off('playerSold');
        };
    }, []);
    useEffect(() => {
        console.log(players);
    }, [players])


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
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining > 0))) && (
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
                        {(!liveAuction.auction || ((liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && !(liveAuction.auction?.timeRemaining > 0))) && (
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
                        {(liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining === 0) && (liveAuction.auction?.timeRemaining >= 0) ? (<>
                            <Typography variant="h6" color="secondary" fontWeight="bold">
                                TIME LEFT
                            </Typography>
                            <Typography variant="h2" color="primary" fontWeight="bold">
                                {liveAuction.auction?.timeRemaining}
                            </Typography>
                        </>) : null}
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
                                <Typography variant="h5" color="primary" fontWeight="bold">
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
                    }} onAddTime={function (): void {
                        throw new Error('Function not implemented.');
                    }} onSell={async () => {
                        // throw new Error('Function not implemented.');
                        await AuctionServ.sell(players[currentPlayerIndex]?._id); // A default synchronous return if needed
                    }} onUndo={function (): void {
                        throw new Error('Function not implemented.');
                    }} onStart={async () => {
                        await AuctionServ.start(players[currentPlayerIndex]?._id); // A default synchronous return if needed
                    }} onStop={async () => {
                        await AuctionServ.stop(); // A default synchronous return if needed

                    }}
                />
                <br />
                <Box
                    sx={{
                        display: 'flex', // Flexbox layout
                        flexWrap: 'wrap', // Allow wrapping if cards exceed container width
                        gap: '16px', // Controls the space between cards
                        justifyContent: 'center', // Center-align cards
                    }}
                >
                    {clubs.map(club =>
                        <AuctionClubCard club={club} key={club._id} disabled={liveAuction.auction?.status != 'live'} onClick={() => setPlaceBidClub(club)} />
                    )}
                    {liveAuction.auction && placeBidClub && <BidDialog open={Boolean(placeBidClub)} onClose={() => setPlaceBidClub(null)}
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
                        club={placeBidClub} />}

                </Box>
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
                </Dialog>{
                    // soldBid && players.find(player => soldBid?.player === player._id)
                    // && clubs.find(club => soldBid?.club === club._id) && <PlayerSoldModal open={Boolean(soldBid)}
                    //     onClose={() => setSoldBid(null)}
                    //     player={players.find(player => soldBid?.player === player._id) as IPlayer}
                    //     club={clubs.find(club => soldBid?.club === club._id) as IClub}
                    // />
                }
            </Container >
        </>
    );
};

export default AuctionPage;

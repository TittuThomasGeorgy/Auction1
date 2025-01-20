import React, { useEffect, useState } from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon, Margin } from '@mui/icons-material';
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

// const positionOrder: { [key: string]: number } = {
//     ST: 1,
//     CM: 2,
//     DF: 3,
//     GK: 4
// };

const AuctionPage = () => {
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const AuctionServ = useAuction();
    const liveAuction = useLiveAuction();
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [placeBidClub, setPlaceBidClub] = useState<IClub | null>(null);
    const [currentBid, setCurrentBid] = useState(100);
    const [timeRemaining, setTimeRemaining] = useState(0);
    useEffect(() => {
        ClubServ.getAll().then((res) => setClubs(res.data));
        PlayerServ.getAll().then((res) =>
            setPlayers(res.data)
        );
    }, []);

    const handleNextPlayer = async () => {
        const currentIdx = (currentPlayerIndex + 1) % players.length
        setCurrentPlayerIndex(currentIdx);
        liveAuction.auction && await AuctionServ.switchPlayer(players[currentIdx]._id)
    };

    const handlePreviousPlayer = async () => {
        const currentIdx = (currentPlayerIndex - 1) % players.length
        setCurrentPlayerIndex(currentIdx);
        liveAuction.auction && await AuctionServ.switchPlayer(players[currentIdx]._id)
    };


    // Add keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                handleNextPlayer();
            } else if (event.key === 'ArrowLeft') {
                handlePreviousPlayer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [players]); // Add players as a dependency to ensure the effect updates correctly

    useEffect(() => {
        if (liveAuction.auction && liveAuction.auction.status === 'live') {
            (liveAuction.auction?.timeRemaining || liveAuction.auction?.timeRemaining == 0) && setTimeRemaining(liveAuction.auction?.timeRemaining);
            liveAuction.auction.bid && setCurrentBid(liveAuction.auction.bid?.bid)
        }
    }, [liveAuction.auction])

    return (
        <>
            <BackButton />
            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)', padding: '20px' }}>
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
                        display="flex"
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
                                        ${currentBid}M
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
                        <IconButton
                            onClick={handlePreviousPlayer}
                            disabled={players.length === 0}
                            color="primary"
                            size="large"
                            style={{ position: 'absolute', left: 0, zIndex: 10 }}
                        >
                            <ArrowLeftIcon />
                        </IconButton>

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
                            {players.map((player, index) => (
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
                        <IconButton
                            onClick={handleNextPlayer}
                            disabled={players.length === 0}
                            color="primary"
                            size="large"
                            style={{ position: 'absolute', right: 0, zIndex: 10 }}
                        >
                            <ArrowRightIcon />
                        </IconButton>
                    </Box>

                    {/* Time Left Section */}
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        flex={{ xs: '1 1 100%', md: '1 1 25%' }} /* Full width on small, fixed on large */
                    >
                        {liveAuction.auction?.timeRemaining && liveAuction.auction?.timeRemaining > 0 ? (<>
                            <Typography variant="h6" color="secondary" fontWeight="bold">
                                TIME LEFT
                            </Typography>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                {liveAuction.auction?.timeRemaining}
                            </Typography>
                        </>) : null}

                    </Box>
                </Box>




                <AuctionControls
                    onPlay={async () => {
                        await AuctionServ.playPause(); // A default synchronous return if needed
                    }} onPause={async () => {
                        await AuctionServ.playPause(); // A default synchronous return if needed
                    }} onAddTime={function (): void {
                        throw new Error('Function not implemented.');
                    }} onSell={function (): void {
                        throw new Error('Function not implemented.');
                    }} onUndo={function (): void {
                        throw new Error('Function not implemented.');
                    }} onStart={async () => {
                        await AuctionServ.start(players[currentPlayerIndex]._id); // A default synchronous return if needed
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
                    {placeBidClub && <BidDialog open={Boolean(placeBidClub)} onClose={() => setPlaceBidClub(null)}
                        currentBid={currentBid} onSubmit={async (bid) => {
                            const res = await AuctionServ.placeBid(placeBidClub._id, players[currentPlayerIndex]._id, bid);
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
            </Container>
        </>
    );
};

export default AuctionPage;

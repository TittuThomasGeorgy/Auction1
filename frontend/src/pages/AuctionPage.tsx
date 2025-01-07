import React, { useEffect, useState } from 'react';
import { Box, Container, IconButton } from '@mui/material';
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import BackButton from '../components/BackButton';
import usePlayer from '../services/PlayerService';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import { IPlayer } from '../types/PlayerType';
import PlayerCard from '../components/PlayerCard';
import AuctionClubCard from '../components/AuctionClubCard';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};

const AuctionPage = () => {
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    useEffect(() => {
        ClubServ.getAll().then((res) => setClubs(res.data));
        PlayerServ.getAll().then((res) =>
            setPlayers(
                res.data.sort(
                    (a: IPlayer, b: IPlayer) => positionOrder[a.position] - positionOrder[b.position]
                )
            )
        );
    }, []);

    const handleNextPlayer = () => {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    };

    const handlePreviousPlayer = () => {
        setCurrentPlayerIndex((prev) => (prev - 1 + players.length) % players.length);
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

    return (
        <>
            <BackButton />
            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)', padding: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                    <IconButton
                        onClick={handlePreviousPlayer}
                        disabled={players.length === 0}
                        color="primary"
                        size="large"
                    >
                        <ArrowLeftIcon />
                    </IconButton>
                    {players.length > 0 && (
                        <PlayerCard
                            key={players[currentPlayerIndex]._id}
                            player={players[currentPlayerIndex]}
                            club={
                                clubs.find((clb) => clb._id === players[currentPlayerIndex].club) ?? null
                            }
                        />
                    )}
                    <IconButton
                        onClick={handleNextPlayer}
                        disabled={players.length === 0}
                        color="primary"
                        size="large"
                    >
                        <ArrowRightIcon />
                    </IconButton>
                </Box>
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
                        <AuctionClubCard club={club} key={club._id} disabled={club.code!="FCB"} />
                    )}
                </Box>
            </Container>
        </>
    );
};

export default AuctionPage;

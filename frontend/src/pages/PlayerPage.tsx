import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Divider, Grid2 as Grid, Typography } from '@mui/material';
import { Add as AddIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddPlayerDialog from '../components/AddPlayerDialog';
import { defPlayer } from '../services/DefaultValues';
import usePlayer from '../services/PlayerService';
import { IPlayer } from '../types/PlayerType';
import ClubCard from '../components/ClubCard';
import PlayerCard from '../components/PlayerCard';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import BackButton from '../components/BackButton';

const positionOrder: { [key: string]: number } = {
    ST: 1,
    CM: 2,
    DF: 3,
    GK: 4
};
const PlayerPage = () => {
    const PlayerServ = usePlayer();
    const ClubServ = useClub();
    const [open, setOpen] = useState(false)
    const [players, setPlayers] = useState<IPlayer[]>([])
    const [player, setPlayer] = useState<IPlayer>(defPlayer)
    const [clubs, setClubs] = useState<IClub[]>([])
    const [action, setAction] = useState<'add' | 'edit'>('add')
    useEffect(() => {
        ClubServ.getAll()
            .then((res) => setClubs(res.data))
        PlayerServ.getAll()
            .then((res) => setPlayers(res.data))
    }, []);
    return (
        <>
            <BackButton />

            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)' }}>
                <br />
                <Typography variant="h4" color="initial" >
                    <GroupsIcon sx={{ mr: 1 }} fontSize="large" />
                    PLAYERS</Typography>
                <Divider />
                <br />
                <Box
                    sx={{
                        display: 'flex', // Flexbox layout
                        flexWrap: 'wrap', // Allow wrapping if cards exceed container width
                        gap: '16px', // Controls the space between cards
                        justifyContent: 'center', // Center-align cards
                    }}
                >
                    {players.sort((a: IPlayer, b: IPlayer) => {
                        return positionOrder[a.position] - positionOrder[b.position];
                    }).map(_player =>
                        <PlayerCard key={_player._id} player={_player} club={clubs.find(clb => clb._id === _player.club) ?? null} onClick={() => {
                            setAction('edit');
                            setPlayer(_player)
                            setOpen(true)
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
                        setPlayer(defPlayer)
                    },
                },
            ]} />
            <AddPlayerDialog open={open} onClose={() => setOpen(false)}
                action={action}
                onSubmit={(newValue) =>
                    action === 'edit' ?
                        setPlayers((prevPlayers) =>
                            prevPlayers.map(prev => prev._id === newValue._id ? newValue : prev)) :
                        setPlayers((prevPlayers) => [
                            ...prevPlayers,
                            newValue
                        ].sort((a: IPlayer, b: IPlayer) => {
                            // First, sort by position
                            const positionComparison = positionOrder[a.position] - positionOrder[b.position];

                            // If positions are the same, sort by name alphabetically
                            if (positionComparison === 0) {
                                return a.name.localeCompare(b.name); // Sort by name in ascending order
                            }

                            return positionComparison; // If positions differ, prioritize position sorting
                        }))
                }
                value={player}
                clubs={clubs}
            />
        </>
    );
};

export default PlayerPage;

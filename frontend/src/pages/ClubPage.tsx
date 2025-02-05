import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Typography, Divider, Grid2 as Grid } from '@mui/material';
import { Add as AddIcon, LocalPolice as ClubIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import AddClubDialog from '../components/AddClubDialog';
import ClubCard from '../components/ClubCard';
import { defClub, defSettings } from '../services/DefaultValues';
import BackButton from '../components/BackButton';
import useSettings from '../services/SettingsService';
import { ISettings } from '../types/SettingsType';


const ClubPage = () => {
    const ClubServ = useClub();
    const SettingsServ = useSettings();
    const [open, setOpen] = useState(false);
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [settings, setSettings] = useState<ISettings>(defSettings);

    useEffect(() => {
        ClubServ.getAll()
            .then((res) => setClubs(res.data));
        SettingsServ.get()
            .then((res) => setSettings(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <>
            <BackButton />

            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.75)' }}>
                <br />
                <Typography variant="h4" color="initial" >
                    <ClubIcon sx={{ mr: 1 }} fontSize="large" />
                    CLUBS</Typography>
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
                    {clubs.map(club =>
                        <ClubCard club={club} key={club._id} />
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
                    },
                },
            ]} />
            <AddClubDialog open={open} onClose={() => setOpen(false)}
                action='add'
                onSubmit={(newValue) =>
                    // console.log(newValue)
                    setClubs((Clubs) => [...Clubs, newValue])
                }
                value={{ ...defClub, balance: settings.initialBalance }}
            />
        </>
    );
};

export default ClubPage;

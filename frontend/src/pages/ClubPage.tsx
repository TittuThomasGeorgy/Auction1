import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Typography, Divider, Grid2 as Grid } from '@mui/material';
import { Add as AddIcon, LocalPolice as ClubIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import useClub from '../services/ClubService';
import { IClub } from '../types/ClubType';
import AddClubDialog from '../components/AddClubDialog';
import ClubCard from '../components/ClubCard';
import { defClub } from '../services/DefaultValues';


const ClubPage = () => {
    const ClubServ = useClub();
    const [open, setOpen] = useState(false);
    const [clubs, setClubs] = useState<IClub[]>([])
    useEffect(() => {
        ClubServ.getAll()
            .then((res) => setClubs(res.data))
    }, []);

    return (
        <>
            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.26)' }}>
                <br />
                <Typography variant="h5" color="initial">Clubs</Typography>
                <Divider />
                <br /> 
                <Grid container spacing={2}>
                {clubs.map(club =>
                  <Grid size={{md:3,xs:12}} key={club._id}>
                      <ClubCard club={club}  />
                  </Grid>
                )}
                </Grid> 
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
                value={defClub}
            />
        </>
    );
};

export default ClubPage;

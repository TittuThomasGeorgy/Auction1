import React, { useEffect, useState } from 'react';
import { Button, Box, Container, Typography, Divider, Grid2 as Grid } from '@mui/material';
import { Add as AddIcon, LocalPolice as TeamIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';
import AddTeamDialog from '../components/AddTeamDialog';
import useTeam from '../services/TeamService';
import { ITeam } from '../types/TeamType';
import TeamCard from '../components/TeamCard';

const defTeam = {
    _id: '',
    name: '',
    address: '',
    code: '',
    logo: '',
    username: '',
    password: '',
    isAdmin: false,
    manager: {
        img: '',
        name: '',
    }
}

const TeamPage = () => {
    const teamServ = useTeam();
    const [open, setOpen] = useState(false);
    const [teams, setTeams] = useState<ITeam[]>([])
    useEffect(() => {
        teamServ.getAll()
            .then((res) => setTeams(res.data))
    }, []);

    return (
        <>
            <br />
            <br />
            <Container sx={{ bgcolor: 'rgba(24, 24, 24, 0.26)' }}>
                <br />
                <Typography variant="h5" color="initial">Teams</Typography>
                <Divider />
                <br /> 
                <Grid container spacing={2}>
                {teams.map(team =>
                  <Grid size={{md:3,xs:12}} key={team._id}>
                      <TeamCard team={team}  />
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
            <AddTeamDialog open={open} onClose={() => setOpen(false)}
                action='add'
                onSubmit={(newValue) =>
                    // console.log(newValue)
                    setTeams((teams) => [...teams, newValue])
                }
                value={defTeam}
            />
        </>
    );
};

export default TeamPage;

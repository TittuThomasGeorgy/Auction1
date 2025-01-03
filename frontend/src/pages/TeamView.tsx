import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Stack,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Button,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { ITeam } from '../types/TeamType';
import useTeam from '../services/TeamService';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import AddTeamDialog from '../components/AddTeamDialog';

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
const TeamView = () => {
    const { id } = useParams();
    const teamServ = useTeam();
    const [team, setTeam] = useState<ITeam>(defTeam);
    const [open, setOpen] = useState(false);
    const getData = async (_id: string) => {
        const res = await teamServ.getById(_id);
        setTeam(res.data);
    }
    useEffect(() => {
        if (id)
            getData(id);
    }, [id])
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    minHeight: '100vh',
                    // bgcolor: '#f0f4ff',
                }}
            >
                {/* Team Logo */}
                <Card
                    sx={{
                        maxWidth: 600,
                        width: '100%',
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <CardMedia
                        component="img"
                        image={team.logo}
                        alt={`${team.name} logo`}
                        sx={{
                            height: 150,
                            objectFit: 'contain',
                            bgcolor: '#e3f2fd',
                        }}
                    />
                    <CardContent>
                        {/* Team Header */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{ fontWeight: 'bold', color: '#1e88e5' }}
                            >
                                {team.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                                {`(${team.code})`}
                            </Typography>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Team Manager */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                src={team.manager.img}
                                alt={team.manager.name}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mr: 2,
                                    boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                                }}
                            />
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 'bold', color: '#1e88e5', mb: 0.5 }}
                                >
                                    Manager: {team.manager.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                    Username: {team.username}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Admin Badge */}
                        {team.isAdmin && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#388e3c',
                                    fontWeight: 'bold',
                                    border: '1px solid #388e3c',
                                    p: 1,
                                    borderRadius: 1,
                                    textAlign: 'center',
                                    mb: 2,
                                }}
                            >
                                Admin Privileges
                            </Typography>
                        )}

                        {/* Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ textTransform: 'none' }}
                                startIcon={<EditIcon />}
                                onClick={()=>setOpen(true)}
                            >
                                Edit
                            </Button>
                           
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <AddTeamDialog open={open} onClose={() => setOpen(false)}
                action='edit'
                onSubmit={(newValue) =>
                    // console.log(newValue)
                   setTeam(newValue)
                }
                value={team}
            />
        </>
    );
};

export default TeamView;

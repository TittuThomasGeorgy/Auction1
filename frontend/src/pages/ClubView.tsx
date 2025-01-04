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
import { IClub } from '../types/ClubType';
import useClub from '../services/ClubService';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import AddClubDialog from '../components/AddClubDialog';
import BackButton from '../components/BackButton';

const defClub = {
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
const ClubView = () => {
    const { id } = useParams();
    const ClubServ = useClub();
    const [club, setClub] = useState<IClub>(defClub);
    const [open, setOpen] = useState(false);
    const getData = async (_id: string) => {
        const res = await ClubServ.getById(_id);
        setClub(res.data);
    }
    useEffect(() => {
        if (id)
            getData(id);
    }, [id])
    return (
        <>
            <BackButton />
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
                {/* club Logo */}
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
                        image={club.logo}
                        alt={`${club.name} logo`}
                        sx={{
                            height: 150,
                            objectFit: 'contain',
                            bgcolor: '#e3f2fd',
                        }}
                    />
                    <CardContent>
                        {/* club Header */}
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{ fontWeight: 'bold', color: '#1e88e5' }}
                            >
                                {club.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                                {`(${club.code})`}
                            </Typography>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* club Manager */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                src={club.manager.img}
                                alt={club.manager.name}
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
                                    Manager: {club.manager.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                    Username: {club.username}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Admin Badge */}
                        {club.isAdmin && (
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
                                onClick={() => setOpen(true)}
                            >
                                Edit
                            </Button>

                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <AddClubDialog open={open} onClose={() => setOpen(false)}
                action='edit'
                onSubmit={(newValue) =>
                    // console.log(newValue)
                    setClub(newValue)
                }
                value={club}
            />
        </>
    );
};

export default ClubView;

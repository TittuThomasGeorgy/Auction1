import { Container, Typography, TextField, Button, Box, Paper, InputAdornment, Grid2 as Grid, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import useSettings from '../services/SettingsService';
import { ISettings } from '../types/SettingsType';
import { enqueueSnackbar } from 'notistack';
import { SettingsBackupRestore as RestoreIcon, Settings as SettingsIcon, Visibility, VisibilityOff, VisibilityOffOutlined } from '@mui/icons-material';

const SettingsPage = () => {
    const settingsServ = useSettings();
    const [settings, setSettings] = useState<ISettings>({
        _id: '',
        bidTime: 0,
        initialBalance: 0,
        playersPerClub: 0,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Fetch settings on component load
    useEffect(() => {
        settingsServ.get()
            .then((res) => setSettings(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Handle input changes
    const handleInputChange = (field: keyof ISettings, value: number) => {
        setSettings((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle save changes
    const handleSave = () => {
        settingsServ.update(settings)
            .then((res) => {
                setIsEditing(false);
                enqueueSnackbar({
                    variant: res.success ? "success" : 'error',
                    message: res.message,
                });
            })
            .catch((err) => console.error(err));
    };

    const handleReset =
        () => {
            settingsServ.reset(password)
                .then((res) => {
                    setConfirmReset(false);
                    setPassword('');
                    setShowPassword(false)
                    enqueueSnackbar({
                        variant: res.success ? "success" : 'error',
                        message: res.message,
                    });
                })
                .catch((err) => console.error(err));
        }
    return (
        <>
            <BackButton />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper elevation={4} sx={{ p: 3, bgcolor: 'rgba(24, 24, 24, 0.75)', color: 'white' }}>
                    <Typography variant="h4">
                        <SettingsIcon sx={{ mr: 1 }} fontSize="large" />
                        Settings
                    </Typography>
                    <Divider />

                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={4}>
                                <Typography variant="body1" color="initial">Initial Balance:</Typography>
                            </Grid>
                            <Grid size={8}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    variant="outlined"
                                    value={settings.initialBalance}
                                    onChange={(e) => handleInputChange('initialBalance', +e.target.value)}
                                    disabled={!isEditing}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            endAdornment: <InputAdornment position="end">M</InputAdornment>,
                                            inputProps: { min: 0 },
                                        }
                                    }}
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                />
                            </Grid>
                            <Grid size={4}>
                                <Typography variant="body1" color="initial">Players Per Club:</Typography>
                            </Grid>
                            <Grid size={8}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    variant="outlined"
                                    value={settings.playersPerClub}
                                    onChange={(e) => handleInputChange('playersPerClub', +e.target.value)}
                                    disabled={!isEditing}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">👥</InputAdornment>,
                                            endAdornment: <InputAdornment position="end">Players</InputAdornment>,
                                            inputProps: { min: 1 },
                                        }
                                    }}
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                />
                            </Grid>
                            <Grid size={4}>
                                <Typography variant="body1" color="initial">Bid Time:</Typography>
                            </Grid>
                            <Grid size={8}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    variant="outlined"
                                    value={settings.bidTime}
                                    onChange={(e) => handleInputChange('bidTime', +e.target.value)}
                                    disabled={!isEditing}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">⏱</InputAdornment>,
                                            endAdornment: <InputAdornment position="end">Seconds</InputAdornment>,
                                            inputProps: { min: 1 },
                                        }
                                    }}
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                />
                            </Grid>
                            <Grid size={4}>
                                <Button variant="contained" color="error" startIcon={<RestoreIcon />}
                                    onClick={() => setConfirmReset(true)}>
                                    Reset
                                </Button>
                            </Grid>

                        </Grid>
                        <Box mt={3} display="flex" justifyContent="flex-end">
                            {!isEditing ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setIsEditing(true)}
                                    sx={{ minWidth: 120 }}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleSave}
                                        sx={{ minWidth: 120, mr: .5 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setIsEditing(false)}
                                        sx={{ minWidth: 120 }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Container>
            <Dialog open={confirmReset} onClose={() => setConfirmReset(false)}>
                <DialogContent>
                    Are You sure want to reset? If yes, Enter Reset Password.
                    <TextField
                        // label="Password"
                        variant="outlined"
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}

                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmReset(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleReset}
                        sx={{ minWidth: 120 }}
                    >
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SettingsPage;

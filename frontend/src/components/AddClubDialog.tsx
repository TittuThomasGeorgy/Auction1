import { Dialog, DialogTitle, DialogContent, Container, TextField, DialogActions, Button, IconButton, InputAdornment, Grid2 as Grid } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react'
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { IClub } from '../types/ClubType';
import useClub from '../services/ClubService';
import ImageUploader from './ImageUploader';
import { defClub } from '../services/DefaultValues';

const AddClubDialog = (props: { open: boolean; onClose: () => void; onSubmit: (value: IClub) => void; action: 'add' | 'edit'; value: IClub }) => {
    const ClubServ = useClub();
    const [creatableClub, setCreatableClub] = useState<IClub>(defClub);
    const [file1, setFile1] = useState<File>();
    const [file2, setFile2] = useState<File>();
    const [showPassword, setShowPassword] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateUsername = (username: string) => {
        // Example: Username should be at least 4 characters long
        if (username.length < 4) {
            return "Username must be at least 4 characters long";
        }
        return '';
    };

    const validatePassword = (password: string) => {

        if (props.action === 'edit' && !password) return '';
        // Example: Password should have at least 8 characters, including letters and numbers
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return "Password must contain both letters and numbers";
        }
        return '';
    };

    useEffect(() => {
        if (props.value)
            setCreatableClub(props.value)
    }, [props.value])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <form onSubmit={(e) => {
                e.preventDefault();
                const userError = validateUsername(creatableClub.username);
                const passError = validatePassword(creatableClub.password);
                if (userError) {
                    setUsernameError(userError);
                    return;
                }
                else {
                    setUsernameError('')
                }
                if (passError) {
                    setPasswordError(passError);
                    return;
                }
                else {
                    setPasswordError('')
                }

                if (props.action === 'add' && !file1 && !file2) {
                    enqueueSnackbar({
                        variant: "error",
                        message: `File missing`
                    });
                    return;
                }
                props.action === 'edit' ?
                    ClubServ.update(creatableClub, file1, file2).then((res) => {
                        if (res.success) {
                            // setClubs((Clubs) => Clubs.map(scl => scl._id === creatableClub._id ? creatableClub : scl))
                            props.onSubmit({ ...creatableClub })
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Editing Failed`
                            })
                    }) :
                    ClubServ.create(creatableClub, file1, file2).then((res) => {
                        if (res.success) {
                            props.onSubmit({ ...creatableClub })
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                            setCreatableClub(defClub);
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Adding Failed`
                            })
                    });

                props.onClose();
            }}>
                <DialogTitle>{(props.action === 'edit' ? 'Edit ' : 'Add ') + 'Club'}</DialogTitle>
                <DialogContent>
                    <Container>
                        <Grid container spacing={0}>
                            <Grid size={12}>
                                <ImageUploader value={creatableClub.logo} onChange={(newVal) => {
                                    setCreatableClub(club => ({ ...club, logo: newVal }))
                                }}
                                    onFileUpload={(fil) => {
                                        setFile1(fil)
                                    }} />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Name"
                                    value={creatableClub.name}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, name: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Code"
                                    value={creatableClub.code}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, code: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Username"
                                    value={creatableClub.username}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, username: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                    error={!!usernameError}
                                    helperText={usernameError}
                                    disabled={props.action === 'edit'}
                                />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={creatableClub.password}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, password: e.target.value }));
                                    }}
                                    fullWidth
                                    required={props.action != 'edit'}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    error={!!passwordError}
                                    helperText={passwordError}

                                />
                            </Grid>
                            <Grid size={2}>
                                <ImageUploader value={creatableClub.manager.img} onChange={(newVal) => {
                                    setCreatableClub(club => ({ ...club, manager: { ...club.manager, img: newVal } }))

                                }}
                                    onFileUpload={(fil) => {
                                        setFile2(fil)
                                    }}
                                    sx={{ height: 50, width: 50, mt: 3 }}
                                    variant='circular'
                                    id='manager' />
                            </Grid>
                            <Grid size={10}>
                                &ensp;
                                <TextField
                                    label="Manager"
                                    value={creatableClub.manager.name}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, manager: { ...club.manager, name: e.target.value } }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => props.onClose()}>Cancel</Button>
                    <Button type="submit" variant='contained'> {props.action === 'edit' ? 'Edit' : 'Add'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddClubDialog
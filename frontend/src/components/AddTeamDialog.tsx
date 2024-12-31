import { Dialog, DialogTitle, DialogContent, Container, TextField, DialogActions, Button, IconButton, InputAdornment, Grid2 as Grid } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react'
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { ITeam } from '../types/TeamType';
import useTeam from '../services/TeamService';
import ImageUploader from './ImageUploader';
const defTeam = {
    _id: '',
    name: '',
    address: '',
    code: '',
    logo: '',
    username: '',
    password: '',
    isAdmin: false
}
const AddTeamDialog = (props: { open: boolean; onClose: () => void; onSubmit: (value: ITeam) => void; action: 'add' | 'edit'; value: ITeam }) => {
    const schoolServ = useTeam();
    const [creatableTeam, setCreatableTeam] = useState<ITeam>(defTeam);
    const [file1, setFile1] = useState<File>();
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
            setCreatableTeam(props.value)
    }, [props.value])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <form onSubmit={(e) => {
                e.preventDefault();
                const userError = validateUsername(creatableTeam.username);
                const passError = validatePassword(creatableTeam.password);
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

                if (props.action === 'add' && !file1) {
                    enqueueSnackbar({
                        variant: "error",
                        message: `File missing`
                    });
                    return;
                }
                props.action === 'edit' ?
                    schoolServ.update(creatableTeam, file1).then((res) => {
                        if (res.success) {
                            // setTeams((schools) => schools.map(scl => scl._id === creatableTeam._id ? creatableTeam : scl))
                            props.onSubmit({ ...creatableTeam, score: 0 })
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
                    schoolServ.create(creatableTeam, file1).then((res) => {
                        if (res.success) {
                            props.onSubmit({ ...creatableTeam, score: 0 })
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Adding Failed`
                            })
                    });
                props.onClose();
            }}>
                <DialogTitle>{(props.action === 'edit' ? 'Edit ' : 'Add ') + 'Team'}</DialogTitle>
                <DialogContent>
                    <Container>
                        <Grid container spacing={0}>
                            <Grid size={12}>
                                <ImageUploader value={creatableTeam.logo} onChange={(newVal) => {
                                    setCreatableTeam(school => ({ ...school, logo: newVal }))
                                }}
                                    onFileUpload={(fil) => {
                                        setFile1(fil)
                                    }} />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Name"
                                    value={creatableTeam.name}
                                    onChange={(e) => {
                                        setCreatableTeam(school => ({ ...school, name: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Code"
                                    value={creatableTeam.code}
                                    onChange={(e) => {
                                        setCreatableTeam(school => ({ ...school, code: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                &ensp;
                                <TextField
                                    label="Username"
                                    value={creatableTeam.username}
                                    onChange={(e) => {
                                        setCreatableTeam(school => ({ ...school, username: e.target.value }))
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
                                    value={creatableTeam.password}
                                    onChange={(e) => {
                                        setCreatableTeam(school => ({ ...school, password: e.target.value }));
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
                        </Grid>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => props.onClose()}>Cancel</Button>
                    <Button type="submit"> {props.action === 'edit' ? 'Edit' : 'Add'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddTeamDialog
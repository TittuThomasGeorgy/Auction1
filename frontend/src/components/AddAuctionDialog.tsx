import { Dialog, DialogTitle, DialogContent, Container, TextField, DialogActions, Button, IconButton, InputAdornment, Grid2 as Grid, Autocomplete, Avatar, FormControl, FormLabel, RadioGroup, FormHelperText, FormControlLabel, Radio } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { IPlayer, PlayerPosition } from '../types/PlayerType';
import ImageUploader from './ImageUploader';
import usePlayer from '../services/PlayerService';
import { defAuction, defClub, defPlayer, positions } from '../services/DefaultValues';
import { IClub } from '../types/ClubType';
import { IAuction } from '../types/AuctionType';
import useAuction from '../services/AuctionService';


interface AddAuctionDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: { auction: IAuction, club: IClub }) => void;
    action: 'add' | 'edit';
    value: { auction: IAuction, club: IClub },
    // clubs: IClub[]
}
const AddAuctionDialog = (props: AddAuctionDialogProps) => {
    const auctionServ = useAuction();
    const [creatableAuction, setCreatableAuction] = useState<IAuction>(defAuction);
    const [creatableClub, setCreatableClub] = useState<IClub>(defClub);

    const [file, setFile] = useState<File>();
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

    // const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     const newValue = Number(e.target.value);
    //     if ((!isNaN(newValue) && newValue >= 0)) {
    //         setCreatableAuction(auction => ({ ...player, basePrice: newValue }))
    //     }
    // }
    useEffect(() => {
        if (props.value) {
            setCreatableAuction(props.value.auction)
            setCreatableClub(props.value.club)
        }
    }, [props.value])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (props.action === 'add' && !file) {
                    enqueueSnackbar({
                        variant: "error",
                        message: `Image missing`
                    });
                    return;
                }
                console.log(file, 'fil');

                props.action === 'edit' ?
                    auctionServ.update(creatableAuction, creatableClub, file).then((res) => {
                        if (res.success) {
                            // setPlayers((Players) => Players.map(scl => scl._id === creatableAuction._id ? creatableAuction : scl))
                            props.onSubmit({ auction: creatableAuction, club: creatableClub })
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
                    auctionServ.create(creatableAuction, creatableClub, file as File).then((res) => {
                        if (res.success) {
                            props.onSubmit({ auction: creatableAuction, club: creatableClub })
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                            setCreatableAuction(defAuction);
                        }
                        else
                            enqueueSnackbar({
                                variant: "error",
                                message: `Adding Failed`
                            })
                    });

                props.onClose();
            }}>
                <DialogTitle>{(props.action === 'edit' ? 'Edit ' : 'Add ') + 'Player'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1}>
                        <Grid size={12}>
                            <ImageUploader value={creatableAuction.image} onChange={(newVal) => {
                                setCreatableAuction(auction => ({ ...auction, image: newVal }))
                                setCreatableClub(club => ({ ...club, logo: newVal }))

                            }}
                                onFileUpload={(fil) => {
                                    setFile(fil)
                                    // console.log(fil);

                                }}
                                sx={{
                                    background: 'linear-gradient(135deg, #0f3a67, #1c5c94)',
                                    width: 200,
                                    height: 290,
                                    objectFit: 'contain',
                                    // position: 'absolute',
                                    // top: '40%',
                                    right: -10,
                                    // transform: 'translateY(-50%)',
                                    zIndex: 2,
                                }} />
                        </Grid>
                        <Grid size={12}>
                            {/* &ensp; */}
                            <TextField
                                label="Name"
                                value={creatableAuction.name}
                                onChange={(e) => {
                                    setCreatableAuction(auction => ({ ...auction, name: e.target.value }))
                                    setCreatableClub(club => ({ ...club, name: e.target.value }))
                                }}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControl component="fieldset">
                                {/* <FormLabel component="legend">Type</FormLabel> */}
                                <RadioGroup aria-label=""
                                    // name="type"
                                    row
                                    defaultValue={'football'}
                                    value={creatableAuction.type}
                                    onChange={(e) => {
                                        setCreatableClub(club => ({ ...club, type: e.target.value as 'football' | 'cricket' }))
                                        setCreatableAuction(auction => ({ ...auction, type: e.target.value as 'football' | 'cricket' }))
                                    }
                                    }>
                                    <FormControlLabel value="football" control={<Radio />} label="Football" />
                                    <FormControlLabel value="cricket" control={<Radio />} label="Cricket" />
                                </RadioGroup>
                                <FormHelperText></FormHelperText>
                            </FormControl>
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
                        <Grid size={12}>
                            &ensp;
                            <TextField
                                label="Balance"
                                fullWidth
                                type="number"
                                variant="outlined"
                                value={creatableClub.balance}
                                onChange={(e) => {
                                    setCreatableClub(club => ({ ...club, balance: +e.target.value }));
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        endAdornment: <InputAdornment position="end">M</InputAdornment>,
                                        inputProps: { min: 0 },
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={12}>
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
                    {/* <Grid size={12}>
                                <Autocomplete
                                    value={props.clubs.find(clb => clb._id === creatableAuction?.club)}
                                    options={props.clubs}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option._id}>
                                            <Avatar src={option.logo} alt={option.name} sx={{ width: 24, height: 24, marginRight: 1 }} />
                                            {option.name}
                                        </li>
                                    )}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(e, newValue) => {
                                        // if (newValue)
                                        setCreatableAuction(player => ({ ...player, club: newValue?._id }))
                                    }}
                                    fullWidth
                                    renderInput={(params) => <TextField {...params} label="Club" variant='outlined' />}
                                />
                            </Grid> */}

                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => props.onClose()}>Cancel</Button>
                    <Button type="submit" variant='contained'> {props.action === 'edit' ? 'Edit' : 'Add'}</Button>
                </DialogActions>
            </form>
        </Dialog >
    )
}

export default AddAuctionDialog;
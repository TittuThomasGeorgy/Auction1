import { Dialog, DialogTitle, DialogContent, Container, TextField, DialogActions, Button, IconButton, InputAdornment, Grid2 as Grid, Autocomplete, Avatar } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { IPlayer, PlayerPosition } from '../types/PlayerType';
import ImageUploader from './ImageUploader';
import usePlayer from '../services/PlayerService';
import { defPlayer, positions } from '../services/DefaultValues';
import { IClub } from '../types/ClubType';


const AddPlayerDialog = (props: { open: boolean; onClose: () => void; onSubmit: (value: IPlayer) => void; action: 'add' | 'edit'; value: IPlayer, clubs: IClub[] }) => {
    const PlayerServ = usePlayer();
    const [creatablePlayer, setCreatablePlayer] = useState<IPlayer>(defPlayer);
    const [file, setFile] = useState<File>();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = Number(e.target.value);
        if ((!isNaN(newValue) && newValue >= 0)) {
            setCreatablePlayer(player => ({ ...player, basePrice: newValue }))
        }
    }
    useEffect(() => {
        if (props.value)
            setCreatablePlayer(props.value)
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
                props.action === 'edit' ?
                    PlayerServ.update(creatablePlayer, file).then((res) => {
                        if (res.success) {
                            // setPlayers((Players) => Players.map(scl => scl._id === creatablePlayer._id ? creatablePlayer : scl))
                            props.onSubmit(creatablePlayer)
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
                    PlayerServ.create(creatablePlayer, file as File).then((res) => {
                        if (res.success) {
                            props.onSubmit(creatablePlayer)
                            enqueueSnackbar({
                                variant: "success",
                                message: res.message
                            })
                            setCreatablePlayer(defPlayer);
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
                    <Container>
                        <Grid container spacing={1}>
                            <Grid size={12}>
                                <ImageUploader value={creatablePlayer.image} onChange={(newVal) => {
                                    setCreatablePlayer(player => ({ ...player, image: newVal }))
                                }}
                                    onFileUpload={(fil) => {
                                        setFile(fil)
                                    }} />
                            </Grid>
                            <Grid size={12}>
                                {/* &ensp; */}
                                <TextField
                                    label="Name"
                                    value={creatablePlayer.name}
                                    onChange={(e) => {
                                        setCreatablePlayer(player => ({ ...player, name: e.target.value }))
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                <Autocomplete
                                    options={positions}
                                    value={creatablePlayer.position}
                                    onChange={(e, newValue) => {
                                        setCreatablePlayer(player => ({ ...player, position: newValue as PlayerPosition }))
                                    }}
                                    fullWidth
                                    renderInput={(params) => <TextField {...params} label="Position" variant='outlined' />}
                                />
                            </Grid>
                            <Grid size={12}>
                                {/* &ensp; */}
                                <TextField
                                    label="Base Price"
                                    type='number'
                                    value={creatablePlayer.basePrice}
                                    onChange={(e) => {
                                        handleChange(e);
                                    }}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                <Autocomplete
                                    options={props.clubs}
                                    value={props.clubs.find(clb => clb._id === creatablePlayer?.club)}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option._id}>
                                            <Avatar src={option.logo} alt={option.name} sx={{ width: 24, height: 24, marginRight: 1 }} />
                                            {option.name}
                                        </li>
                                    )}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(e, newValue) => {
                                        if (newValue)
                                            setCreatablePlayer(player => ({ ...player, club: newValue?._id }))
                                    }}
                                    fullWidth
                                    renderInput={(params) => <TextField {...params} label="Club" variant='outlined' />}
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

export default AddPlayerDialog;
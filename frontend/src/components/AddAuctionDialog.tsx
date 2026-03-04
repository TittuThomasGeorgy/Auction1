import { Dialog, DialogTitle, DialogContent, Container, TextField, DialogActions, Button, IconButton, InputAdornment, Grid2 as Grid, Autocomplete, Avatar, FormControl, FormLabel, RadioGroup, FormHelperText, FormControlLabel, Radio } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { IPlayer, PlayerPosition } from '../types/PlayerType';
import ImageUploader from './ImageUploader';
import usePlayer from '../services/PlayerService';
import { defAuction, defPlayer, positions } from '../services/DefaultValues';
import { IClub } from '../types/ClubType';
import { IAuction } from '../types/AuctionType';
import useAuction from '../services/AuctionService';


interface AddAuctionDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: IAuction) => void;
    action: 'add' | 'edit';
    value: IAuction,
    // clubs: IClub[]
}
const AddAuctionDialog = (props: AddAuctionDialogProps) => {
    const auctionServ = useAuction();
    const [creatableAuction, setCreatableAuction] = useState<IAuction>(defAuction);
    const [file, setFile] = useState<File>();

    // const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     const newValue = Number(e.target.value);
    //     if ((!isNaN(newValue) && newValue >= 0)) {
    //         setCreatableAuction(auction => ({ ...player, basePrice: newValue }))
    //     }
    // }
    useEffect(() => {
        if (props.value)
            setCreatableAuction(props.value)
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
console.log(file,'fil');

                props.action === 'edit' ?
                    auctionServ.update(creatableAuction, file).then((res) => {
                        if (res.success) {
                            // setPlayers((Players) => Players.map(scl => scl._id === creatableAuction._id ? creatableAuction : scl))
                            props.onSubmit(creatableAuction)
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
                    auctionServ.create(creatableAuction, file as File).then((res) => {
                        if (res.success) {
                            props.onSubmit(creatableAuction)
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
                                    onChange={(e) =>
                                        setCreatableAuction(auction => ({ ...auction, type: e.target.value as 'football' | 'cricket' }))

                                    }>
                                    <FormControlLabel value="football" control={<Radio />} label="Football" />
                                    <FormControlLabel value="cricket" control={<Radio />} label="Cricket" />
                                </RadioGroup>
                                <FormHelperText></FormHelperText>
                            </FormControl>
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

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => props.onClose()}>Cancel</Button>
                    <Button type="submit" variant='contained'> {props.action === 'edit' ? 'Edit' : 'Add'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddAuctionDialog;
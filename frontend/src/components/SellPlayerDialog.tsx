import React, { useState } from 'react'
import { IPlayer } from '../types/PlayerType';
import { IClub } from '../types/ClubType';
import { Autocomplete, Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField } from '@mui/material'
import { AttachMoney as SellIcon } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import usePlayer from '../services/PlayerService';

interface SellPlayerDialog {
    open: boolean;
    onClose: () => void;
    clubs: IClub[];
    bidMultiple: number,
    basePrice: number,
    player: string,
}

const SellPlayerDialog = (props: SellPlayerDialog) => {
    const [club, setClub] = useState<IClub | null>(null)
    const [bidAmount, setBidAmount] = useState<number>(props.basePrice);
    const PlayerServ = usePlayer();

    const handleSubmit = async () => {
        if (!club) {
            enqueueSnackbar({ variant: 'warning', message: `Select a Club` });
        } else if (bidAmount % props.bidMultiple != 0) {
            enqueueSnackbar({ variant: 'error', message: `Bid Should be multiple of ${props.bidMultiple} ` });
        } else if (bidAmount < props.basePrice) {
            enqueueSnackbar({ variant: 'error', message: `Bid Should be greater than or equal to basePrice $ ${props.basePrice}M ` });
        } else {
            const res = await PlayerServ.manualSell(props.player, club._id, bidAmount)
            props.onClose();


        }

    };

    return (
        <Dialog open={props.open} onClose={() => props.onClose()} fullWidth>
            <DialogTitle>
                <SellIcon />Sell Player
            </DialogTitle>
            <DialogContent>
                <Autocomplete
                    value={club}
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
                        setClub(newValue)
                    }}
                    fullWidth
                    renderInput={(params) => <TextField {...params} label="Club" variant='outlined' />}
                />
                <TextField
                    type="number"
                    variant="outlined"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SellIcon /></InputAdornment>,
                            endAdornment: <InputAdornment position="end">M</InputAdornment>,
                            inputProps: { min: 0 },
                        }
                    }}
                    sx={{ fontSize: '1rem', fontWeight: 'bold', width: 150 }}
                    placeholder="Enter your bid"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()} variant='outlined'>
                    Cancel
                </Button>
                <Button onClick={(e) => { e.preventDefault(); handleSubmit(); }} variant='contained' color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SellPlayerDialog
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Chip,
    InputAdornment,
} from '@mui/material';
import { IClub } from '../types/ClubType';
import { enqueueSnackbar } from 'notistack';

interface BidPlayerDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: number) => void;
    club: IClub;
    currentBid: number;
}

const BidDialog = (props: BidPlayerDialogProps) => {
    const [bidAmount, setBidAmount] = useState<number>(0);

    // const quickBidOptions = [100, 200,300,400, 500,600, 1000]; // Define quick bid options here

    const handleQuickBid = (amount: number) => {
        setBidAmount(amount);
    };

    const handleManualBid = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBidAmount(Number(event.target.value));
    };

    const handleSubmit = () => {
        if (bidAmount > props.currentBid) {
            props.onSubmit(bidAmount);
        }
        else
            enqueueSnackbar({
                variant: "error",
                message: `Invalid Bid`
            })
    };

    return (
        <Dialog open={props.open} onClose={props.onClose} aria-labelledby="bid-dialog-title">
            <DialogContent>
                <Box display="flex" alignItems="center" mb={2} sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {/* Club Logo */}
                    <Box
                        component="img"
                        src={props.club.logo}
                        alt={`${props.club.name} logo`}
                        sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'contain',
                            // position: 'absolute',
                            top: 20,
                            zIndex: 2,
                        }}
                    />

                    {/* Club Name */}
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            // color: 'rgba(255, 255, 25    5, 0.9)',
                            // position: 'absolute',
                            // top: 110,
                            left: 15,
                            right: 15,
                            textAlign: 'center',
                            zIndex: 2,
                        }}
                    >
                        {props.club.name}
                    </Typography>

                    {/* Club Balance */}
                    <Box
                        sx={{
                            // position: 'absolute',
                            // bottom: 30,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            zIndex: 2,
                        }}
                    >
                        <Typography variant="h5" textAlign={'center'} color='error'><b>Current Bid:</b> ${props.currentBid.toLocaleString()}M</Typography>

                    </Box>
                </Box>

                <Box display="flex" flexWrap="wrap" gap={2} mb={2} justifyContent="center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                        <Chip
                            key={option}
                            label={`${props.currentBid + option * 100}`}
                            onClick={() => handleQuickBid(props.currentBid + option * 100)}
                            color={bidAmount === props.currentBid + option * 100 ? 'primary' : 'default'}
                            sx={{
                                p: 1,
                                minWidth: 120,
                                flex: '1 0 auto', // Allow chips to fit on the same row without forcing new lines
                                '@media (max-width:600px)': {
                                    flex: '1 0 40%', // Adjust to 40% for smaller screens
                                },
                            }}
                        />
                    ))}
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h6" gutterBottom>
                        Bid Amount:
                    </Typography>
                    <TextField
                        type="number"
                        variant="standard"
                        value={bidAmount}
                        onChange={handleManualBid}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                endAdornment: <InputAdornment position="end">M</InputAdornment>,
                                inputProps: { min: 0 },
                            }
                        }}
                        placeholder="Enter your bid amount"
                    // fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" disabled={bidAmount <= 0}>
                    Place Bid
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BidDialog;

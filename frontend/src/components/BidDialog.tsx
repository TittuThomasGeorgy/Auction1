import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Chip,
    InputAdornment,
    Stack,
} from '@mui/material';
import { IClub } from '../types/ClubType';
import { enqueueSnackbar } from 'notistack';
import { AttachMoney } from '@mui/icons-material';

interface BidPlayerDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: number) => void;
    club: IClub;
    currentBid: number;
    timeRemaining: number;
    bidMultiple: number,
    minBid: number,
    maxBid: number,
    basePrice: number,
}

const BidDialog = (props: BidPlayerDialogProps) => {
    const [bidAmount, setBidAmount] = useState<number>(props.minBid);

    const handleQuickBid = (amount: number) => setBidAmount(amount);
    const handleManualBid = (event: React.ChangeEvent<HTMLInputElement>) => setBidAmount(Number(event.target.value));


    const handleSubmit = () => {
        if (bidAmount % props.bidMultiple != 0) {
            enqueueSnackbar({ variant: 'error', message: `Bid Should be multiple of ${props.bidMultiple} ` });
        } else if (bidAmount <= props.currentBid) {
            enqueueSnackbar({ variant: 'error', message: `Bid Should be greater than ${props.currentBid} ` });
        } else if (bidAmount > props.maxBid) {
            enqueueSnackbar({ variant: 'error', message: `Bid Should not be greater than ${props.maxBid} ` });
        } else if (bidAmount > props.currentBid) {
            props.onSubmit(bidAmount);
        } else {
            enqueueSnackbar({ variant: 'error', message: 'Invalid Bid' });
        }
    };

    useEffect(() => {
        if (props.currentBid == 0)
            setBidAmount(props.basePrice)
        else
            setBidAmount(props.currentBid + props.bidMultiple)
    }, [props.currentBid])
    return (
        <Dialog open={props.open} onClose={props.onClose} aria-labelledby="bid-dialog-title">
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {/* Club Name & Logo */}
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box
                            component="img"
                            src={props.club.logo}
                            alt={`${props.club.name} logo`}
                            sx={{ width: 50, height: 50, objectFit: 'contain' }}
                        />
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {props.club.name}
                        </Typography>
                    </Stack>

                    {/* Club Balance */}
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#2E7D32' }}>
                        Balance: <span style={{ color: '#388E3C' }}>${props.club.balance.toLocaleString()}M</span>
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#FF8F00' }}>
                        Max Bid: <span style={{ color: '#FFA726' }}>
                            ${props.maxBid.toLocaleString()}M
                        </span>
                    </Typography>


                    {/* Current Bid */}
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#D32F2F' }}>
                        Current Bid: <span style={{ color: '#C62828' }}>${props.currentBid.toLocaleString()}M</span>
                    </Typography>

                    {/* Timer */}
                    {props.timeRemaining >= 0 && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#6A1B9A' }}>
                                TIME LEFT:
                            </Typography>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    animation: 'tick 1s infinite',
                                    '@keyframes tick': {
                                        '0%': { transform: 'scale(1)', color: '#FF4500' },
                                        '50%': { transform: 'scale(1.07)', color: '#FFD700' },
                                        '100%': { transform: 'scale(1)', color: '#FF4500' },
                                    },
                                }}
                            >
                                {props.timeRemaining}s
                            </Typography>
                        </Stack>
                    )}

                    {/* Quick Bid Options */}
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                            <Chip
                                key={option}
                                label={`$${props.currentBid + option * props.bidMultiple}`}
                                onClick={() => handleQuickBid(props.currentBid + option * props.bidMultiple)}
                                color={bidAmount === props.currentBid + option * props.bidMultiple ? 'primary' : 'default'}
                                sx={{ p: 1, minWidth: 80, fontSize: '1rem', fontWeight: 'bold' }}
                                disabled={(props.currentBid + option * props.bidMultiple) > props.maxBid}
                            />
                        ))}
                    </Box>

                    {/* Manual Bid Input */}
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
                            Bid Amount:
                        </Typography>
                        <TextField
                            type="number"
                            variant="outlined"
                            value={bidAmount}
                            onChange={handleManualBid}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                                    endAdornment: <InputAdornment position="end">M</InputAdornment>,
                                    inputProps: { min: 0 },
                                }
                            }}
                            sx={{ fontSize: '1rem', fontWeight: 'bold', width: 150 }}
                            placeholder="Enter your bid"
                        />
                    </Stack>
                </Box>
            </DialogContent>

            {/* Action Buttons */}
            <DialogActions>
                <Button onClick={props.onClose} color="secondary" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={bidAmount <= 0}
                    sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                >
                    Place Bid
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BidDialog;

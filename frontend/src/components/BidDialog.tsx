import React, { useState } from 'react';
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

interface BidPlayerDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: number) => void;
    club: IClub;
    currentBid: number;
    timeRemaining: number;
}

const BidDialog = ({ open, onClose, onSubmit, club, currentBid, timeRemaining }: BidPlayerDialogProps) => {
    const [bidAmount, setBidAmount] = useState<number>(currentBid + 100);

    const handleQuickBid = (amount: number) => setBidAmount(amount);
    const handleManualBid = (event: React.ChangeEvent<HTMLInputElement>) => setBidAmount(Number(event.target.value));

    const handleSubmit = () => {
        if (bidAmount > currentBid) {
            onSubmit(bidAmount);
        } else {
            enqueueSnackbar({ variant: 'error', message: 'Invalid Bid' });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="bid-dialog-title">
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    {/* Club Name & Logo */}
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Box
                            component="img"
                            src={club.logo}
                            alt={`${club.name} logo`}
                            sx={{ width: 50, height: 50, objectFit: 'contain' }}
                        />
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {club.name}
                        </Typography>
                    </Stack>

                    {/* Club Balance */}
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#2E7D32' }}>
                        Balance: <span style={{ color: '#388E3C' }}>${club.balance.toLocaleString()}M</span>
                    </Typography>

                    {/* Current Bid */}
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#D32F2F' }}>
                        Current Bid: <span style={{ color: '#C62828' }}>${currentBid.toLocaleString()}M</span>
                    </Typography>

                    {/* Timer */}
                    {timeRemaining >= 0 && (
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
                                {timeRemaining}s
                            </Typography>
                        </Stack>
                    )}

                    {/* Quick Bid Options */}
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                            <Chip
                                key={option}
                                label={`$${currentBid + option * 100}`}
                                onClick={() => handleQuickBid(currentBid + option * 100)}
                                color={bidAmount === currentBid + option * 100 ? 'primary' : 'default'}
                                sx={{ p: 1, minWidth: 80, fontSize: '1rem', fontWeight: 'bold' }}
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
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                endAdornment: <InputAdornment position="end">M</InputAdornment>,
                                inputProps: { min: 0 },
                            }}
                            sx={{ fontSize: '1rem', fontWeight: 'bold', width: 150 }}
                            placeholder="Enter your bid"
                        />
                    </Stack>
                </Box>
            </DialogContent>

            {/* Action Buttons */}
            <DialogActions>
                <Button onClick={onClose} color="secondary" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
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

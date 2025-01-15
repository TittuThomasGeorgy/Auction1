import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import {
    PlayArrow as PlayIcon,
    Undo as UndoIcon,
    MoreTime as MoreTimeIcon,
    AttachMoney as SellIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
} from '@mui/icons-material';
import ConfirmationDialog from './ConfirmationDialog';

interface ControlProps {
    onPlay: () => void;
    onPause: () => void;
    onAddTime: () => void;
    onSell: () => void;
    onUndo: () => void;
    onStart: () => Promise<boolean>;
    onStop: () => Promise<boolean>;
}

const AuctionControls = (props: ControlProps) => {
    const [isStarted, setIsStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        open: boolean;
        action: string | null;
    }>({ open: false, action: null });

    const handleStart = async () => {
        const res = await props.onStart()
        setIsStarted(res);
    };

    const handlePlayPause = () => {
        const _isPlaying = isPlaying;
        setIsPlaying(!_isPlaying);
        _isPlaying ? props.onPause() : props.onPlay();
    };

    const handleAction = (action: string) => {
        setConfirmation({ open: true, action });
    };

    const handleConfirm = async() => {
        if (confirmation.action === 'play/pause') handlePlayPause();
        if (confirmation.action === 'stop') {
            const res = await props.onStop()
            setIsStarted(!res);
        }
        if (confirmation.action === 'undo') props.onUndo();
        if (confirmation.action === 'addTime') props.onAddTime();
        if (confirmation.action === 'sell') props.onSell();

        setConfirmation({ open: false, action: null });
    };

    const handleCancel = () => {
        setConfirmation({ open: false, action: null });
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginRight: '10px' }}>
                {!isStarted ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStart}
                        startIcon={<PlayIcon />}
                    >
                        Start Auction
                    </Button>
                ) : <>
                    <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                        <IconButton
                            aria-label={isPlaying ? 'pause' : 'play'}
                            onClick={() => handleAction('play/pause')}
                            style={{ color: 'white', fontSize: '2rem' }}
                            disabled={!isStarted}
                        >
                            {isPlaying ? <PauseIcon style={{ fontSize: '2rem' }} /> : <PlayIcon style={{ fontSize: '2rem' }} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Undo">
                        <IconButton
                            aria-label="undo"
                            onClick={() => handleAction('undo')}
                            style={{ color: 'white', fontSize: '2rem' }}
                            disabled={!isStarted}
                        >
                            <UndoIcon style={{ fontSize: '2rem' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Time">
                        <IconButton
                            aria-label="addTime"
                            onClick={() => handleAction('addTime')}
                            style={{ color: 'white', fontSize: '2rem' }}
                            disabled={!isStarted}
                        >
                            <MoreTimeIcon style={{ fontSize: '2rem' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sell Player">
                        <IconButton
                            aria-label="sell"
                            onClick={() => handleAction('sell')}
                            style={{ color: 'white', fontSize: '2rem' }}
                            disabled={!isStarted}
                        >
                            <SellIcon style={{ fontSize: '2rem' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Stop Auction">
                        <IconButton
                            aria-label="stop"
                            onClick={() => handleAction('stop')}
                            style={{ color: 'white', fontSize: '2rem' }}
                            disabled={!isStarted}
                        >
                            <StopIcon style={{ fontSize: '2rem' }} />
                        </IconButton>
                    </Tooltip>
                </>
                }
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmation.open}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={
                    confirmation.action === 'play/pause'
                        ? `Are you sure you want to ${isPlaying ? 'pause' : 'play'} auction?`
                        : confirmation.action === 'stop'
                            ? `Are you sure you want to stop auction?`
                            : confirmation.action === 'undo'
                                ? 'Are you sure you want to undo the last action?'
                                : confirmation.action === 'addTime'
                                    ? 'Are you sure you want to add more time?'
                                    : confirmation.action === 'sell'
                                        ? 'Are you sure you want to sell the player?'
                                        : ''
                }
            />
        </>
    );
};

export default AuctionControls;

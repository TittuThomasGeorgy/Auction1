import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FloatingButton from '../components/FloatingButton';

const PlayerPage = () => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <div>Player</div>
            <FloatingButton actions={[
                {
                    name: 'Add',
                    icon: <AddIcon />,
                    onChange: () => {
                        setOpen(true);
                    },
                },
            ]} />
            
        </>
    );
};

export default PlayerPage;

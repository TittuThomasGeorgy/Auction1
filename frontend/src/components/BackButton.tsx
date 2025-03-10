// src/components/BackButton.tsx
import { IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const BackButton = (props: { onClick: () => void }) => {

    // Navigate to the previous page
    const handleBackClick = () => {
        // navigate(-1); // `-1` takes the user to the previous page in history
        props.onClick(); // `-1` takes the user to the previous page in history
    };

    return (
        <IconButton
            size="large"
            onClick={handleBackClick}
            sx={{
                color: '#0f3a67', // Dark blue
                margin: '10px',
                position: 'fixed',
                top: '10px', // Distance from top
                left: '10px', // Distance from left
                zIndex: 999, // Ensure it's above other content
            }}
        ><ArrowBackIcon />
            {/* IconButton text can be omitted to just show the icon */}
        </IconButton>
    );
};

export default BackButton;

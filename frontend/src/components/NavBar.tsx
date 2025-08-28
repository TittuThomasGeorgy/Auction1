import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, IconButton, Avatar } from '@mui/material';
import { Home as HomeIcon, Person as PersonIcon, Groups as GroupsIcon, Settings as SettingsIcon, GavelRounded, LocalPolice as ClubIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Authenticate';
import { IClub } from '../types/ClubType';

const NavBar = (props: { value: Number }) => {
    const [value, setValue] = useState(props.value);
    const [expanded, setExpanded] = useState(true);
    const navigate = useNavigate();
    const curClub = useAuth();

    const menuItems = [
        { label: 'Home', icon: <HomeIcon />, route: '/' },
        { label: 'Auction', icon: <GavelRounded />, route: '/auction' },
        { label: 'Players', icon: <GroupsIcon />, route: '/players' },
        { label: 'Clubs', icon: <ClubIcon />, route: '/club' },
        ...((curClub.club as IClub).isAdmin ? [{ label: 'Settings', icon: <SettingsIcon />, route: '/settings' }] : []),
        { label: 'Profile', icon: <Avatar src={(curClub.club as IClub).logo} />, route: `/club/${(curClub.club as IClub)._id}` },
    ];

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0, // Moves up/down smoothly
                left: '50%',
                transform: 'translateX(-50%)',
                width: '92%',
                zIndex: 1000,
                background: 'linear-gradient(135deg, #121212, #232323)', // Dark Luxe Gradient
                borderRadius: '18px 18px 0 0',
                boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.4)',
                padding: expanded ? '5px 0' : '0px',
                transition: 'bottom 0.3s ease-in-out',
            }}
            elevation={3}
        >
            {/* Always visible toggle button */}
            <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                    position: 'absolute',
                    top: '-20px',
                    left: '90%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 255, 255, 0.15)', // Subtle contrast for visibility
                    color: '#B0BEC5',
                    borderRadius: '50%',
                    padding: '8px', // Larger touch area
                    transition: 'opacity 0.2s ease-in-out, transform 0.3s ease',
                    '&:hover': {
                        opacity: 0.8,
                    },
                }}
            >
                {expanded ? <ExpandMore /> : <ExpandLess />}
            </IconButton>

            {expanded && (
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        navigate(menuItems[newValue].route);
                    }}
                    sx={{ backgroundColor: 'transparent' }}
                >
                    {menuItems.map((item, index) => (
                        <BottomNavigationAction
                            key={index}
                            label={item.label}
                            icon={item.icon}
                            sx={{
                                color: value === index ? '#00BFFF' : '#B0BEC5', // Electric Blue active, Cool Gray inactive
                                transition: 'color 0.3s ease-in-out',
                                '&.Mui-selected': {
                                    color: '#00BFFF',
                                    textShadow: '0px 0px 8px rgba(0, 191, 255, 0.8)', // Subtle Glow for active item
                                },
                            }}
                        />
                    ))}
                </BottomNavigation>
            )}
        </Paper>
    );
};

export default NavBar;

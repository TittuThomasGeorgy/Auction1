import { styled, Box, SpeedDialIcon, SpeedDialAction, Divider, Avatar } from '@mui/material';
import React from 'react'
import SpeedDial, { SpeedDialProps } from '@mui/material/SpeedDial';
import { GavelRounded, Settings as SettingsIcon, LocalPolice as ClubIcon, Groups as GroupsIcon, Person as PersonIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/Authenticate';
import { IClub } from '../types/ClubType';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',  // Fixed to stay at the bottom-left
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  ' &.MuiSpeedDial-directionLeft': {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));
const SpeedDialComponent = () => {
  const curClub = useAuth();

  const navigate = useNavigate();

  const actions = [
    { icon: <PersonIcon />, name: 'Profile', route: `/club/${(curClub.club as IClub)._id}` },
    ...((curClub.club as IClub).isAdmin?[{ icon: <SettingsIcon />, name: 'Settings', route: '/settings' }]:[]),
    { icon: <GroupsIcon />, name: 'Players', route: '/players' },
    { icon: <ClubIcon />, name: 'Club', route: '/club' },
    { icon: <GavelRounded />, name: 'Auction', route: '/auction' },
  ];
  return (
    <Box sx={{ position: 'relative', mt: 10 }}>
      <StyledSpeedDial
        ariaLabel="SpeedDial"
        icon={<Avatar src={(curClub.club as IClub).logo} />}
        direction={'left'}
        
      >
       
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => navigate(action.route)}
          />
        ))}
      </StyledSpeedDial>
    </Box>
  )
}

export default SpeedDialComponent
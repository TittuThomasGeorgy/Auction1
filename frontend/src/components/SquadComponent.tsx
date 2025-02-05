import React from 'react';
import { Box, Typography,Grid2 as Grid } from '@mui/material';
import { IPlayer } from '../types/PlayerType';

interface SquadComponentProps {
  squad: IPlayer[];
}

const SquadComponent = ({ squad }: SquadComponentProps) => {
  // Categorize players based on position
  const strikers = squad.filter((player) => player.position === 'ST');
  const midfielders = squad.filter((player) => player.position === 'CM');
  const defenders = squad.filter((player) => player.position === 'DF');
  const goalkeepers = squad.filter((player) => player.position === 'GK');

  return (
    <Box
      sx={{
        width: '100%',
        height: '83vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Background Image */}
      <img
        src="/ground.jpg"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          zIndex: -1,
        }}
      />

      {/* Grid2 Layout for Positions */}
      <Grid container spacing={0} justifyContent="center" alignItems="center" 
      sx={{}}>
        {strikers.map((player) => (
          <Grid key={player._id} size={12 / strikers.length} sx={{ padding: '0px' }}>
            <PlayerCard player={player} />
          </Grid>
        ))}
        {midfielders.map((player) => (
          <Grid key={player._id} size={12 / midfielders.length} sx={{ padding: '0px' }}>
            <PlayerCard player={player} />
          </Grid>
        ))}
        {defenders.map((player) => (
          <Grid key={player._id} size={12 / defenders.length} sx={{ padding: '4px' }}>
            <PlayerCard player={player} />
          </Grid>
        ))}
        {goalkeepers.map((player) => (
          <Grid key={player._id} size={12 / goalkeepers.length} sx={{ padding: '0px' }}>
            <PlayerCard player={player} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const PlayerCard = ({ player }: { player: IPlayer }) => (
  <Box
    sx={{
      width: 120,
      textAlign: 'center',
      margin: 'auto',
      padding: 1,
      position: 'relative',
      '&:hover .hover-effect': {
        transform: 'scale(1.4)', // Slight zoom on hover
        color: 'primary.main',
      },
      '&:hover .bid-amount': {
        opacity: 1, // Show bid amount on hover
        transform: 'translateY(0)',
      },
      '&:hover .position-box': {
        opacity: 1, // Show position on hover
        transform: 'translateX(0)',
      },
    }}
  >
    {/* Position Box (Appears to the left on hover) */}
    <Box
      className="position-box"
      sx={{
        position: 'absolute',
        left: 0, // Position to the left of the image
        top: '10%',
        transform: 'translateY(-50%) translateX(-10px)',
        // backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 6px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        opacity: 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {player.position}
    </Box>

    {/* Player Image */}
    <Box
      component="img"
      src={player.image}
      alt={player.name}
      className="hover-effect"
      sx={{
        width: '80%',
        height: 100,
        objectFit: 'cover',
        borderRadius: 2,
        transition: 'transform 0.3s ease',
      }}
    />

    {/* Player Name */}
    <Typography
      variant="subtitle1"
      className="hover-effect"
      sx={{
        transition: 'color 0.3s ease',
      }}
    >
      {player.name}
    </Typography>

    {/* Bid Amount (Appears under name on hover) */}
    <Typography
      variant="body2"
      className="bid-amount"
      sx={{
        opacity: 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: 'translateY(-10px)',
        color: 'gray',
      }}
    >
      ${player.bid || 'N/A'}
    </Typography>
  </Box>
);


export default SquadComponent;

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
        height: '80vh',
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
      <Grid container spacing={0} justifyContent="center" alignItems="center">
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

// Extracted PlayerCard Component
const PlayerCard = ({ player }: { player: IPlayer }) => (
  <Box
    sx={{
      width: 120,
      textAlign: 'center',
      margin: 'auto',
      padding: 1,
    }}
  >
    <Box
      component="img"
      src={player.image}
      alt={player.name}
      sx={{
        width: '50%',
        height: 100,
        objectFit: 'cover',
        borderRadius: 2,
      }}
    />
    <Typography variant="subtitle1">{player.name}</Typography>
  </Box>
);

export default SquadComponent;

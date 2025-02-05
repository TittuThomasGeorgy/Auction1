import React from 'react'
import { IBid } from '../types/BidType'
import { IClub } from '../types/ClubType';
import { Box, Avatar, Typography } from '@mui/material';

interface BidComponentProps {
    bids: IBid[];
    clubs: IClub[];
}
const BidComponent = (props: BidComponentProps) => {
    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3 }}>
            {props.bids.map((bid, index) => {
                const club = props.clubs.find(c => c._id === bid.club);
                const fontSize = `${2 - index * 0.2}rem`;
                const color = bid.state === 0 ? 'red' : 'green';
                return (
                    <Box
                        key={bid._id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            justifyContent: 'center',
                            color,
                            p: 1,
                            borderRadius: 1,
                            transition: '   background-color 0.3s',
                            '&:hover': { color: 'yellow',  transform: 'scale(1.4)', }
                        }}
                    >     {club &&
                        <Box
                            component="img"
                            src={club.logo}
                            alt={`${club.name} logo`}
                            sx={{ width: 50 + index * -5, height: 50 + index * -5, mr: 2 }}
                        />}
                        <Typography sx={{ fontSize, ml: 2 }}>${bid.bid.toLocaleString()}M</Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

export default BidComponent
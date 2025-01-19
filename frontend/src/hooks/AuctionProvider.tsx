import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { IAuction } from '../types/AuctionType';

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL); // Replace with your backend URL

// Auction context
const AuctionContext = createContext<AuctionContextType | null>(null);

// Auction Provider Component
export const AuctionProvider = (props: { children: ReactNode }) => {
    const [auction, setAuction] = useState<IAuction | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        // Listen for the start of a new auction
        socket.on('auctionStarted', (auctionData: IAuction) => {
            setAuction(auctionData);
            console.log(auctionData);

            // setTimeRemaining(auctionData.timeRemaining);
        });

        // // Listen for time updates
        // socket.on('auctionTimeUpdate', (data) => {
        //     if (auction && auction.auctionId === data.auctionId) {
        //         setTimeRemaining(data.timeRemaining);
        //     }
        // });

        // // Listen for bid updates
        // socket.on('bidUpdate', (data) => {
        //     if (auction && auction.auctionId === data.auctionId) {
        //         setAuction((prevAuction) => ({
        //             ...prevAuction,
        //             currentBid: data.currentBid,
        //             highestBidder: data.highestBidder,
        //         }));
        //     }
        // });

        // // Listen for auction end
        // socket.on('endAuction', (data) => {
        //     if (auction && auction.auctionId === data.auctionId) {
        //         setAuction(null);
        //         alert('Auction ended');
        //     }
        // });

        return () => {
            socket.off('startAuction');
            // socket.off('auctionTimeUpdate');
            // socket.off('bidUpdate');
            // socket.off('endAuction');
        };
    }, [auction]);

    // // Function to place a bid
    // const placeBid = (bidAmount, bidderId) => {
    //     if (auction && bidAmount > auction.currentBid) {
    //         socket.emit('newBid', { auctionId: auction.auctionId, bidderId, bidAmount });
    //     } else {
    //         alert('Your bid must be higher than the current bid.');
    //     }
    // };

    return (
        <AuctionContext.Provider value={{ auction, time: timeRemaining }}>
            {props.children}
        </AuctionContext.Provider>
    );
};

// Hook to use the Auction context
export const useLiveAuction = () => {
    const context = useContext(AuctionContext);
    if (!context) {
        throw new Error('useAuction must be used within a AuctionProvider');
    }
    return context;
};


interface AuctionContextType {
    auction: IAuction | null;
    time: number;
}
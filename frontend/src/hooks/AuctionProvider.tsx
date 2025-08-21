import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { IAuction } from '../types/AuctionType';
import { IBid } from '../types/BidType';
import useAuction from '../services/AuctionService';
import { initSocket } from '../services/SocketClient';

const AuctionContext = createContext<AuctionContextType | null>(null);

export const AuctionProvider = ({ children }: { children: ReactNode }) => {
    const auctionServ = useAuction();
    const [auction, setAuction] = useState<IAuction | null>(null);

    useEffect(() => {
        const socket = initSocket();

        const handleAuctionStarted = (data: { auction: IAuction }) => {
            setAuction(data.auction);
            enqueueSnackbar({ variant: 'success', message: "Auction Started" });
        };

        const handleAuctionPaused = (data: { status: 'pause' | 'live' }) => {
            setAuction(auction => auction ? { ...auction, status: data.status } : null);
            // enqueueSnackbar({ variant: 'info', message: data.status === 'live' ? "Auction Resumed" : "Auction Paused" });
        };

        const handleTimeUpdate = (data: { timeRemaining: number }) => {
            setAuction(auction => auction ? { ...auction, timeRemaining: data.timeRemaining } : null);
        };

        const handleBidPlaced = (res: { data: IBid | null, message: string }) => {
            setAuction(auction => auction ? { ...auction, bid: res.data } : null);
        };

        const handlePlayerSwitched = (res: { data: { bid: IBid | null, player: string }, message: string }) => {
            setAuction(auction => auction ? { ...auction, bid: res.data.bid, player: res.data.player } : null);
        };

        const handlePlayerSold = (res: { data: { bid: IBid | null }, message: string }) => {
            setAuction(auction => 
                 auction ? { ...auction, timeRemaining: -2, bid: null } : null
            )

        };

        const handleAuctionStopped = () => {
            setAuction(null);
            enqueueSnackbar({ variant: 'success', message: "Auction Stopped" });
        };

        socket.on('auctionStarted', handleAuctionStarted);
        socket.on('auctionPaused', handleAuctionPaused);
        socket.on('auctionTimeUpdate', handleTimeUpdate);
        socket.on('bidPlaced', handleBidPlaced);
        socket.on('playerSwitched', handlePlayerSwitched);
        socket.on('playerSold', handlePlayerSold);
        socket.on('auctionStopped', handleAuctionStopped);

        return () => {
            socket.off('auctionStarted', handleAuctionStarted);
            socket.off('auctionPaused', handleAuctionPaused);
            socket.off('auctionTimeUpdate', handleTimeUpdate);
            socket.off('bidPlaced', handleBidPlaced);
            socket.off('playerSwitched', handlePlayerSwitched);
            socket.off('playerSold', handlePlayerSold);
            socket.off('auctionStopped', handleAuctionStopped);

            // Ensure socket disconnects to prevent memory leaks
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchAuctionData = async () => {
            if (!auction || auction.status === 'stopped') {
                const res = await auctionServ.getAuction();
                if (res.data.status !== 'stopped') {
                    setAuction({ ...res.data, timeRemaining: -1 });
                }
            }
        };
        fetchAuctionData();
    }, [auction]); // Trigger only if auction is null or stopped/ Depend on auction to prevent unnecessary API calls

    return <AuctionContext.Provider value={{ auction }}>{children}</AuctionContext.Provider>;
};

export const useLiveAuction = () => {
    const context = useContext(AuctionContext);
    if (!context) {
        throw new Error('useLiveAuction must be used within an AuctionProvider');
    }
    return context;
};

interface AuctionContextType {
    auction: IAuction | null;
}

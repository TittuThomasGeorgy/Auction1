import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { IAuction } from '../types/AuctionType';
import { IBid } from '../types/BidType';
import { enqueueSnackbar } from 'notistack';
import useAuction from '../services/AuctionService';
import { initSocket } from '../services/SocketClient';


// Auction context
const AuctionContext = createContext<AuctionContextType | null>(null);

// Auction Provider Component
export const AuctionProvider = (props: { children: ReactNode }) => {
    const auctionServ = useAuction();
    const [auction, setAuction] = useState<IAuction | null>(null);

    useEffect(() => {
        const socket = initSocket();
        // Listen for the start of a new auction
        socket.on('auctionStarted', (data: { auction: IAuction }) => {
            setAuction(data.auction);
            enqueueSnackbar({ variant: 'success', message: "Auction Started" });
        });
        socket.on('auctionPaused', (data: { status: 'pause' | 'live' }) => {
            setAuction(auction => auction && ({ ...auction, status: data.status }))
            if (data.status == 'live')
                enqueueSnackbar({ variant: 'info', message: "Auction Resumed" });
            else
                enqueueSnackbar({ variant: 'info', message: "Auction Paused" });
        });

        socket.on('auctionTimeUpdate', (data: { timeRemaining: number }) => {
            setAuction(auction => auction && ({ ...auction, timeRemaining: data.timeRemaining }))
        })
        socket.on('bidPlaced', (res: { data: IBid, message: string }) => {

            setAuction(auction => auction && ({ ...auction, bid: res.data }))
            // enqueueSnackbar({ variant: 'info', message: res.message });
        })
        socket.on('playerSwitched', (res: { data: { bid: IBid | null, player: string }, message: string }) => {
            setAuction(auction => auction && ({ ...auction, bid: res.data.bid, player: res.data.player }))
            // enqueueSnackbar({ variant: 'info', message: res.message });

        })
        socket.on('playerSold', (res: { data: { bid: IBid | null }, message: string }) => {
            setAuction(auction => auction && ({ ...auction, bid: null, timeRemaining: -1 }))
        })

        socket.on('auctionStopped', () => {
            setAuction(null);
            enqueueSnackbar({ variant: 'success', message: "Auction Stopped" });
        })
        // // Listen for auction end
        // socket.on('endAuction', (data) => {
        //     if (auction && auction.auctionId === data.auctionId) {
        //         setAuction(null);
        //         alert('Auction ended');
        //     }
        // });
        // console.log(auction);

        return () => {
            socket.off('auctionStarted');
            socket.off('auctionTimeUpdate');
            socket.off('playerSwitched');
            socket.off('bidPlaced');
            socket.off('auctionStopped');
            socket.off('auctionPaused');
            // disconnectSocket();
            // socket.off('endAuction');
        };
    }, []);


    useEffect(() => {
        const getData = async () => {
            const res = await auctionServ.getAuction();
            if (res.data.status != 'stopped')
                setAuction({ ...res.data, timeRemaining: -1 })
        }
        getData();
    }, [])



    return (
        <AuctionContext.Provider value={{ auction }}>
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
}
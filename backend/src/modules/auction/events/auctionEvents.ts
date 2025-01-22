import { log } from "console";
import { io } from "../../../server";
import { getPlayers } from "../../player/controllers/players.controller";
import { isSettingExist } from "../../settings/controllers/settings.controller";
import { isAuctionExist, placeBid } from "../controllers/auction.controller";
import Auction from "../models/Auction";
import { IAuction } from "../types/auction";
import { IBid } from "../types/bid";
let auctionTimer: string | number | NodeJS.Timeout | undefined;
let timeRemaining = -1;
let currentBid: IBid | null = null;
let auction: IAuction | null = null;

const startLiveAuction = async () => {
    auction = (await isAuctionExist(true)) ?? null;
    if (!auction || auction.status === 'stopped') return
    resetTime();
    // Notify all users about the new auction
    io.emit('auctionStarted', {
        auction: auction,

    });
    // runAuction();
}
const runAuction = async () => {
    auction = (await isAuctionExist()) ?? null;
    // Timer for the auction
    auctionTimer = setInterval(async () => {
        if (timeRemaining >= 0 && auction?.status === 'live') {
            console.log("T:", timeRemaining, new Date());
            // Update frontend with the time remaining
            io.emit('auctionTimeUpdate', { timeRemaining });
            timeRemaining -= 1;
        } else {
            // End the current auction
            playPauseLiveAuction('pause')
            // auction.isLive = false;
            // auction.status = 'completed';
            // await auction.save();

            // io.emit('endAuction', { auctionId: auction?._id });
            // startAuction(); // Start the next auction
        }
    }, 1000); // Countdown every second
}

const bidPlaced = async (bid: IBid) => {
    auction = (await isAuctionExist()) ?? null;
    currentBid = bid;
    resetTime();
    io.emit('bidPlaced', { data: bid, message: `Bid Placed successfully` })

}
const resetTime = async () => {
    auction = (await isAuctionExist()) ?? null;
    if (auctionTimer) clearInterval(auctionTimer);
    const setting = await isSettingExist();
    timeRemaining = setting?.bidTime ?? 0;
    console.log(timeRemaining, 'resetter');
    runAuction();
}
const stopLiveAuction = async () => {
    if (auctionTimer) clearInterval(auctionTimer);
    timeRemaining = -1;
    auction = null;
    currentBid = null;
    io.emit('auctionStopped', {})
}
const playPauseLiveAuction = async (action: 'pause' | 'resume') => {
    auction = (await isAuctionExist()) ?? null;
    if (auction && auction?.status != "stopped") {
        const data = await Auction.findOneAndUpdate({}, {
            status: action == 'resume' ? 'live' : 'pause',
        }, { new: true }) // Optionally return the updated document
        if (action == 'pause') {
            auction.status = 'pause'
            io.emit('auctionPaused', { status: 'pause' });
            // if (auctionTimer) clearInterval(auctionTimer);
            if (auctionTimer) clearInterval(auctionTimer);
        }
        else {
            auction.status = 'live'
            io.emit('auctionPaused', { status: 'live' });
            if (timeRemaining == -1) resetTime();
            else runAuction()
        }
    }
    return auction;
}

const playerChange = async (bid: IBid | null, player: string) => {
    currentBid = bid;
    io.emit('playerSwitched', { data: { bid, player }, message: 'Player Switched' });

}
export { startLiveAuction, bidPlaced, resetTime, stopLiveAuction, playPauseLiveAuction, playerChange }
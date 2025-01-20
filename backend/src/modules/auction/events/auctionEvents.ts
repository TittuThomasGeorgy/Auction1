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
    auction = (await isAuctionExist()) ?? null;
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
        if (timeRemaining > 0 && auction?.status === 'live') {
            timeRemaining -= 1;
            console.log("T:", timeRemaining, new Date());
            // Update frontend with the time remaining
            io.emit('auctionTimeUpdate', { timeRemaining });
        } else {
            // End the current auction
            clearInterval(auctionTimer);
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
const playPauseLiveAuction = async () => {
    auction = (await isAuctionExist()) ?? null;
    // console.log(auction);
    if (auction && auction?.status != "stopped") {
        if (auction.status == 'live') {
            io.emit('auctionPaused', { status: 'live' });
            // if (auctionTimer) clearInterval(auctionTimer);
            if (timeRemaining == -1) resetTime();
            else runAuction()
        }
        else {
            io.emit('auctionPaused', { status: 'pause' });
            if (auctionTimer) clearInterval(auctionTimer);
        }
    }
}
export { startLiveAuction, bidPlaced, resetTime, stopLiveAuction, playPauseLiveAuction }
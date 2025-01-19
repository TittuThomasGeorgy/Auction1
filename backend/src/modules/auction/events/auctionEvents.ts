import { io } from "../../../server";
import { getPlayers } from "../../player/controllers/players.controller";
import { isSettingExist } from "../../settings/controllers/settings.controller";
import { isAuctionExist } from "../controllers/auction.controller";
import Auction from "../models/Auction";
import { IAuction } from "../types/auction";
import { IBid } from "../types/bid";
let auctionTimer: string | number | NodeJS.Timeout | undefined;
let currentPlayerIndex = -1;
let timeRemaining = 0;
let currentBid: IBid | null = null;
let auction: IAuction | null = null;

const startAuction = async () => {
    auction = (await isAuctionExist())??null;
    const player = auction?.player;
    resetTime();
    if (!auction) return
    // Notify all users about the new auction
    io.emit('auctionStarted', {
        auctionId: auction._id,
        player,
        timeRemaining,
    });
    console.log({
        auctionId: auction._id,
        player,
        timeRemaining,
    });

    // Timer for the auction
    auctionTimer = setInterval(async () => {
        timeRemaining -= 1;
        console.log("T:", timeRemaining);

        if (timeRemaining > 0) {
            // Update frontend with the time remaining
            io.emit('auctionTimeUpdate', { auctionId: auction?._id, timeRemaining });
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
    currentBid = bid;
    resetTime();
}
const resetTime = async () => {
    const setting = await isSettingExist();
    timeRemaining = setting?.bidTime ?? 0;
}
export { startAuction, bidPlaced }
import { Router } from "express";
import { io } from "../../../server";
import { getAuction, nextPlayer, placeAuctionBid, playPauseAuction, sellAuctionPlayer, startAuctionReq, stopAuction,addAuctionTime, undoBid } from "../controllers/auction.controller";

const auctionEvents = () => {
    // io.on('placeBid', placeBid)
}

const auctionRouter = Router();

auctionRouter.get('/', getAuction);
auctionRouter.post('/bid', placeAuctionBid);
auctionRouter.post('/sell', sellAuctionPlayer);
auctionRouter.post('/nextPlayer', nextPlayer);
auctionRouter.post('/start', startAuctionReq);
auctionRouter.post('/stop', stopAuction);
auctionRouter.post('/addTime', addAuctionTime);
auctionRouter.post('/pause', playPauseAuction);
auctionRouter.post('/undoBid', undoBid);

export { auctionRouter, auctionEvents };


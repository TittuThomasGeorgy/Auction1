import { Router } from "express";
import { io } from "../../../server";
import { getAuction, nextPlayer, placeBid, playPauseAuction, startAuctionReq, stopAuction } from "../controllers/auction.controller";

const auctionEvents = () => {
    // io.on('placeBid', placeBid)
}

const auctionRouter = Router();

auctionRouter.get('/', getAuction);
auctionRouter.post('/bid', placeBid);
auctionRouter.post('/nextPlayer', nextPlayer);
auctionRouter.post('/start', startAuctionReq);
auctionRouter.post('/stop', stopAuction);
auctionRouter.post('/pause', playPauseAuction);

export { auctionRouter, auctionEvents };


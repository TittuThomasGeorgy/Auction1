import { Router } from "express";
import { io } from "../../../server";
import { nextPlayer, placeBid, startAuctionReq, stopAuction } from "../controllers/auction.controller";

const auctionEvents = () => {
    // io.on('placeBid', placeBid)
}

const auctionRouter = Router();

auctionRouter.post('/bid', placeBid);
auctionRouter.post('/nextPlayer', nextPlayer);
auctionRouter.post('/start', startAuctionReq);
auctionRouter.post('/stop', stopAuction);

export { auctionRouter, auctionEvents };


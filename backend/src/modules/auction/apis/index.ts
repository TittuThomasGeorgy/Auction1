import { Router } from "express";
import { io } from "../../../server";
import { getAuction, nextPlayer, placeBid, playPauseAuction, sellPlayer, startAuctionReq, stopAuction,addAuctionTime } from "../controllers/auction.controller";

const auctionEvents = () => {
    // io.on('placeBid', placeBid)
}

const auctionRouter = Router();

auctionRouter.get('/', getAuction);
auctionRouter.post('/bid', placeBid);
auctionRouter.post('/sell', sellPlayer);
auctionRouter.post('/nextPlayer', nextPlayer);
auctionRouter.post('/start', startAuctionReq);
auctionRouter.post('/stop', stopAuction);
auctionRouter.post('/addTime', addAuctionTime);
auctionRouter.post('/pause', playPauseAuction);

export { auctionRouter, auctionEvents };


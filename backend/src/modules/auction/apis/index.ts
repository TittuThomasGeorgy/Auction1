import { Router } from "express";
import { io } from "../../../server";
import { placeBid, startAuction, stopAuction } from "../controllers/auction.controller";

const auctionEvents = () => {
    io.on('placeBid', placeBid)
}

const auctionRouter = Router();

auctionRouter.post('/start', startAuction);
auctionRouter.post('/stop', stopAuction);

export { auctionRouter, auctionEvents };


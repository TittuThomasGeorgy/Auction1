import { Router } from "express";
import { placeBid } from "../controllers/auction.controller";

const auctionRouter = Router();

// AuctionRouter.get('/', getAuction);
auctionRouter.post('/',  placeBid);
// AuctionRouter.post('/stop',  createAuction);
// AuctionRouter.post('/pause',  createAuction);
// AuctionRouter.post('/play',  createAuction);
// AuctionRouter.post('/bid',  createAuction);
// AuctionRouter.post('/addTime',  createAuction);
// AuctionRouter.post('/sell',  createAuction);


export default auctionRouter;

import { Router } from "express";
import { io } from "../../../server";
import { getAuction, nextPlayer, placeAuctionBid, playPauseAuction, sellAuctionPlayer, startAuctionReq, stopAuction,addAuctionTime, undoBid, getAuctions, createAuction, updateAuction } from "../controllers/auction.controller";
import multer from "multer";

const auctionEvents = () => {
    // io.on('placeBid', placeBid)
}
const upload = multer({
  storage: multer.diskStorage({}),
});

const auctionRouter = Router();

auctionRouter.get('/', getAuctions);
auctionRouter.get('/', getAuction);
auctionRouter.post('/', upload.single('file'), createAuction);
auctionRouter.patch('/:id', upload.single('file'), updateAuction);

auctionRouter.post('/bid', placeAuctionBid);
auctionRouter.post('/sell', sellAuctionPlayer);
auctionRouter.post('/nextPlayer', nextPlayer);
auctionRouter.post('/start', startAuctionReq);
auctionRouter.post('/stop', stopAuction);
auctionRouter.post('/addTime', addAuctionTime);
auctionRouter.post('/pause', playPauseAuction);
auctionRouter.post('/undoBid', undoBid);

export { auctionRouter, auctionEvents };


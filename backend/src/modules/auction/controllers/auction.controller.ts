import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import Club from "../../club/models/Club";
import { uploadFiles } from "../../common/controllers/files.controller";
import Bid from "../models/Bid";
import { io } from "../../../server";
import Auction from "../models/Auction";
import { IAuction } from "../types/auction";
import { addTime, placeBid, playerChange, playerSold, playPauseLiveAuction, startLiveAuction, stopLiveAuction } from "../events/auctionEvents";
import { IBid } from "../types/bid";
import Player from "../../player/models/Player";
import { isSettingExist } from "../../settings/controllers/settings.controller";
import { isPlayerSold } from "../../player/controllers/players.controller";
import { Settings } from "http2";
import { ISettings } from "../../settings/types/setting";
import { IFileModel } from "../../common/types/fileModel";

export const isAuctionExist = async (populateBid?: boolean): Promise<IAuction | null> => {
    let query = Auction.findOne({});
    if (populateBid) {
        query = query.populate('bid');
    }
    const data = await query.exec();
    return data ? data.toJSON() : null;
};
export const isAuctionRunning = async (): Promise<boolean> => {

    const data = await isAuctionExist();
    return data?.status !== 'stopped';
};
export const getAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = req.query.filter as 'football' | 'cricket' | 'all';
        const searchKey = req.query.searchKey as string;
        const filterCondition = (() => {
            if (filter === 'all') {
                return {}; // Players with a non-null club
            }
            else {
                return { type: filter }; // Players with a null club
            }
        })();

        const _data = await Auction.find({
            ...filterCondition, // Apply filter-specific conditions
            ...(searchKey
                ? {
                    name: {
                        $regex: searchKey,
                        $options: 'i',
                    },
                }
                : {})
        }).populate('image').sort({ 'name': 1 });
        const data: IAuction[] = await Promise.all(_data.map(async (auction) => {
            const logoObj = (auction.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
            return {
                ...auction.toObject(),  // Convert mongoose document to a plain object
                image: logoObj ?? '',  // Use the downloadURL if it exists
            };
        }));
        // return data
        sendApiResponse(res, 'OK', data, `Successfully fetched ${filter} Auctions`);
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await isAuctionExist(true);
        sendApiResponse(res, 'OK', data, 'Successfully fetched Auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};

export const startAuctionReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        // const playerSold = await isPlayerSold(req.body.player);
        // if (playerSold)
        //     return sendApiResponse(res, 'CONFLICT', null, 'Player already sold');
        const _lastBid = await lastBid(req.body.player);
        const data = await Auction.findByIdAndUpdate(auction?._id, { status: 'live', player: req.body.player, bid: _lastBid }, { new: true });
        startLiveAuction();
        sendApiResponse(res, 'OK', data, 'Successfully started Auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
export const stopAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        const data = await Auction.findByIdAndUpdate(auction?._id, {
            status: 'stopped',
            player: null, // Nullify the player field
            bid: null // Nullify the bid field
        }, { new: true }) // Optionally return the updated document
        stopLiveAuction();
        sendApiResponse(res, 'OK', data, 'Successfully Stopped auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
export const addAuctionTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        if (auction?.status === 'stopped')
            return sendApiResponse(res, 'CONFLICT', null, 'Auction not Started .');

        const playerSold = auction && await isPlayerSold(auction?.player.toString());
        if (playerSold)
            return sendApiResponse(res, 'CONFLICT', null, 'Player already sold');
        addTime();
        sendApiResponse(res, 'OK', null, 'Successfully Time added');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
export const playPauseAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        const playerSold = auction && await isPlayerSold(auction?.player?.toString());
        if (playerSold)
            return sendApiResponse(res, 'CONFLICT', null, 'Player already sold');
        const data = await playPauseLiveAuction(req.body.action);
        sendApiResponse(res, 'OK', data, 'Successfully Paused auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
export const lastBid = async (playerId: string) => {
    const result = await Bid.find({ player: playerId, state: 1 }).sort({ 'bid': -1 }).limit(1);
    return result[0] || null; // Return the first result or null if no bids match  return data?.toJSON()
}
export const nextPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        const _lastBid = await lastBid(req.body.player);
        const data = await Auction.findByIdAndUpdate(auction?._id, {
            player: req.body.player, // Nullify the player field
            bid: _lastBid?._id ?? null// Nullify the bid field
        },
            { new: true }) // Optionally return the updated document;
        await playerChange(_lastBid ?? null, req.body.player)
        sendApiResponse(res, 'OK', data, 'Next Player updated');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};

export const placeAuctionBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist(true);
        if (auction?.status != 'live')
            return sendApiResponse(res, 'CONFLICT', null, 'Auction paused. Bid not Placed.');

        if ((auction.bid as unknown as IBid)?.club == req.body.club) {
            console.log("Your Bid is the highest.Bid not Placed.".red, auction.bid, req.body.club);
            return sendApiResponse(res, 'CONFLICT', null, 'Your Bid is the highest.Bid not Placed.');
        }
        const _isBidValid = await validateBid(res, req.body);
        if (_isBidValid != 0) return

        const bidId = new mongoose.Types.ObjectId();
        const newBid = await new Bid({ ...req.body, _id: bidId }).save();
        // (await newBid).save();
        await Auction.findByIdAndUpdate(auction?._id, { bid: bidId });
        if (!newBid) {
            return sendApiResponse(res, 'CONFLICT', null, 'Bid Not Placed');
        }
        placeBid(newBid);
        sendApiResponse(res, 'OK', newBid, 'Bid Placed')
    } catch (error) {
        next(error);
    }
}
export const validateSellPlayer = async (playerID: string, checkAuction: boolean) => {
    const auction = await isAuctionExist();

    if (!auction && checkAuction) {
        console.log("Auction Not Started".red);
        return 1;
    }

    const _player = await Player.findById(playerID);
    if (!_player) {
        console.log("Player Not Found".red);
        return 2;
    }
    else if (!!_player?.club) {
        console.log("Player already sold".red);
        return 3
    }
    const _lastBid = await lastBid(playerID);
    if (!_lastBid) {
        console.log("No Bids Found".red);
        return 4
    }

    if (!_lastBid._id.equals(auction?.bid) && checkAuction) {
        console.log("Bids not matching".red, _lastBid._id, auction?.bid);
        return 5
    }
    if (auction && !checkAuction) {
        console.log("Auction Running".red);
        return 6;
    }
    return 0

}
export const sellAuctionPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isValid = await validateSellPlayer(req.body.player, true);

        if (isValid == 1)
            return sendApiResponse(res, 'CONFLICT', null, 'Auction Not Started');
        else if (isValid == 2)
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Found');
        else if (isValid == 3)
            return sendApiResponse(res, 'CONFLICT', null, 'Player already sold');
        else if (isValid == 4)
            return sendApiResponse(res, 'CONFLICT', null, 'No Bids Found');
        else if (isValid == 5)
            return sendApiResponse(res, 'CONFLICT', null, 'Bids not matching');

        const _lastBid = await lastBid(req.body.player);
        const _isBidValid = await validateBid(res, _lastBid);
        if (_isBidValid != 0) return


        const player = await Player.findByIdAndUpdate(req.body.player, { bid: _lastBid._id, club: _lastBid.club }, { new: true }).populate('bid');
        if (!player) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player not Sold');
        }
        await Club.findByIdAndUpdate(
            _lastBid.club,
            { $inc: { balance: -_lastBid.bid } },
            { new: true } // Optional: Returns the updated document
        );
        playerSold(_lastBid);
        sendApiResponse(res, 'OK', player, 'Player Sold')
    } catch (error) {
        next(error);
    }
}

const validateBid = async (res: Response, _bid: IBid) => {
    const _isBidValid = await isBidValid(_bid);

    switch (_isBidValid) {
        case 1:
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Matching');
        case 2:
            return sendApiResponse(res, 'CONFLICT', null, 'Not Enough Balance');
        case 3:
            return sendApiResponse(res, 'CONFLICT', null, 'Higher Bid Exists');
        case 4:
            return sendApiResponse(res, 'CONFLICT', null, 'Bid is Less than Minimum Bid');
        case 5:
            return sendApiResponse(res, 'CONFLICT', null, `Bid must be a multiple of the set value`);
        case 6:
            return sendApiResponse(res, 'CONFLICT', null, `Bid is greater than the allowed max bid`);
        default:
            return 0; // Bid is valid
    }
};
export const isBidValid = async (_bid: IBid) => {
    const auction = await isAuctionExist(true);
    const setting = (await isSettingExist()) as unknown as ISettings;
    const club = (await Club.findById(_bid.club))?.toJSON();
    const bid = (auction?.bid as unknown as IBid)?.bid ?? 0;

    const auctionPlayer = auction?.player?.toString();
    const bidPlayer = _bid.player?.toString();

    const _playerCount = await getNoOfPlayers(_bid.club.toString());
    const _maxBid = club && (club?.balance - ((setting.playersPerClub - _playerCount - 1) * setting.minBid));
    const maxBid = !setting.keepMinBid && club ? club.balance : _maxBid;

    // 1️⃣ Player Mismatch
    if (auctionPlayer && auctionPlayer !== bidPlayer) {
        console.log('Player Not Matching'.red, auctionPlayer, bidPlayer);
        return 1;
    }

    // 2️⃣ Not Enough Balance
    if (club && club.balance < _bid.bid) {
        console.log('Not Enough Balance'.red, club.balance, _bid.bid);
        return 2;
    }

    // 3️⃣ Higher Bid Exists
    if (bid > _bid.bid) {
        console.log('Higher Bid Exists'.red);
        return 3;
    }

    // 4️⃣ Bid is Less than Minimum Bid
    if (_bid.bid < setting?.minBid) {
        console.log('Bid is Less than Minimum Bid'.red);
        return 4;
    }

    // 5️⃣ Bid is Not a Multiple of the Set Value
    if (_bid.bid % setting?.bidMultiple !== 0) {
        console.log(`Bid is not a multiple of ${setting?.bidMultiple}`.red);
        return 5;
    }

    // 6️⃣ Bid is Greater than Max Bid
    if (maxBid && _bid.bid > maxBid) {
        console.log(`Bid is greater than maxBid (${maxBid})`.red);
        return 6;
    }

    return 0; // ✅ Valid Bid
};


const getNoOfPlayers = async (clubId: string) => {
    const data = await Player.countDocuments({ club: clubId })
    return data;
}

export const undoBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist(true);
        if (!auction || auction?.status === 'stopped')
            return sendApiResponse(res, 'CONFLICT', null, 'Auction Stopped. Please Try again');

        const _lastBid = await lastBid(auction?.player.toString())
        const playerSold = await isPlayerSold(auction?.player.toString());
        if (playerSold) {
            await Club.findByIdAndUpdate(_lastBid.club, { $inc: { balance: _lastBid.bid } });
            await Player.findByIdAndUpdate(auction.player, { bid: null, club: null });
            await placeBid(_lastBid);
            return sendApiResponse(res, 'OK', _lastBid, 'Bid Undo');
        }
        if (_lastBid)
            await Bid.findByIdAndUpdate(_lastBid?._id, { state: 0 });

        const _prevBid = await lastBid(auction?.player.toString())
        await Auction.findByIdAndUpdate(auction?._id, { bid: _prevBid?._id ?? null });

        await placeBid(_prevBid);
        sendApiResponse(res, 'OK', _prevBid, 'Bid Undo')
    } catch (error) {
        next(error);
    }
}
export const createAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }

        const _file = await uploadFiles(req.body.name, req.file, process.env.AUCTION_FOLDER ?? '',);

        const newAuction = new Auction({ ...req.body, _id: new mongoose.Types.ObjectId(), status: 'stopped', player: null });
        if (_file) {
            newAuction.image = _file._id;
        }
        else {
            return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                `File upload Failed`);
        }
        newAuction.save();
        if (!newAuction) {
            return sendApiResponse(res, 'CONFLICT', null, 'Auction Not Created');
        }
        io.emit('playerCreated', { data: { player: { ...newAuction.toObject(), image: _file.downloadURL } }, message: `New Auction Added: ${newAuction.name}` });

        sendApiResponse(res, 'CREATED', newAuction,
            `Added Auction successfully`);
    } catch (error) {
        next(error);
    }
}
export const updateAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _updatedAuction = req.body;
        const prevAuction = await Auction.findById(req.params.id).populate(['image']);
        if (!prevAuction) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Auction Not Found');
        }

        const prevAuctionLogo = (prevAuction?.image as unknown as IFileModel);
        const isSameLogo = prevAuctionLogo.downloadURL === _updatedAuction.image;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.AUCTION_FOLDER ?? '', prevAuctionLogo.fileId));
            if (_file) {
                _updatedAuction.image = _file?._id
            }
            else {
                return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                    `File upload Failed`);
            }
        }
        else {
            _updatedAuction.image = prevAuction?.image
        }

        _updatedAuction.bid = prevAuction.bid ?? null;
        const updatedAuction = await Auction.findByIdAndUpdate(req.params.id, _updatedAuction, { new: true }).populate(['image', 'bid']);
        if (!updatedAuction) {
            return sendApiResponse(res, 'CONFLICT', null, 'Auction Not Updated');
        }

        sendApiResponse(res, 'OK', _updatedAuction,
            `Auction updated successfully`);
    } catch (error) {
        next(error);
    }
}
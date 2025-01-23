import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import Club from "../../club/models/Club";
import { uploadFiles } from "../../common/controllers/files.controller";
import Bid from "../models/Bid";
import { io } from "../../../server";
import Auction from "../models/Auction";
import { IAuction } from "../types/auction";
import { bidPlaced, playerChange, playerSold, playPauseLiveAuction, startLiveAuction, stopLiveAuction } from "../events/auctionEvents";
import { IBid } from "../types/bid";
import Player from "../../player/models/Player";
import { isSettingExist } from "../../settings/controllers/settings.controller";

export const isAuctionExist = async (populateBid?: boolean): Promise<IAuction | null> => {
    let query = Auction.findOne({});
    if (populateBid) {
        query = query.populate('bid');
    }
    const data = await query.exec();
    return data ? data.toJSON() : null;
};
export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await isAuctionExist(true);
        sendApiResponse(res, 'OK', data, 'Successfully fetched Auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};

export const createAuction = async () => {
    try {

        const auction = await isAuctionExist();
        if (auction) {
            // console.log('Auction Exists'.bgGreen.black);
            return;
        }
        const newAuction = new Auction({
            _id: new mongoose.Types.ObjectId(),
            status: 'stopped'
        });

        newAuction.save();
        console.log('Auction Created'.bgGreen.black);

        return;
    } catch (error) {
        console.log(error);
    }
}

export const startAuctionReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
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
export const playPauseAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await playPauseLiveAuction(req.body.action);
        sendApiResponse(res, 'OK', data, 'Successfully Paused auction');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};
const lastBid = async (playerId: string) => {
    const result = await Bid.find({ player: playerId, state: 1 }).sort({ 'bid': -1 }).limit(1);
    return result[0] || null; // Return the first result or null if no bids match  return data?.toJSON()
}
export const nextPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auction = await isAuctionExist();
        const _lastBid = await lastBid(req.body.player);
        const data = await Auction.findByIdAndUpdate(auction?._id, {
            player: req.body.player, // Nullify the player field
            bid: _lastBid?._id // Nullify the bid field
        },
            { new: true }) // Optionally return the updated document;
        await playerChange(_lastBid ?? null, req.body.player)
        sendApiResponse(res, 'OK', data, 'Next Player updated');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware for unexpected errors
    }
};

export const placeBid = async (req: Request, res: Response, next: NextFunction) => {
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
        bidPlaced(newBid);
        sendApiResponse(res, 'OK', newBid, 'Bid Placed')
    } catch (error) {
        next(error);
    }
}
export const validateSellPlayer = async ( playerID: string) => {
    const auction = await isAuctionExist();

    if (!auction) {
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

    if (!_lastBid._id.equals(auction?.bid)) {
        console.log("Bids not matching".red, _lastBid._id, auction?.bid);
        return 5
    }
    return 0

}
export const sellPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isValid = await validateSellPlayer(req.body.player);

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
    if (_isBidValid == 1)
        return sendApiResponse(res, 'CONFLICT', null, 'Player Not matching');
    else if (_isBidValid == 2)
        return sendApiResponse(res, 'CONFLICT', null, 'Not Enough balance');
    else if (_isBidValid == 3)
        return sendApiResponse(res, 'CONFLICT', null, 'Higher bid Exist');
    return 0;
}
const isBidValid = async (_bid: IBid) => {
    const auction = await isAuctionExist(true);
    const setting = await isSettingExist();
    const club = (await Club.findById(_bid.club))?.toJSON();
    const bid = (auction?.bid as unknown as IBid)?.bid ?? 0;
    // Ensure both are strings before comparison
    const auctionPlayer = auction?.player?.toString();
    const bidPlayer = _bid.player?.toString();


    // Compare player IDs
    if (auctionPlayer !== bidPlayer) {
        console.log('Player not Matching'.red, auctionPlayer, bidPlayer);

        return 1;
    }
    else if (club && (club.balance < _bid.bid)) {
        console.log('Not Enough Balance'.red, club?.balance, _bid.bid);
        return 2;
    }
    else if (bid > _bid.bid) {
        console.log('Higher bid Exist');
        return 3;
    }

    // else if()
    return 0;
}
const getNoOfPlayers = async (clubId: string) => {
    const data = await Player.find({ club: clubId })
    return data.length ?? 0
}
// export const getClubs = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const searchKey = req.query.searchKey;
//         const _data = await Club.find({
//             ...(searchKey
//                 ? {
//                     $or: [
//                         {
//                             name: {
//                                 $regex: searchKey as string,
//                                 $options: 'i',
//                             },
//                         },
//                         {
//                             code: {
//                                 $regex: searchKey as string,
//                             },
//                         },
//                     ],
//                 }
//                 : {})
//         })
//             .populate('logo')
//             .populate('manager.img')
//             .sort({ 'name': 1 });
//         // If your logo is being populated correctly, we need to handle it properly in the map function
//         const data: IClub[] = _data.map((club) => {
//             const logoObj = (club.logo as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed
//             const logoObj2 = (club.manager.img as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed
//             delete club.password;

//             return {
//                 ...club.toObject(),  // Convert mongoose document to a plain object
//                 logo: logoObj ?? '',  // Use the downloadURL if it exists
//                 manager: {
//                     ...club.toObject().manager,
//                     img: logoObj2 ?? "",
//                 }
//             };
//         });

//         sendApiResponse(res, 'OK', data, 'Successfully fetched list of Clubs');
//     } catch (error) {
//         next(error);
//     }
// }
// // Updated controller function
// export const getClubByIdReq = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const data: IClub = await getClubById(req.params.id);
//         sendApiResponse(res, 'OK', data, 'Successfully fetched club');
//     } catch (error) {
//         if ((error as any).message === 'ClubNotFound') {
//             sendApiResponse(res, 'NOT FOUND', null, 'club Not Found');
//         } else {
//             next(error); // Pass the error to the error-handling middleware for unexpected errors
//         }
//     }
// };

// // Service function to fetch the club data
// export const getClubById = async (id: string | Types.ObjectId): Promise<IClub> => {
//     const _data = await Club.findById(id)
//         .populate('logo')
//         .populate('manager.img')
//         .sort({ 'name': 1 });

//     if (!_data) {
//         throw new Error('ClubNotFound'); // Throw an error if the club is not found
//     }

//     const logoObj = (_data.logo as unknown as IFileModel).downloadURL;
//     const logoObj2 = (_data.manager.img as unknown as IFileModel).downloadURL; // Ensure that club.logo is properly typed

//     const data: IClub = {
//         ..._data.toObject(),
//         logo: logoObj ?? '',
//         manager: {
//             ..._data.toObject().manager,
//             img: logoObj2 ?? "",
//         }
//     };

//     delete data.password;
//     return data; // Return the data to the controller function
// };
// const userNameExist = async (username: string) => {
//     const _club = await Club.find({ username: username });
//     return _club;
// }
// export const createClub = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//         const file1 = files?.file1?.[0];
//         const file2 = files?.file2?.[0];
//         if (!file1 || !file2) {
//             return sendApiResponse(res, 'NOT FOUND', null,
//                 `File Not Found`);
//         }
//         const isUserNameExist = await userNameExist(req.body.username);
//         if (isUserNameExist.length > 0)
//             return sendApiResponse(res, 'CONFLICT', null,
//                 `Username Already Exist`);
//         const _file1 = await uploadFiles(req.body.name, file1, process.env.CLUB_FOLDER ?? '',);
//         const _file2 = await uploadFiles(req.body.manager.name, file2, process.env.MANAGER_FOLDER ?? '',);
//         const newClub = new Club({ ...req.body, _id: new mongoose.Types.ObjectId() });
//         if (_file1 && _file2) {
//             newClub.logo = _file1._id;
//             newClub.manager.img = _file2._id;
//         }
//         else {
//             return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
//                 `File upload Failed`);
//         }
//         newClub.save();
//         if (!newClub) {
//             return sendApiResponse(res, 'CONFLICT', null, 'club Not Created');
//         }
//         delete newClub.password;

//         sendApiResponse(res, 'CREATED', newClub,
//             `Added club successfully`);
//     } catch (error) {
//         next(error);
//     }
// }
// export const updateClub = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const _updatedClub = req.body;
//         const prevClub = await Club.findById(req.params.id).populate('logo').populate('manager.img');
//         if (!prevClub) {
//             return sendApiResponse(res, 'NOT FOUND', null, 'club Not Found');
//         }
//         const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//         const prevClubLogo = (prevClub?.logo as unknown as IFileModel);
//         const isSameLogo = prevClubLogo.downloadURL === _updatedClub.logo;
//         let _file: IFileModel | null = null;
//         const file1 = files?.file1?.[0];
//         if (!isSameLogo && file1) {
//             _file = (await uploadFiles(req.body.name, file1, process.env.Club_FOLDER ?? '', prevClubLogo.fileId));
//             _updatedClub.logo = _file?._id
//         }
//         else {
//             _updatedClub.logo = prevClub?.logo
//         }

//         const prevManImg = (prevClub?.manager.img as unknown as IFileModel);
//         const isSameManImg = prevManImg.downloadURL === _updatedClub.manager.img;
//         const file2 = files?.file2?.[0];
//         if (!isSameManImg && file2) {
//             _file = (await uploadFiles(req.body.manager.name, file2, process.env.MANAGER_FOLDER ?? '', prevManImg.fileId));
//             _updatedClub.manager.img = _file?._id
//         }
//         else {
//             _updatedClub.manager.img = prevClub?.manager.img
//         }

//         if (req.body.password === '')
//             _updatedClub.password = prevClub?.password

//         const updatedClub = await Club.findByIdAndUpdate(req.params.id, _updatedClub);
//         if (!updatedClub) {
//             return sendApiResponse(res, 'CONFLICT', null, 'club Not Updated');
//         }
//         delete _updatedClub.password;

//         sendApiResponse(res, 'OK', _updatedClub,
//             `club updated successfully`);
//     } catch (error) {
//         next(error);
//     }
// }


// export const getClubLogin = async (req: Request, res: Response, next: NextFunction) => {
//     const { username, password } = req.body;
//     console.log({ username, password }, req.body);
//     try {
//         const _data = await Club.findOne({ username: username, password: password })
//             .populate('logo')
//             .sort({ 'name': 1 });
//         if (!_data) {
//             return sendApiResponse(res, 'UNAUTHORIZED', null, 'Invalid Username or Password');
//         }
//         const logoObj = (_data.logo as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed

//         const data: IClub = {
//             ..._data.toObject(),  // Convert mongoose document to a plain object
//             logo: logoObj ?? '', // Use the downloadURL if it exists

//         };
//         delete data.password;
//         sendApiResponse(res, 'OK', data, 'Successfully fetched club');
//     } catch (error) {
//         next(error);
//     }
// }

// export const loggedClub = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const data: IClub = res.locals.club;
//         sendApiResponse(res, 'OK', data, 'Successfully fetched club');
//     } catch (error) {
//         next(error); // Pass the error to the error-handling middleware for unexpected errors
//     }
// };
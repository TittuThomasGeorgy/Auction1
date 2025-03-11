import mongoose, { ObjectId, Types } from "mongoose";
import sendApiResponse from "../../../common/extras/sendApiResponse";
import { NextFunction, Request, Response } from "express";
import { deleteFile, uploadFiles } from "../../common/controllers/files.controller";
import { IFileModel } from "../../common/types/fileModel";
import Player from "../models/Player";
import { IPlayer } from "../types/player";
import { IBid } from "../../auction/types/bid";
import { isAuctionRunning, isBidValid, lastBid, validateSellPlayer } from "../../auction/controllers/auction.controller";
import Club from "../../club/models/Club";
import Bid from "../../auction/models/Bid";
import { io } from "../../../server";
import { playerSold } from "../../auction/events/auctionEvents";



export const getPlayers = async (filter?: 'sold' | 'unsold', searchKey?: string, club?: string) => {
    // Check if the searchKey matches any playerClass element with regex
    // console.log(filter, club, searchKey);

    // Construct filter-specific query conditions
    const filterCondition = (() => {
        if (filter === 'sold') {
            return { club: { $ne: null } }; // Players with a non-null club
        }
        if (filter === 'unsold') {
            return { club: null }; // Players with a null club
        }
        return {}; // Default case for 'all'
    })();


    // Fetch players with combined conditions
    const _data = await Player.find({
        ...filterCondition, // Apply filter-specific conditions
        ...(searchKey
            ? {
                name: {
                    $regex: searchKey,
                    $options: 'i',
                },
            }
            : {}),
        ...(club
            ? {
                club: new mongoose.Types.ObjectId(club)
            }
            : {})
    })
        .populate(['image', 'bid']);
    const positionOrder: { [key: string]: number } = {
        ST: 1,
        CM: 2,
        DF: 3,
        GK: 4,
    };
    const sortedData = _data.sort((a, b) => {
        return positionOrder[a.position] - positionOrder[b.position] || a.name.localeCompare(b.name);
    });
    // If your logo is being populated correctly, we need to handle it properly in the map function
    const data: IPlayer[] = await Promise.all(sortedData.map(async (player) => {
        const logoObj = (player.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const bidAmount = (player.bid as unknown as IBid)?.bid.toString() ?? null;
        return {
            ...player.toObject(),  // Convert mongoose document to a plain object
            image: logoObj ?? '',  // Use the downloadURL if it exists
            bid: bidAmount
        };
    }));
    return data
}
export const getPlayersReq = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = await getPlayers(req.query.filter as 'sold' | 'unsold', req.query.searchKey as string, req.query.club as string)
        if (!(data.length > 0))
           return sendApiResponse(res, 'NOT FOUND', [], 'Players Not Found');

        sendApiResponse(res, 'OK', data, 'Successfully fetched list of Players');
    } catch (error) {
        next(error);
    }
}
export const getPlayerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _data = await Player.findById((req.params.id))
            .populate(['image', 'bid'])
        if (!_data) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }
        const logoObj = (_data.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const bidAmount = (_data.bid as unknown as IBid)?.bid.toString() ?? null;
        const data: IPlayer = {
            ..._data.toObject(),  // Convert mongoose document to a plain object
            image: logoObj ?? '',  // Use the downloadURL if it exists
            bid: bidAmount
        };
        // console.log(data);

        sendApiResponse(res, 'OK', data, 'Successfully fetched Player');
    } catch (error) {
        next(error);
    }
}
export const getBids = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await Bid.find({ player: req.params.id }).sort({ 'createdAt': -1 })
        if (data.length == 0) {
            return sendApiResponse(res, 'NOT FOUND', null, 'No Bids Found');
        }
        // console.log(data);

        sendApiResponse(res, 'OK', data, 'Successfully fetched Bids');
    } catch (error) {
        next(error);
    }
}


export const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (await isAuctionRunning())
            return sendApiResponse(res, "FORBIDDEN", null, ' Auction Running. Please Stop auction.');
        if (!req.file) {
            return sendApiResponse(res, 'NOT FOUND', null,
                `File Not Found`);
        }

        const _file = await uploadFiles(req.body.name, req.file, process.env.PLAYERS_FOLDER ?? '',);

        const newPlayer = new Player({ ...req.body, _id: new mongoose.Types.ObjectId() });
        if (_file) {
            newPlayer.image = _file._id;
        }
        else {
            return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                `File upload Failed`);
        }
        newPlayer.save();
        if (!newPlayer) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Created');
        }
        io.emit('playerCreated', { data: { player: { ...newPlayer.toObject(), image: _file.downloadURL } }, message: `New Player Added: ${newPlayer.name}` });

        sendApiResponse(res, 'CREATED', newPlayer,
            `Added Player successfully`);
    } catch (error) {
        next(error);
    }
}
export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (await isAuctionRunning())
            return sendApiResponse(res, "FORBIDDEN", null, ' Auction Running. Please Stop auction.');
        const _updatedPlayer = req.body;
        const prevPlayer = await Player.findById(req.params.id).populate(['image', 'bid']);
        if (!prevPlayer) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }

        const prevPlayerLogo = (prevPlayer?.image as unknown as IFileModel);
        const isSameLogo = prevPlayerLogo.downloadURL === _updatedPlayer.image;
        let _file: IFileModel | null = null;
        if (!isSameLogo && req.file) {
            _file = (await uploadFiles(req.body.name, req.file, process.env.PLAYERS_FOLDER ?? '', prevPlayerLogo.fileId));
            if (_file) {
                _updatedPlayer.image = _file?._id
            }
            else {
                return sendApiResponse(res, 'SERVICE UNAVAILABLE', null,
                    `File upload Failed`);
            }
        }
        else {
            _updatedPlayer.image = prevPlayer?.image
        }

        if (!req.body.club) _updatedPlayer.club = null;
        _updatedPlayer.bid = prevPlayer.bid ?? null;
        const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, _updatedPlayer, { new: true }).populate(['image', 'bid']);
        if (!updatedPlayer) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Updated');
        }
        const logoObj = (updatedPlayer.image as unknown as IFileModel).downloadURL; // Ensure that scl.logo is properly typed
        const bidAmount = (updatedPlayer.bid as unknown as IBid)?.bid.toString() ?? null;
        io.emit('playerUpdated', { data: { player: { ...updatedPlayer.toObject(), image: logoObj, bid: bidAmount } }, message: `${updatedPlayer.name} Updated` });

        sendApiResponse(res, 'OK', _updatedPlayer,
            `Player updated successfully`);
    } catch (error) {
        next(error);
    }
}
export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (await isAuctionRunning())
            return sendApiResponse(res, "FORBIDDEN", null, ' Auction Running. Please Stop auction.');
        const player = await Player.findById(req.params.id);
        if (!player) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }
        if (player.club) {
            const _lastBid = await lastBid(req.params.id);
            await Club.findByIdAndUpdate(player.club, { $inc: { balance: _lastBid.bid } });
            console.log("Club balance updated");

            await Bid.deleteMany({ player: req.params.id });
            console.log("Bid Removed");
        }
        if (player.image)
            await deleteFile(player.image.toString())
        const deletedPlayer = await Player.findByIdAndDelete(req.params.id)
        if (!deletedPlayer) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Deleted');
        }
        io.emit('playerDeleted', { data: { _id: req.params.id }, message: `${deletedPlayer.name} Deleted` });

        sendApiResponse(res, 'OK', player,
            `Player deleted successfully`);
    } catch (error) {
        next(error);
    }
}
export const removeClub = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (await isAuctionRunning())
            return sendApiResponse(res, "FORBIDDEN", null, ' Auction Running. Please Stop auction.');
        const player = await Player.findByIdAndUpdate(req.params.id, { bid: null, club: null });
        if (!player) {
            return sendApiResponse(res, 'NOT FOUND', null, 'Player Not Found');
        }
        if (player.club) {
            const _lastBid = await lastBid(req.params.id);
            await Club.findByIdAndUpdate(player.club, { $inc: { balance: _lastBid.bid } });
            console.log("Club balance updated");

            await Bid.deleteMany({ player: req.params.id });
            console.log("Bid Removed");
        }
        io.emit('playerClubRemoved', { data: { _id: req.params.id }, message: `${player.name} Club Removed` });

        sendApiResponse(res, 'OK', player,
            `Player club removed successfully`);
    } catch (error) {
        next(error);
    }
}
export const sellPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isValid = await validateSellPlayer(req.body.player, false);

        if (isValid == 6)
            return sendApiResponse(res, 'CONFLICT', null, ' Auction Running. Please Stop auction.');
        else if (isValid == 2)
            return sendApiResponse(res, 'CONFLICT', null, 'Player Not Found');
        else if (isValid == 3)
            return sendApiResponse(res, 'CONFLICT', null, 'Player already sold');
        const bidId = new mongoose.Types.ObjectId();
        const newBid = new Bid({ ...req.body, _id: bidId });
        // (await newBid).save();
        const _isBidValid = await isBidValid(newBid);

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
                await newBid.save();
        }


        const player = await Player.findByIdAndUpdate(req.body.player, { bid: newBid._id, club: newBid.club }, { new: true }).populate('bid');
        if (!player) {
            return sendApiResponse(res, 'CONFLICT', null, 'Player not Sold');
        }
        await Club.findByIdAndUpdate(
            newBid.club,
            { $inc: { balance: -newBid.bid } },
            { new: true } // Optional: Returns the updated document
        );
        playerSold(newBid);
        sendApiResponse(res, 'OK', player, 'Player Sold')
    } catch (error) {
        next(error);
    }
}
export const isPlayerSold = async (id: string) => {
    const club = (await Player.findById(id))?.club;
    return Boolean(club);
}
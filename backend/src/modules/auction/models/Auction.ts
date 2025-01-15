import { Schema, model } from 'mongoose';
import { IAuction } from '../types/auction';

export const AuctionSchema = new Schema<IAuction>({
  _id: { type: Schema.Types.ObjectId, required: true },
  player: { type: Schema.Types.ObjectId, ref: 'players'},
  bid: { type: Schema.Types.ObjectId, ref: 'bids' },
  status: { type: String, enum: ['pause', 'live', 'stopped'], required: true },
}, {
  timestamps: true,
});
const Auction = model<IAuction>('auction', AuctionSchema);

export default Auction;

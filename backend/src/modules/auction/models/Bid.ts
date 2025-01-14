import { Schema, model } from 'mongoose';
import { IBid } from '../types/bid';

export const BidSchema = new Schema<IBid>({
  _id: { type: Schema.Types.ObjectId, required: true },
  player: { type: Schema.Types.ObjectId, ref: 'players' },
  club: { type: Schema.Types.ObjectId, ref: 'clubs' },
  bid: { type: Number, required: true },
}, {
  timestamps: true,
});
const Bid = model<IBid>('bids', BidSchema);

export default Bid;

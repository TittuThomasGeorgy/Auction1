import { Schema, model } from 'mongoose';
import { IPlayer } from '../types/player';

export const PlayerSchema = new Schema<IPlayer>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  image: { type: Schema.Types.ObjectId, ref: 'files' },
  position: { type: String, enum: ['ST', 'CM', 'DF', 'GK'], required: true },
  basePrice: { type: Number, default: 100 },
  bid: { type: Schema.Types.ObjectId, ref: 'bids'},
  club: { type: Schema.Types.ObjectId, ref: 'clubs', required: false },
}, {
  timestamps: true,
});
const Player = model<IPlayer>('players', PlayerSchema);

export default Player;

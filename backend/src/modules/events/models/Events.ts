import { Schema, model } from 'mongoose';
import { IEvent } from '../types/events';

export const EventSchema = new Schema<IEvent>({
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    category: { type: Number, enum: [0, 1, 2, 3, 4, 5], required: true },
    type: { type: String, enum: ['IND', 'GRP'], required: true },
    logo: { type: Schema.Types.ObjectId, ref: 'files' },
    time: { type: String, required: true, default: '5mts' },
    result : {
        first: [{ type: Schema.Types.ObjectId, ref: 'students' }],
        second: [{ type: Schema.Types.ObjectId, ref: 'students' }],
        third: [{ type: Schema.Types.ObjectId, ref: 'students' }],
    }
}, {
    timestamps: true,
});

const Events = model<IEvent>('events', EventSchema);

export default Events;

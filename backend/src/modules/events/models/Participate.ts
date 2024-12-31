import { Schema, model } from 'mongoose';
import { IParticipant } from '../types/participant';

export const ParticipantSchema = new Schema<IParticipant>({
    _id: { type: Schema.Types.ObjectId, required: true },
    student: { type: Schema.Types.ObjectId, ref: 'students', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'events', required: true, },
    score: {
        judge1: {
            type: Number,
            default: 0
        },
        judge2: {
            type: Number,
            default: 0
        },
        judge3: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
});

const Participant = model<IParticipant>('participants', ParticipantSchema);

export default Participant;

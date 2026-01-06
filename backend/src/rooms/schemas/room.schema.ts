import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
    @Prop({ required: true })
    type: 'private' | 'group';

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    participants: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Message' })
    lastMessage: Types.ObjectId;

    // For group chats later
    @Prop()
    name?: string;

    @Prop()
    admin?: Types.ObjectId;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
    roomId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ required: true })
    content: string;

    @Prop({ default: 'sent' })
    status: 'sent' | 'delivered' | 'read';

    @Prop()
    type: 'text' | 'image' | 'file';
}

export const MessageSchema = SchemaFactory.createForClass(Message);

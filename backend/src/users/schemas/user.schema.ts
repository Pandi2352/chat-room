import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string; // Store hashed password

    @Prop({ required: true })
    displayName: string;

    @Prop()
    avatarUrl: string;

    @Prop({ default: 'offline' })
    status: 'online' | 'offline' | 'busy';

    @Prop()
    lastSeen: Date;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    location: string;

    @Prop()
    about: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

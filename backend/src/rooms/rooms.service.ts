import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomsService {
    constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) { }

    async createPrivateRoom(user1: string, user2: string): Promise<RoomDocument> {
        const existingRoom = await this.roomModel.findOne({
            type: 'private',
            participants: { $all: [user1, user2] },
        });
        if (existingRoom) {
            return await existingRoom.populate('participants', 'displayName avatarUrl email status phone address location about');
        }

        const newRoom = new this.roomModel({
            type: 'private',
            participants: [user1, user2],
        });
        const savedRoom = await newRoom.save();
        return await savedRoom.populate('participants', 'displayName avatarUrl email status phone address location about');
    }

    async getRoomsForUser(userId: string): Promise<RoomDocument[]> {
        return this.roomModel
            .find({ participants: userId })
            .populate('participants', 'displayName avatarUrl email status phone address location about')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }

    async findById(roomId: string): Promise<RoomDocument | null> {
        return this.roomModel.findById(roomId).exec();
    }
}

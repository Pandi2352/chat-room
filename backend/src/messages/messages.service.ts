import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
    constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) { }

    async create(createMessageDto: any): Promise<Message> {
        const createdMessage = new this.messageModel({
            ...createMessageDto,
            type: createMessageDto.type || 'text'
        });
        return createdMessage.save();
    }

    async findAllByRoom(roomId: string): Promise<Message[]> {
        return this.messageModel.find({ roomId }).sort({ createdAt: 1 }).exec();
    }

    async markAsRead(roomId: string, userId: string): Promise<void> {
        await this.messageModel.updateMany(
            { roomId, senderId: { $ne: userId }, status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        ).exec();
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: any): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async search(query: string): Promise<User[]> {
        return this.userModel.find({
            displayName: { $regex: query, $options: 'i' },
        }).select('-passwordHash').exec();
    }

    async update(id: string, updateData: any): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash').exec();
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }

    async updateStatus(id: string, status: 'online' | 'offline' | 'busy'): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(id, { status, lastSeen: new Date() }, { new: true }).exec();
        if (!user) throw new Error('User not found');
        return user;
    }
}

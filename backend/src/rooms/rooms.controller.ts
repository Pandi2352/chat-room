import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Get()
    async getRooms(@Request() req) {
        return this.roomsService.getRoomsForUser(req.user.userId);
    }

    @Post()
    async createRoom(@Request() req, @Body('targetUserId') targetUserId: string) {
        return this.roomsService.createPrivateRoom(req.user.userId, targetUserId);
    }
}

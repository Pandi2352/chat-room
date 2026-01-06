import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get(':roomId')
    async getMessages(@Param('roomId') roomId: string) {
        return this.messagesService.findAllByRoom(roomId);
    }
}

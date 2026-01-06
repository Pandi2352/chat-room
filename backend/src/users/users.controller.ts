import { Body, Controller, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('search')
    async search(@Query('q') query: string) {
        if (!query) return [];
        return this.usersService.search(query);
    }

    @Put('profile')
    async updateProfile(@Req() req, @Body() body: any) {
        // req.user is populated by JWT strategy
        const userId = req.user.userId;
        return this.usersService.update(userId, body);
    }
}

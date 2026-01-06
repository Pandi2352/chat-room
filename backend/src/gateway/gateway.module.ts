import { Module } from '@nestjs/common';
import { ChatGatewayGateway } from './chat-gateway.gateway';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MessagesModule,
        UsersModule,
        JwtModule.register({
            secret: 'SECRET_KEY_HERE', // TODO: Use env var
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [ChatGatewayGateway],
})
export class GatewayModule { }

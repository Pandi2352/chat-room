import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ChatGatewayGateway } from './gateway/chat-gateway.gateway';
import { RoomsModule } from './rooms/rooms.module';
import { GatewayModule } from './gateway/gateway.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    RoomsModule,
    GatewayModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGatewayGateway],
})
export class AppModule { }

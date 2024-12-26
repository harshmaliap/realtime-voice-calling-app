import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CallGateway } from './call.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CallGateway],
})
export class AppModule {}

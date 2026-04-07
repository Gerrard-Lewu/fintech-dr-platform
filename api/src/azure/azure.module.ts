import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';

@Module({
  providers: [AzureService],
  exports: [AzureService], // We export it so other modules can use it
})
export class AzureModule {}
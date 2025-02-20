import { Module } from '@nestjs/common';
import { ClicksService } from './clicks.service';
import { ClicksController } from './clicks.controller';
import { Click } from './entities/click.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from 'src/links/entities/link.entity';
import { LinksModule } from 'src/links/links.module';
import { LinksService } from 'src/links/links.service';

@Module({
  imports: [TypeOrmModule.forFeature([Click, Link])],
  providers: [ClicksService],
  controllers: [ClicksController],
  exports: [ClicksService]
})
export class ClicksModule {}

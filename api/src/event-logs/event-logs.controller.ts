import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { UpdateEventLogDto } from './dto/update-event-log.dto';

@Controller('event-logs')
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Post()
  create(@Body() createEventLogDto: CreateEventLogDto) {
    return this.eventLogsService.create(createEventLogDto);
  }

  @Get()
  findAll() {
    return this.eventLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventLogDto: UpdateEventLogDto) {
    return this.eventLogsService.update(+id, updateEventLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventLogsService.remove(+id);
  }
}

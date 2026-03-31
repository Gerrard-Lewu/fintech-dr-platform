import { Injectable } from '@nestjs/common';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { UpdateEventLogDto } from './dto/update-event-log.dto';

@Injectable()
export class EventLogsService {
  create(createEventLogDto: CreateEventLogDto) {
    return 'This action adds a new eventLog';
  }

  findAll() {
    return `This action returns all eventLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventLog`;
  }

  update(id: number, updateEventLogDto: UpdateEventLogDto) {
    return `This action updates a #${id} eventLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventLog`;
  }
}

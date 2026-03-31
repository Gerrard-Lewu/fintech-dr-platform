import { PartialType } from '@nestjs/mapped-types';
import { CreateEventLogDto } from './create-event-log.dto';

export class UpdateEventLogDto extends PartialType(CreateEventLogDto) {}

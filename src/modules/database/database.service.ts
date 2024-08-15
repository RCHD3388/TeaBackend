import { Injectable, Logger } from '@nestjs/common';
import { CustomLoggerService } from 'src/modules/custom-logger/logger.service';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly dataSource: DataSource, 
    private readonly logger: CustomLoggerService
  ) { }
  checkConnection() {
    if (this.dataSource.isInitialized) {
      this.logger.log(`Database \"${this.dataSource.driver.database}\" connected`);
    }
  }
}

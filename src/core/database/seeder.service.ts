import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './../../feature_module/user/user.schema';
import { CustomLoggerService } from '../custom_logger/logger.service';
import { userData } from './data/person.data';

@Injectable()
export class SeederService {
  constructor(
    private logger: CustomLoggerService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async seedModel<T>(model: Model<T>, data: T[]){
    await model.deleteMany();
    await model.insertMany(data);
    this.logger.log(`${model.modelName} seeded !`)
  }

  async seed() {
    this.logger.log("Seeding data ...")
    await this.seedModel(this.userModel, userData);
    this.logger.log("Seeding completed !")
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDetail } from './attendance.schema';
import { CreateAttendanceDetailDto } from './dto/create-d_attendance.input'; // DTO for AttendanceDetail
import { CreateAttendanceDto } from './dto/create-attendance.input'; // DTO for Attendance

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,

    @InjectModel(AttendanceDetail.name)
    private readonly attendanceDetailModel: Model<AttendanceDetail>
  ) {}

  // Find all attendance records
  async findAll(): Promise<Attendance[]> {
    return this.attendanceModel.find().exec();
  }

  // Find one attendance record by ID
  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance #${id} not found`);
    }
    return attendance;
  }

  // Create a new attendance record (without details initially)
  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const newAttendance = new this.attendanceModel(createAttendanceDto);
    return newAttendance.save();
  }

  //-UPDATE

  async update(
    id: string,
    updateAttendanceDto: CreateAttendanceDto
  ): Promise<Attendance> {
    const updatedAttendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
      .exec();
    if (!updatedAttendance) {
      throw new NotFoundException(`Attendance #${id} not found`);
    }
    return updatedAttendance;
  }

  // Delete an attendance record by ID
  async delete(id: string): Promise<boolean> {
    const result = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Attendance #${id} not found`);
    }
    return true;
  }

  // ----------------------------------------------------------
  // AttendanceDetail CRUD operations
  // ----------------------------------------------------------

  // Create an attendance detail and associate it with an attendance record
  async createAttendanceDetail(
    attendanceId: string,
    createAttendanceDetailDto: CreateAttendanceDetailDto
  ): Promise<AttendanceDetail> {
    // Find the attendance document
    const attendance = await this.attendanceModel.findById(attendanceId).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance #${attendanceId} not found`);
    }

    const attendanceDetail = new this.attendanceDetailModel(
      createAttendanceDetailDto
    );
    await attendanceDetail.save();

    const attendanceDetailId = new Types.ObjectId(
      attendanceDetail._id as string
    );

    attendance.attendance_detail.push(attendanceDetailId);

    await attendance.save();

    return attendanceDetail;
  }

  async findAttendanceDetails(
    attendanceId: string
  ): Promise<AttendanceDetail[]> {
    const attendance = await this.attendanceModel.findById(attendanceId).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance #${attendanceId} not found`);
    }

    return this.attendanceDetailModel
      .find({ _id: { $in: attendance.attendance_detail } })
      .exec();
  }

  // Update an attendance detail
  async updateAttendanceDetail(
    attendanceDetailId: string,
    updateAttendanceDetailDto: CreateAttendanceDetailDto
  ): Promise<AttendanceDetail> {
    const updatedAttendanceDetail = await this.attendanceDetailModel
      .findByIdAndUpdate(attendanceDetailId, updateAttendanceDetailDto, {
        new: true,
      })
      .exec();
    if (!updatedAttendanceDetail) {
      throw new NotFoundException(
        `AttendanceDetail #${attendanceDetailId} not found`
      );
    }
    return updatedAttendanceDetail;
  }

  //delete attendance detail dari suatu attendance
  async deleteAttendanceDetail(
    attendanceId: string,
    attendanceDetailId: string
  ): Promise<boolean> {
    const attendance = await this.attendanceModel.findById(attendanceId).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance #${attendanceId} not found`);
    }
    const attendanceToRemove = await this.attendanceDetailModel
      .findById(attendanceDetailId)
      .exec();
    attendance.attendance_detail = attendance.attendance_detail.filter(
      (detail) => !detail._id.equals(attendanceToRemove._id as string)
    );

    await attendance.save();

    // Delete the AttendanceDetail document
    await this.attendanceDetailModel
      .findByIdAndDelete(attendanceDetailId)
      .exec();
    return true;
  }
}

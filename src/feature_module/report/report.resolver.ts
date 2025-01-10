import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Resolver()
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Mutation(() => String)
  async generateReport(
    @Args('attendanceModuleData', { type: () => String })
    attendanceModuleData: string,
  ): Promise<string> {
    try {
      const parsedData = JSON.parse(attendanceModuleData);

      // Assuming you're generating PDF here
      const pdfBuffer = await this.reportService.generateReport(parsedData); // Your PDF generation function

      // Convert buffer to base64 string
      const pdfBase64 = pdfBuffer.toString('base64');

      return pdfBase64; // Return the PDF as base64 string
    } catch (error) {
      throw new Error(`Failed to generate report: ${error}`);
    }
  }
  @Query(() => String, { description: 'Preview the report as Base64 string' })
  async previewReport(
    @Args('attendanceModuleData', { type: () => String })
    attendanceModuleData: string,
  ): Promise<string> {
    try {
      // Generate the report and return as Base64
      const pdfBuffer = await this.reportService.generateReport(
        JSON.parse(attendanceModuleData),
      );
      const pdfBase64 = pdfBuffer.toString('base64');
      return pdfBase64; // Return the Base64-encoded PDF
    } catch (error) {
      console.error('Error in previewReport:', error);
      throw new Error('Failed to generate report');
    }
  }

  //purchase order
  @Mutation(() => String, { description: 'Generate Purchase Order Report' })
  async generatePurchaseOrder(
    @Args('purchaseOrderData', { type: () => String })
    purchaseOrderData: string,
  ): Promise<string> {
    try {
      const parsedData = JSON.parse(purchaseOrderData);

      // Generate PDF for the purchase order
      const pdfBuffer =
        await this.reportService.generateReportPurchaseOrder(parsedData);

      // Convert buffer to base64 string
      const pdfBase64 = pdfBuffer.toString('base64');

      return pdfBase64; // Return the PDF as base64 string
    } catch (error) {
      throw new Error(`Failed to generate purchase order report: ${error}`);
    }
  }

  @Query(() => String, {
    description: 'Preview Purchase Order Report as Base64',
  })
  async previewPurchaseOrder(
    @Args('purchaseOrderData', { type: () => String })
    purchaseOrderData: string,
  ): Promise<string> {
    try {
      // Generate the purchase order report and return as Base64
      const pdfBuffer = await this.reportService.generateReportPurchaseOrder(
        JSON.parse(purchaseOrderData),
      );
      const pdfBase64 = pdfBuffer.toString('base64');
      return pdfBase64; // Return the Base64-encoded PDF
    } catch (error) {
      console.error('Error in previewPurchaseOrder:', error);
      throw new Error('Failed to generate purchase order report');
    }
  }

  // Resolver
  @Query(() => String, {
    description: 'Preview Project Cost Log Report as Base64',
  })
  async previewProjectCostLogReport(
    @Args('projectId', { type: () => String }) projectId: string,
    @Args('startDate', { type: () => String }) startDate: string,
    @Args('endDate', { type: () => String }) endDate: string,
  ): Promise<string> {
    try {
      const pdfBuffer = await this.reportService.generateProjectCostLogReport(
        projectId,
        startDate,
        endDate,
      );
      const pdfBase64 = pdfBuffer.toString('base64');
      return pdfBase64;
    } catch (error) {
      console.error('Error in previewProjectCostLogReport:', error);
      throw new Error('Failed to generate project cost log report');
    }
  }
  @Query(() => String, {
    description: 'Generate Purchasing Report as Base64 PDF',
  })
  async generateReportPurchasing(
    @Args('transactionId', { type: () => String }) transactionId: string,
  ): Promise<string> {
    try {
      // Generate the purchasing report
      const pdfBuffer =
        await this.reportService.generateReportPurchasing(transactionId);

      // Convert the PDF buffer to Base64 and return it
      return pdfBuffer.toString('base64');
    } catch (error) {
      console.error('Error generating purchasing report:', error);
      throw new Error('Failed to generate purchasing report');
    }
  }
}

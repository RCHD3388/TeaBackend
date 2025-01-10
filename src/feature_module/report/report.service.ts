import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { Material, Tool, Sku } from '../inventory/schema/inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectCostLog } from '../project/schema/project.schema';
import { Project } from '../project/schema/project.schema';
import { Employee } from '../person/schema/employee.schema';
import { PurchaseTransaction } from '../purchasing/schema/purchasing.schema';
import { Supplier } from '../person/schema/supplier.schema';
import { Merk } from '../inventory/schema/inventory.schema';
@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Material.name) private readonly materialModel: Model<Material>,
    @InjectModel(Tool.name) private readonly toolModel: Model<Tool>,
    @InjectModel(Sku.name) private readonly skuModel: Model<Sku>,
    @InjectModel(ProjectCostLog.name)
    private readonly projectCostLogModel: Model<ProjectCostLog>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(PurchaseTransaction.name)
    private readonly purchaseTransactionModel: Model<PurchaseTransaction>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<Supplier>,
    
    @InjectModel(Merk.name) private readonly merkModel: Model<Merk>,
  ) {}

  private async getBase64FromUrl(filePath: string): Promise<string> {
    const relativePath = path.join(
      process.cwd(),
      'src',
      'feature_module',
      'report',
      'company_logo.png',
    );
    const fileBuffer = fs.readFileSync(relativePath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }

  async generateReport(attendanceModuleData: string | any): Promise<Buffer> {
    try {
      const attendanceData =
        typeof attendanceModuleData === 'string'
          ? JSON.parse(attendanceModuleData)
          : attendanceModuleData;

      const logoBase64 = await this.getBase64FromUrl('./company_logo.png');
      const templatePath = path.join(
        process.cwd(),
        'src',
        'feature_module',
        'report',
        'reportTemplate.html',
      );

      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // Extract data from the attendance module
      const { start_date, end_date, attendance, total_employees } =
        attendanceData;

      // Generate date headers
      const dates = this.getDatesInRange(
        new Date(start_date),
        new Date(end_date),
      );
      const dateHeaders = dates
        .map(
          (date) =>
            `<th colspan="2" class="p-3 text-center font-semibold text-gray-700">${date.toLocaleDateString(
              'id-ID',
              { weekday: 'short', day: 'numeric', month: 'short' },
            )}</th>`,
        )
        .join('');

      // Generate check-in/check-out headers
      const checkHeaders = dates
        .map(
          () =>
            `<th class="p-3 text-center text-xs font-medium text-gray-500">In</th>
             <th class="p-3 text-center text-xs font-medium text-gray-500">Out</th>`,
        )
        .join('');

      // Generate table rows
      const tableRows = attendance
        .reduce((acc: any[], day: any) => {
          day.attendance_detail.forEach((detail: any) => {
            const existing = acc.find(
              (row) => row.employeeId === detail.employee._id,
            );
            const checkInOut = {
              date: new Date(day.date).toDateString(),
              check_in: detail.check_in,
              check_out: detail.check_out,
            };

            if (existing) {
              existing.attendance.push(checkInOut);
            } else {
              acc.push({
                employeeId: detail.employee._id,
                employeeName: detail.employee.person.name,
                attendance: [checkInOut],
              });
            }
          });
          return acc;
        }, [])
        .map((row) => {
          const attendanceCells = dates
            .map((date) => {
              const record = row.attendance.find(
                (att) =>
                  new Date(att.date).toDateString() === date.toDateString(),
              );
              return record
                ? `<td class="p-3 text-center">${
                    record.check_in
                      ? '<span class="text-green-500">V</span>'
                      : '<span class="text-red-500">X</span>'
                  }</td>
               <td class="p-3 text-center">${
                 record.check_out
                   ? '<span class="text-green-500">V</span>'
                   : '<span class="text-red-500">X</span>'
               }</td>`
                : `<td class="p-3 text-center">-</td><td class="p-3 text-center">-</td>`;
            })
            .join('');

          const totalDays = row.attendance.filter(
            (att) => att.check_in && att.check_out,
          ).length;

          return `<tr class="hover:bg-gray-50 transition-colors">
                <td class="p-3 font-medium text-gray-900">${row.employeeName}</td>
                ${attendanceCells}
                <td class="p-3 text-center font-bold bg-blue-50">
                  <span class="text-blue-800">${totalDays}/${dates.length}</span>
                </td>
              </tr>`;
        })
        .join('');

      // Generate salary rows
      let totalWeeklySalary = 0; // Initialize total weekly salary

      const salaryRows = attendance
        .reduce((acc: any[], day: any) => {
          day.attendance_detail.forEach((detail: any) => {
            const existing = acc.find(
              (row) => row.employeeId === detail.employee._id,
            );

            if (existing) {
              // If both check_in and check_out are false or null, increment `completeAbsence`
              if (!detail.check_in && !detail.check_out) {
                existing.completeAbsence += 1;
              }
              // If both check_in and check_out are true, increment `completeCheckInOuts`
              else if (detail.check_in && detail.check_out) {
                existing.completeCheckInOuts += 1;
              }
              // If only check_out is missing, increment `missingCheckOuts`
              else if (!detail.check_out && detail.check_in) {
                existing.missingCheckOuts += 1;
              }
            } else {
              // Add a new employee entry with initialized counters
              acc.push({
                employeeId: detail.employee._id,
                employeeName: detail.employee.person.name,
                dailySalary: detail.employee.salary,
                completeCheckInOuts:
                  detail.check_in && detail.check_out ? 1 : 0,
                completeAbsence: !detail.check_in && !detail.check_out ? 1 : 0,
                missingCheckOuts: 0,
              });
            }
          });
          return acc;
        }, [])
        .map((row) => {
          // Calculate the weekly earnings based on the complete check-ins and check-outs
          const weeklyEarnings = row.dailySalary * row.completeCheckInOuts;
          totalWeeklySalary += weeklyEarnings; // Accumulate the total weekly salary

          return `<tr class="hover:bg-gray-50 transition-colors">
      <td class="p-3 font-medium text-gray-900">${row.employeeName}</td>
      <td class="p-3 text-right">${row.dailySalary.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      })}</td>
      <td class="p-3 text-right">${row.completeCheckInOuts}</td>
      <td class="p-3 text-right">${row.completeAbsence}</td>
      <td class="p-3 text-right">${row.missingCheckOuts}</td>
      <td class="p-3 text-right font-bold bg-blue-50">
        ${weeklyEarnings.toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
        })}
      </td>
    </tr>`;
        })
        .join('');
      // Replace placeholders in the template
      htmlTemplate = htmlTemplate
        .replace(
          '{{start_date}}',
          new Date(start_date).toLocaleDateString('id-ID'),
        )
        .replace('{{end_date}}', new Date(end_date).toLocaleDateString('id-ID'))
        .replace('{{total_employees}}', total_employees.toString())
        .replace('{{dateHeaders}}', dateHeaders)
        .replace('{{checkHeaders}}', checkHeaders)
        .replace('{{tableRows}}', tableRows)
        .replace('{{salaryRows}}', salaryRows)
        .replace(
          '{{totalWeeklySalary}}',
          totalWeeklySalary.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }),
        )
        .replace('./company_logo.png', logoBase64);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(htmlTemplate, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async previewReport(attendanceModuleData: string | any): Promise<string> {
    try {
      const attendanceData =
        typeof attendanceModuleData === 'string'
          ? JSON.parse(attendanceModuleData)
          : attendanceModuleData;

      // Generate PDF buffer
      const pdfBuffer = await this.generateReport(attendanceData);

      // Convert PDF buffer to Base64
      const base64PDF = pdfBuffer.toString('base64');

      // Return Base64 string
      return base64PDF;
    } catch (error) {
      console.error('Error previewing report:', error);
      throw error;
    }
  }

  private getDatesInRange(start: Date, end: Date): Date[] {
    const dates = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
  async generateReportPurchaseOrder(
    PurchaseOrderData: string | any,
  ): Promise<Buffer> {
    try {
      // Parse the PurchaseOrderData if it's a string
      const purchaseData =
        typeof PurchaseOrderData === 'string'
          ? JSON.parse(PurchaseOrderData)
          : PurchaseOrderData;

      // Load logo as Base64
      const logoBase64 = await this.getBase64FromUrl('./company_logo.png');

      // Path to the HTML template
      const templatePath = path.join(
        process.cwd(),
        'src',
        'feature_module',
        'report',
        'purchaseOrderTemplate.html',
      );

      // Read the HTML template
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // Extract data from purchaseData
      const {
        _id,
        title,
        description,
        date,
        status,
        requested_from,
        requested_by,
        purchase_order_detail,
        documentNumber,
      } = purchaseData;

      // Prepare Material and Tool rows
      const fetchMaterialsWithDetails = async () => {
        try {
          const materials = await this.materialModel
            .find({
              _id: { $in: purchase_order_detail.map((item) => item.item) },
            })
            .populate('merk')
            .populate('unit_measure')
            .populate('minimum_unit_measure')
            .lean();

          // Create a map for quick lookup
          const materialMap = new Map(
            materials.map((m) => [m._id.toString(), m]),
          );
          return materialMap;
        } catch (error) {
          console.error('Error fetching materials with details:', error);
          throw error;
        }
      };

      const materialMap = await fetchMaterialsWithDetails();

      const materialRows = purchase_order_detail
        .filter((item: any) => item.item_type === 'Material')
        .map((item: any, index: number) => {
          const material = materialMap.get(item.item.toString()) as any;
          return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="p text-center">${index + 1}</td>
          <td class="p">${material?.name || 'Unknown Material'}</td>
          <td class="p">${material?.merk?.name || '-'}</td>
          <td class="p text-center">${item.quantity}</td>
          <td class="p text-center">${material?.unit_measure?.name || '-'}</td>
          <td class="p text-center">${material?.conversion || '-'}</td>
          <td class="p text-center">${material?.minimum_unit_measure?.name || '-'}</td>
          <td class="p text-center">${item.completed_quantity}</td>
          <td class="p text-right">${item.completed_quantity}</td>
        </tr>`;
        })
        .join('');

      const fetchToolsWithDetails = async (purchaseOrderDetails: any[]) => {
        try {
          // Extract tool IDs from the purchase order details
          const toolIds = purchaseOrderDetails
            .filter((item) => item.item_type === 'Tool') // Filter items of type 'Tool'
            .map((item) => item.item); // Extract the `item` field (tool ID)

          // Fetch tools from the database with populated fields
          const sku = await this.skuModel.find({ _id: { $in: toolIds } });
          const skuMap = new Map(
            sku.map((tool) => [tool._id.toString(), tool]),
          );
          // Create a map for quick lookup by tool ID
          return skuMap;
        } catch (error) {
          console.error('Error fetching tools with details:', error);
          throw error; // Re-throw the error to be handled by the caller
        }
      };

      const toolMap = await fetchToolsWithDetails(purchase_order_detail);
      const toolRows = purchase_order_detail
        .filter((item: any) => item.item_type === 'Tool')
        .map((item: any, index: number) => {
          const tool = toolMap.get(item.item.toString()); // Retrieve tool using `item.item`
          return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 text-center">${index + 1}</td>
        <td class="p-3">${tool?.name || '-'}</td>
        <td class="p-3 text-right">${item.quantity}</td>
        <td class="p-3 text-right">${item.completed_quantity}</td>
      </tr>`;
        })
        .join('');

      // Replace placeholders in the HTML template
      htmlTemplate = htmlTemplate
        .replace('{{documentNumber}}', documentNumber)
        .replace('{{title}}', title)
        .replace('{{description}}', description)
        .replace(
          '{{date}}',
          new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        )
        .replace('{{status}}', status)
        .replace('{{warehouseName}}', requested_from.name)
        .replace('{{warehouseAddress}}', requested_from.address)
        .replace('{{requestedByName}}', requested_by.person.name)
        .replace('{{requestedByEmail}}', requested_by.person.email)
        .replace('{{requestedByPhone}}', requested_by.person.phone_number)
        .replace('{{materialRows}}', materialRows)
        .replace('{{toolRows}}', toolRows)
        .replace('{{currentDate}}', new Date().toLocaleDateString('id-ID'))
        .replace('./company_logo.png', logoBase64);

      // Generate PDF with Puppeteer
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(htmlTemplate, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating purchase order report:', error);
      throw error;
    }
  }
  async generateProjectCostLogReport(
    projectId: string,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    try {
      // Fetch logs and project data
      const logs = await this.projectCostLogModel
        .find({
          project: projectId,
          updatedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        })
        .lean();

      const project = await this.projectModel.findById(projectId).lean();
      const projectTitle = project.name;

      // Fetch employee data
      const employeeIds = logs
        .map((log) => log.created_by)
        .filter((id, index, self) => id && self.indexOf(id) === index); // Remove duplicates

      const employees = await this.employeeModel
        .find({ _id: { $in: employeeIds } })
        .lean();

      const employeeMap = employees.reduce(
        (map, employee) => {
          map[employee._id.toString()] = employee.person.name;
          return map;
        },
        {} as Record<string, string>,
      );

      // Path to the HTML template
      const templatePath = path.join(
        process.cwd(),
        'src',
        'feature_module',
        'report',
        'purchaseCostLog.html',
      );
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // Calculate metrics
      const totalPrice = logs.reduce(
        (sum, log) => sum + (log.price as number),
        0,
      );
      const totalTransactions = logs.length;

      // Generate table rows
      const transactionRows = logs
        .map(
          (log, index) => `
    <tr>
      <td class="p-3">${index + 1}</td>
      <td class="p-3">${log.title}</td>
      <td class="p-3">${new Date(log.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}</td>
      <td class="p-3">${
        employeeMap[log.created_by.toString()] || 'Unknown'
      }</td>
      <td class="p-3 text-right">Rp ${(log.price as number).toLocaleString(
        'id-ID',
      )}</td>
    </tr>
  `,
        )
        .join('');

      const logoBase64 = await this.getBase64FromUrl('./company_logo.png');
      // Replace placeholders in the HTML template
      htmlTemplate = htmlTemplate
        .replace('{{projectTitle}}', projectTitle)
        .replace('{{reportPeriod}}', `${startDate} - ${endDate}`)
        .replace('{{printedDate}}', new Date().toLocaleDateString('id-ID'))
        .replace('{{totalPrice}}', `Rp ${totalPrice.toLocaleString('id-ID')}`)
        .replace('{{totalTransactions}}', totalTransactions.toString())
        .replace('./company_logo.png', logoBase64)
        .replace('{{transactionRows}}', transactionRows);

      // Generate PDF
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(htmlTemplate, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
  async generateReportPurchasing(transactionId: string): Promise<Buffer> {
    try {
      // Fetch transaction and supplier data
      const transaction = await this.purchaseTransactionModel
  .findById(transactionId)
  .populate('supplier')
  .populate({
    path: 'purchase_transaction_detail.item',
    model: 'Material',
    populate: { path: 'merk', model: 'Merk' },
  })
  
  .populate('purchasing_staff')
  .lean();


      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const { supplier, purchase_transaction_detail, purchasing_staff } =
        transaction;

      // Separate materials and tools
      const materials = purchase_transaction_detail.filter(
        (detail) => detail.item_type === 'Material',
      );
      const transaction2 = await this.purchaseTransactionModel
        .findById(transactionId)
        .populate({
          path: 'purchase_transaction_detail.original_item',
          model: 'Tool', // Populate original_item as Tool// Include merk if applicable
        })
        .lean();
       
      const tools = transaction2.purchase_transaction_detail.filter(
        (detail) => detail.item_type === 'Tool',
      );
      console.log(transaction2.purchase_transaction_detail);  
      const sku = await this.skuModel.find({ _id: { $in: tools.map((tool) => tool.item) } });
    
      const toolsWithSku = tools.map((tool) => {
        const matchingSku = sku.find((s) => s._id.toString() === tool.item.toString());
        return {
          ...tool,
          sku: matchingSku || null, // Attach SKU or null if not found
        };
      });
      
      console.log('Tools with SKU:', toolsWithSku);
      const groupedTools = toolsWithSku.reduce((acc, tool) => {
        const skuId = tool.sku?._id.toString();
        if (!skuId) return acc; // Skip tools without SKU
      
        if (!acc[skuId]) {
          acc[skuId] = {
            id: tool.original_item,
            sku: tool.sku,
            quantity: 0,
            subtotal: 0,
            price: tool.price, // Assuming price remains constant for tools with the same SKU
          };
        }
      
        acc[skuId].quantity += tool.quantity;
        acc[skuId].subtotal += tool.subtotal;
      
        return acc;
      }, {});
      
      // Convert grouped tools to an array
      const groupedToolsArray = Object.values(groupedTools);
      
      console.log('Grouped Tools by SKU:', tools);
      // Calculate totals
      const materialTotal = materials.reduce(
        (sum, mat) => sum + mat.subtotal,
        0,
      );
      const toolTotal = tools.reduce((sum, tool) => sum + tool.subtotal, 0);

      const grandTotal = materialTotal + toolTotal;

      // Path to the HTML template
      const templatePath = path.join(
        process.cwd(),
        'src',
        'feature_module',
        'report',
        'purchasing.html',
      );
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      const logoBase64 = await this.getBase64FromUrl('./company_logo.png');

      // Replace placeholders in the HTML template
      htmlTemplate = htmlTemplate
        .replace('{{companyName}}', 'Nama Perusahaan')
        .replace('{{transaction_number}}', transaction.transaction_number)
        .replace(
          '{{transaction_date}}',
          new Date(transaction.transaction_date).toLocaleDateString('id-ID'),
        )
        .replace(
          '{{transaction_time}}',
          new Date(transaction.transaction_date).toLocaleTimeString('id-ID'),
        )
        .replace('{{supplier_name}}', supplier['name'])
        .replace('{{supplier_contact}}', supplier['person']['name'])
        .replace('{{supplier_email}}', supplier['person']['email'])
        .replace('{{supplier_phone}}', supplier['person']['phone_number'])
        .replace('{{supplier_address}}', supplier['person']['address'])
        .replace('{{staff_name}}', purchasing_staff['person']['name'])
        .replace('{{staff_role}}', 'Staff Purchasing')
        .replace('{{staff_email}}', purchasing_staff['person']['email'])
        .replace('{{staff_phone}}', purchasing_staff['person']['phone_number'])
        .replace('{{material_total}}', materialTotal.toLocaleString('id-ID'))
        .replace('{{tool_total}}', toolTotal.toLocaleString('id-ID'))
        .replace('{{grand_total}}', grandTotal.toLocaleString('id-ID'))
        .replace('./company_logo.png', logoBase64)
        .replace(
          '{{materials}}',
          materials
            .map(
              (mat) => `
          <tr>
             <td class="border border-green-100 px-4 py-2 text-sm">${mat.item['name']}</td>
            <td class="border border-green-100 px-4 py-2 text-sm">${mat.item['id']}</td>
            <td class="border border-green-100 px-4 py-2 text-sm">${mat.item['merk'].name}</td>
            
            <td class="border border-green-100 px-4 py-2 text-right text-sm">${mat.quantity}</td>
            <td class="border border-green-100 px-4 py-2 text-right text-sm">Rp ${mat.price.toLocaleString('id-ID')}</td>
            <td class="border border-green-100 px-4 py-2 text-right text-sm">Rp ${mat.subtotal.toLocaleString('id-ID')}</td>
          </tr>`,
            )
            .join(''),
        )
        .replace(
          '{{tools}}',
          groupedToolsArray
            .map(
              (tool) => `
          <tr>
            
            <td class="border border-green-100 px-4 py-2 text-right text-sm">halo</td>
              
          </tr>`,
            )
            .join(''),
        );

      // Generate PDF
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(htmlTemplate, {
        waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating purchasing report:', error);
      throw error;
    }
  }
}

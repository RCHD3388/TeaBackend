// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { htmlToText } from 'html-to-text';

@Injectable()
export class MailerService {
  private from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = `DHome <${this.configService.get('EMAIL_FROM')}>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      auth: {
        user: this.configService.get('EMAIL_USERNAME'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  private async send(to: string, name: string, template: string, subject: string) {
    const templatePath = `${__dirname}/../../../templates/mail/${template}.ejs`;
    const templateFile = fs.readFileSync(templatePath, 'utf8');
    const htmlContent = ejs.render(templateFile, {
      user_name: name,
    });

    const mailOptions = {
      from: this.from,
      to,
      subject,
      text: htmlToText(htmlContent),
      html: htmlContent,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendCompanyEmail(to: string, name: string) {
    await this.send(to, name, 'welcomeMail', 'Selamat Datang & Menggunakan Aplikasi Dream Home');
  }

  async sendPasswordResetEmail(to: string, name: string) {
    await this.send(to, name, 'passwordResetMail', 'Anda Telah Berhasil Memperbarui Password Anda');
  }
}

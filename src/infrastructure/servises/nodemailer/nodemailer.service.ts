import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';

@Injectable()
export class NodeMailer {
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    const apiSettings = configService.get('apiSettings', { infer: true });

    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: apiSettings.EMAIL_USER,
        pass: apiSettings.EMAIL_PASS,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const apiSettings = this.configService.get('apiSettings', { infer: true });

    const mailOptions = {
      from: `"Nikita" <${apiSettings.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(error);
        } else {
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          resolve();
        }
      });
    });
  }
}

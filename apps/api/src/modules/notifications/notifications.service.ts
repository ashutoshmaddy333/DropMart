import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { MailService } from "../mail/mail.service";

export type NotificationType =
  | "supplier_registered"
  | "product_submitted"
  | "product_approved"
  | "product_rejected"
  | "order_confirmed"
  | "payment_failed"
  | "order_update";

export interface NotifyAdminsInput {
  type: "supplier_registered" | "product_submitted" | "order_placed";
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async notifyAdmins(input: NotifyAdminsInput) {
    const admins = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { code: { in: ["admin", "superadmin"] } },
      },
      select: { id: true, email: true, name: true },
    });

    if (!admins.length) return [];

    const notifications = await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: input.type,
            title: input.title,
            message: input.message,
            link: input.link,
            metadata: (input.metadata ?? undefined) as object | undefined,
          },
        }),
      ),
    );

    const adminEmails = admins.map((a) => a.email);
    const extraNotify = process.env.ADMIN_NOTIFY_EMAIL;
    const allRecipients = extraNotify
      ? [...new Set([...adminEmails, ...extraNotify.split(",").map((e) => e.trim())])]
      : adminEmails;

    const emailSent = await this.mail.send({
      to: allRecipients,
      subject: input.emailSubject,
      html: input.emailHtml,
      text: input.emailText,
    });

    if (emailSent) {
      await this.prisma.notification.updateMany({
        where: { id: { in: notifications.map((n) => n.id) } },
        data: { emailSent: true },
      });
    }

    return notifications;
  }

  async notifyUser(input: {
    userId: string;
    email: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
    emailSubject: string;
    emailHtml: string;
    emailText: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: (input.metadata ?? undefined) as object | undefined,
      },
    });

    const emailSent = await this.mail.send({
      to: input.email,
      subject: input.emailSubject,
      html: input.emailHtml,
      text: input.emailText,
    });

    if (emailSent) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true },
      });
    }

    return notification;
  }

  async getForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

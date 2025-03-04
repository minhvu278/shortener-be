// links.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Between, Repository, Not, IsNull } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { User } from 'src/users/entities/user.entity';

interface CreateQrCodeDto {
  originalUrl: string;
  title?: string;
  createShortLink?: boolean;
}

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly configService: ConfigService,
  ) {}

  // Định nghĩa giới hạn cho từng gói
  private getPlanLimits(plan: string): { linkLimit: number; qrCodeLimit: number } {
    switch (plan) {
      case 'free':
        return { linkLimit: 5, qrCodeLimit: 1 }; // Giới hạn cho gói Free
      case 'basic': // Core
        return { linkLimit: 100, qrCodeLimit: 5 };
      case 'growth':
        return { linkLimit: 500, qrCodeLimit: 10 };
      case 'premium':
        return { linkLimit: 3000, qrCodeLimit: 200 };
      case 'enterprise':
        return { linkLimit: Infinity, qrCodeLimit: Infinity };
      default:
        return { linkLimit: 5, qrCodeLimit: 1 }; // Mặc định là gói Free
    }
  }

  async getRemainingLinks(user: User): Promise<{ remainingLinks: number; remainingQrCodes: number; totalCreatedLinks: number; totalCreatedQrCodes: number; linkLimit: number; qrCodeLimit: number }> {
    const { linkLimit, qrCodeLimit } = this.getPlanLimits(user.plan);
    console.log(`User ${user.id} plan: ${user.plan}, Link Limit: ${linkLimit}, QR Code Limit: ${qrCodeLimit}`);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Đếm số link đã tạo trong tháng
    const totalCreatedLinks = await this.linkRepository.count({
      where: {
        user: { id: user.id },
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    // Đếm số QR code đã tạo trong tháng (link có qrCode không null)
    const totalCreatedQrCodes = await this.linkRepository.count({
      where: {
        user: { id: user.id },
        qrCode: Not(IsNull()),
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    const remainingLinks = Math.max(0, linkLimit - totalCreatedLinks);
    const remainingQrCodes = Math.max(0, qrCodeLimit - totalCreatedQrCodes);

    console.log(`User ${user.id}: Total Links: ${totalCreatedLinks}/${linkLimit}, Total QR Codes: ${totalCreatedQrCodes}/${qrCodeLimit}`);
    return { remainingLinks, remainingQrCodes, totalCreatedLinks, totalCreatedQrCodes, linkLimit, qrCodeLimit };
  }

  private async checkMonthlyLinkLimit(user: User, isQrCode: boolean = false): Promise<void> {
    const { linkLimit, qrCodeLimit } = this.getPlanLimits(user.plan);
    console.log(`Checking limits for user ${user.id}, plan: ${user.plan}`);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    if (isQrCode) {
      const qrCodeCount = await this.linkRepository.count({
        where: {
          user: { id: user.id },
          qrCode: Not(IsNull()),
          createdAt: Between(startOfMonth, endOfMonth),
        },
      });
      if (qrCodeCount >= qrCodeLimit) {
        throw new BadRequestException(`Bạn đã đạt giới hạn ${qrCodeLimit} QR Code trong tháng này. Vui lòng nâng cấp gói để tạo thêm.`);
      }
    }

    const linkCount = await this.linkRepository.count({
      where: {
        user: { id: user.id },
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    if (linkCount >= linkLimit) {
      throw new BadRequestException(`Bạn đã đạt giới hạn ${linkLimit} link trong tháng này. Vui lòng nâng cấp gói để tạo thêm.`);
    }
  }

  async createShortLink(createLinkDto: CreateLinkDto, user: User): Promise<{ shortUrl: string; qrCode?: string }> {
    // Kiểm tra giới hạn (nếu có QR code thì kiểm tra cả QR code limit)
    const isQrCode = createLinkDto.generateQrCode || false;
    await this.checkMonthlyLinkLimit(user, isQrCode);

    let shortCode = createLinkDto.slug || crypto.randomUUID().replace(/-/g, '').slice(0, 6);

    if (createLinkDto.slug) {
      const existingSlug = await this.linkRepository.findOne({ where: { slug: createLinkDto.slug } });
      if (existingSlug) {
        throw new BadRequestException({
          message: 'Slug đã tồn tại',
          errors: { slug: 'Slug đã tồn tại' },
        });
      }
    }

    let passwordHash: string | undefined;
    if (createLinkDto.password) {
      passwordHash = await bcrypt.hash(createLinkDto.password, 10);
    }

    const qrCodeData = createLinkDto.generateQrCode
      ? await QRCode.toDataURL(`${this.configService.get<string>('APP_URL')}/${shortCode}`)
      : undefined;

    const newLink = this.linkRepository.create({
      originalUrl: createLinkDto.originalUrl,
      shortCode,
      slug: createLinkDto.slug,
      password: passwordHash,
      expiresAt: createLinkDto.expiresAt ? new Date(createLinkDto.expiresAt) : null,
      qrCode: qrCodeData || undefined,
      title: createLinkDto.title,
      user,
    });

    await this.linkRepository.save(newLink);

    return { shortUrl: `${this.configService.get<string>('APP_URL')}/${shortCode}`, qrCode: qrCodeData };
  }

  async createQrCode(createQrCodeDto: CreateQrCodeDto, user: User): Promise<{ qrCode: string; shortUrl?: string }> {
    // Kiểm tra giới hạn (luôn kiểm tra QR code limit vì hàm này tạo QR code)
    await this.checkMonthlyLinkLimit(user, true);

    let shortCode: string | undefined;
    let qrCodeData: string;

    if (createQrCodeDto.createShortLink) {
      shortCode = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
      qrCodeData = await QRCode.toDataURL(`${this.configService.get<string>('APP_URL')}/${shortCode}`);
    } else {
      qrCodeData = await QRCode.toDataURL(createQrCodeDto.originalUrl);
    }

    const newLink = this.linkRepository.create({
      originalUrl: createQrCodeDto.originalUrl,
      shortCode: shortCode || crypto.randomUUID().replace(/-/g, '').slice(0, 6),
      title: createQrCodeDto.title,
      qrCode: qrCodeData,
      user,
    });

    await this.linkRepository.save(newLink);

    return {
      qrCode: qrCodeData,
      shortUrl: shortCode ? `${this.configService.get<string>('APP_URL')}/${shortCode}` : undefined,
    };
  }

  async getOriginalUrl(
    shortCode: string,
    password?: string,
  ): Promise<{ requiresPassword?: boolean; originalUrl?: string; message?: string }> {
    const link = await this.linkRepository.findOne({ where: [{ shortCode }, { slug: shortCode }] });

    if (!link) {
      return { message: "Link không tồn tại hoặc đã hết hạn." };
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return { message: "Link đã hết hạn." };
    }

    if (link.password) {
      if (!password) {
        return { requiresPassword: true, message: "Cần nhập mật khẩu để truy cập link này." };
      }
      if (!(await bcrypt.compare(password, link.password))) {
        return { requiresPassword: true, message: "Mật khẩu không đúng." };
      }
    }

    return { originalUrl: link.originalUrl };
  }

  async getAllLinks(user: User, page: number = 1, limit: number = 10): Promise<{ links: Link[]; total: number }> {
    const skip = (page - 1) * limit;
    const [links, total] = await this.linkRepository.findAndCount({
      where: { user: { id: user.id } },
      select: ['id', 'title', 'originalUrl', 'shortCode', 'slug', 'expiresAt', 'createdAt'],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { links, total };
  }

  async getAllQrCodes(user: User, page: number = 1, limit: number = 10): Promise<{ qrCodes: Link[]; total: number }> {
    const skip = (page - 1) * limit;
    const [qrCodes, total] = await this.linkRepository.findAndCount({
      where: { qrCode: Not(IsNull()), user: { id: user.id } },
      select: ['id', 'title', 'originalUrl', 'shortCode', 'slug', 'expiresAt', 'createdAt', 'qrCode'],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { qrCodes, total };
  }
}

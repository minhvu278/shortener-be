// links.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly configService: ConfigService,
  ) {}

  async getAllLinks(page: number = 1, limit: number = 10): Promise<{ links: Link[]; total: number }> {
    const skip = (page - 1) * limit;
    const [links, total] = await this.linkRepository.findAndCount({
      select: ['id', 'title', 'originalUrl', 'shortCode', 'slug', 'expiresAt', 'createdAt'],
      skip,
      take: limit,
    });
    return { links, total };
  }

  async createShortLink(createLinkDto: CreateLinkDto): Promise<{ shortUrl: string }> {
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
      : null;

    const newLink = this.linkRepository.create({
      originalUrl: createLinkDto.originalUrl,
      shortCode,
      slug: createLinkDto.slug,
      password: passwordHash,
      expiresAt: createLinkDto.expiresAt ? new Date(createLinkDto.expiresAt) : null,
      qrCode: qrCodeData || undefined,
      title: createLinkDto.title, // Lưu title
    });

    await this.linkRepository.save(newLink);

    return { shortUrl: `${this.configService.get<string>('APP_URL')}/${shortCode}` };
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
}
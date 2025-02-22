import { Injectable } from '@nestjs/common';
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
  ) { }

  async createShortLink(createLinkDto: CreateLinkDto): Promise<{ shortUrl: string }> {
    let shortCode = createLinkDto.slug || crypto.randomUUID().replace(/-/g, '').slice(0, 6);

    if (createLinkDto.slug) {
      const existingSlug = await this.linkRepository.findOne({ where: {slug: createLinkDto.slug }})

      if (existingSlug) {
        throw new Error('Slug da ton tai')
      }
    }

    let passwordHash: string | undefined
    if (createLinkDto.password) {
      passwordHash = await bcrypt.hash(createLinkDto.password, 10)
    }

    const qrCodeData = await QRCode.toDataURL(`${this.configService.get<string>('APP_URL')}/${shortCode}`);

    const newLink = this.linkRepository.create({
      originalUrl: createLinkDto.originalUrl,
      shortCode,
      slug: createLinkDto.slug,
      password: passwordHash,
      expiresAt: createLinkDto.expiresAt ? new Date(createLinkDto.expiresAt) : null,
      qrCode: qrCodeData,
    });

    await this.linkRepository.save(newLink);

    return { shortUrl: `${this.configService.get<string>('APP_URL')}/${shortCode}` }
  }


  async getOriginalUrl(shortCode: string, password?: string): Promise<string | null> {
    const link = await this.linkRepository.findOne({ where: [{ shortCode }, {slug: shortCode}] });

    if (!link) return null

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new Error ('This link has expired')
    }

    if (link.password) {
      if (!password || !(await bcrypt.compare(password, link.password))) {
        throw new Error('Invalid Password')
      }
    }

    return link.originalUrl;
  }
}

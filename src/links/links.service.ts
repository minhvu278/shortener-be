import { ConflictException, GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import { CreateLinkDto } from './dto/create-link.dto';

@Injectable()
export class LinksService {
  private readonly SALT_ROUNDS = 10;
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly configService: ConfigService,
  ) {}

  async createShortLink(createLinkDto: CreateLinkDto): Promise<{ shortUrl: string; qrCodeUrl: string }> {
    const { originalUrl, customSlug, password, expiresAt } = createLinkDto;

    const shortCode = customSlug || crypto.randomUUID().replace(/-/g, '').slice(0, 6);

    if (customSlug) {
      const existingLink = await this.linkRepository.findOne({ where: { customSlug } });
      if (existingLink) {
        throw new ConflictException('Slug đã tồn tại')
      }
    }

    let passwordHash: string | null = null;
    if(password) {
      passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS)
    }
    const appUrl = this.configService.get<string>('APP_URL');
    const shortUrl = `${appUrl}/${shortCode}`;
    const qrCodeUrl = await QRCode.toDataURL(shortUrl)


    const newLink = this.linkRepository.create({ originalUrl, shortCode, password, expiresAt, qrCodeUrl });
    await this.linkRepository.save(newLink);
    
    return { shortUrl, qrCodeUrl };
}


  async getOriginalUrl(shortCode: string, password?: string): Promise<string | null> {
    const link = await this.linkRepository.findOne({ where: {shortCode} });

    if(!link) {
      throw new NotFoundException('Link không tồn tại')
    }

    if(link.expiresAt && link.expiresAt < new Date()) {
      throw new GoneException('Link da het han')
    }

    if(link.password) {
      if (!password) {
        throw new UnauthorizedException('Link này yêu cầu mật khẩu');
      }
      const isMatch = await bcrypt.compare(password, link.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }
    }
    
    return link.originalUrl;
  }
}

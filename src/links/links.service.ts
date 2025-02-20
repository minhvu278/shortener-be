import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  async createShortLink(originalUrl: string): Promise<{ shortUrl: string }> {
    const shortCode = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
    const newLink = this.linkRepository.create({ originalUrl, shortCode });
    await this.linkRepository.save(newLink);
    return { shortUrl: `http://localhost:3000/${shortCode}` };
}


  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const link = await this.linkRepository.findOne({ where: {shortCode} });
    
    return link ? link.originalUrl : null;
  }
}

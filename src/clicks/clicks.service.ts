import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Click } from './entities/click.entity';
import { Repository } from 'typeorm';
import { Link } from 'src/links/entities/link.entity';

@Injectable()
export class ClicksService {
  constructor(
    @InjectRepository(Click)
    private readonly clickRepository: Repository<Click>,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>
  ) {}

  async trackClick(shortCode: string, ip: string, userAgent: string): Promise<void> {
    const link = await this.linkRepository.findOne({ where: {shortCode} })
    if (!link) return

    const newClick = this.clickRepository.create({ link, ipAdress: ip, userAgent})
    await this.clickRepository.save(newClick)
  }

  async getClickByShortCode(shortCode: string) {
    return this.clickRepository.find({
      where: {link: {shortCode}},
      relations: ['link']
    })
  }
}

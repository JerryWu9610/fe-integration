import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { Gitlab } from '@gitbeaker/rest';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly CACHE_TTL = 3600; // 1 hour cache

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateToken(token: string): Promise<any> {
    const cacheKey = `auth_user_${token}`;
    
    // Try to get from cache first
    const cachedUser = await this.cacheManager.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    try {
      const gitlabHost = this.configService.get<string>('gitlab.auth.gitlabHost');
      const gitlab = new Gitlab({
        host: gitlabHost,
        token,
      });
      const userData = gitlab.Users.showCurrentUser();
      
      // Cache the user data
      await this.cacheManager.set(cacheKey, userData, this.CACHE_TTL);
      
      return userData;
    } catch (error) {
      this.logger.error(`Failed to validate token: ${error.message}`);
      throw new Error('Invalid token');
    }
  }
} 
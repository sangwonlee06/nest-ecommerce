import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import * as bcrypt from 'bcryptjs';
import { Cache } from 'cache-manager';
import { MinioClientService } from '../minio-client/minio-client.service';
import { exBufferedFile } from '../minio-client/file.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly minioClientService: MinioClientService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user) return user;
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) return user;
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async storeRefreshTokenInRedis(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.cacheManager.set(userId, hashedRefreshToken);
  }

  async removeRefreshTokenFromRedis(userId: string) {
    await this.cacheManager.del(userId);
  }

  async validateUserRefreshToken(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);
    const storedRefreshTokenHash = await this.cacheManager.get(userId);
    const isTokenValid = await bcrypt.compare(
      refreshToken,
      storedRefreshTokenHash,
    );
    if (isTokenValid) return user;
  }

  async updateProfileImage(userId: string, profileImg: exBufferedFile) {
    const uploaded_image = await this.minioClientService.uploadProfileImage(
      userId,
      profileImg,
    );
    return await this.userRepository.update(
      { id: userId },
      { profileImg: `${uploaded_image.url}` },
    );
  }

  // async changePassword(userId: string, newPassword: string): Promise<void> {
  //   await this.userRepository.update(userId, { password: newPassword });
  // }

  async changePassword(email: string, password: string) {
    const saltValue = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, saltValue);
    return await this.userRepository.update(
      { email },
      { password: newPassword },
    );
  }
}

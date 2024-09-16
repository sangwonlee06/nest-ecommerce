import { BaseEntity } from '../../common/base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as gravatar from 'gravatar';
import { AuthProvider } from './auth-provider.enum';
import { Role } from './role.enum';

@Entity()
export class User extends BaseEntity {
  @Column()
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: true })
  public password?: string;

  @Column({ nullable: true })
  public profileImg?: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  public authProvider: AuthProvider;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.USER],
  })
  public roles: Role[];

  @BeforeInsert()
  async prepareUserForSave(): Promise<void> {
    // If the user's authProvider isn't LOCAL, skip profile image generation and password encryption
    if (this.authProvider !== AuthProvider.LOCAL) {
      return;
    }
    // Auto-generate profile image
    this.profileImg = gravatar.url(this.email, {
      s: '200',
      r: 'pg',
      d: 'mm',
      protocol: 'https',
    });

    // Password encryption
    const saltValue = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, saltValue);
  }
}

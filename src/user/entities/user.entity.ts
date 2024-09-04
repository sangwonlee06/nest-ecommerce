import { BaseEntity } from '../../common/base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as gravatar from 'gravatar';

@Entity()
export class User extends BaseEntity {
  @Column()
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @Column({ nullable: true })
  public profileImg?: string;

  @BeforeInsert()
  async hashPasswordAndSetProfileImg(): Promise<void> {
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

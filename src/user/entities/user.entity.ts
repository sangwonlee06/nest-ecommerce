import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';
@Entity()
export class User extends BaseEntity {
  @Column()
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;
}

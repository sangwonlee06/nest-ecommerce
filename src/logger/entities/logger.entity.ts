import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';
@Entity()
export class Logger extends BaseEntity {
  @Column()
  public context: string;

  @Column()
  public message: string;

  @Column()
  public level: string;
}

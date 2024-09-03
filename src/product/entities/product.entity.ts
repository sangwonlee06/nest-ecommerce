import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  public productName: string;

  @Column()
  public description: string;

  @Column()
  public price: number;

  @Column()
  public category: string;

  @Column({ default: true })
  public isOnSale: boolean;

  @Column()
  public productImage: string;

  @Column()
  public manufacturer: string;
}

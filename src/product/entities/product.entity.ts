import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

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

  @CreateDateColumn()
  public createdAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async getPaginatedProducts(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Product>> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .orderBy('product.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }
  // async findAllProducts(): Promise<Product[]> {
  //   return this.productRepository.find();
  // }

  async findProductById(productId: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  async removeProduct(productId: string): Promise<string> {
    const deleteResult = await this.productRepository.delete({ id: productId });
    if (!deleteResult.affected) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return `Product with ID ${productId} deleted successfully`;
  }

  async updateProduct(
    productId: string,
    updateProductDto: CreateProductDto,
  ): Promise<Product> {
    await this.productRepository.update(productId, updateProductDto);
    const updatedProduct = await this.productRepository.findOneBy({
      id: productId,
    });
    if (!updatedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return updatedProduct;
  }
}

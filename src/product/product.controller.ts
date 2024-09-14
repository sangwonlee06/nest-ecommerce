import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  async findAllProducts() {
    return this.productService.findAllProducts();
  }

  @Get(':id')
  async findProductById(@Param('id') id: string) {
    return this.productService.findProductById(id);
  }

  @Delete(':id')
  async removeProduct(@Param('id') id: string) {
    return this.productService.removeProduct(id);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }
}

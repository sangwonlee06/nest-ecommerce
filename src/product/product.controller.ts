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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiBody({
    type: CreateProductDto,
    description: 'Product details needed to create a new product.',
  })
  @ApiOperation({
    summary: 'Create Product',
    description: 'Creates a new product with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Products',
    description: 'Retrieves a list of all products.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully.',
  })
  async findAllProducts() {
    return this.productService.findAllProducts();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to retrieve.',
    type: String,
  })
  @ApiOperation({
    summary: 'Get Product by ID',
    description: 'Retrieves a specific product by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async findProductById(@Param('id') id: string) {
    return this.productService.findProductById(id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to delete.',
    type: String,
  })
  @ApiOperation({
    summary: 'Delete Product',
    description: 'Deletes a specific product by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async removeProduct(@Param('id') id: string) {
    return this.productService.removeProduct(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the product to update.',
    type: String,
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Updated product details.',
  })
  @ApiOperation({
    summary: 'Update Product',
    description: 'Updates the details of an existing product by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }
}

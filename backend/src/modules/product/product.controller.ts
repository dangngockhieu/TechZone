import { 
  Body, Controller, Delete, Get, Param, Post, Put, Query, 
  Req, Res, UploadedFile, UploadedFiles, UseInterceptors,  
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProductService } from './product.service';
import { Public } from '../../auth/decorater/customize';
import { Roles } from '../../auth/decorater/roles';
import { ProductFilters} from './interface';
import { Request as ExpressRequest } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Cấu hình Multer lưu ảnh
const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join('public', 'products');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
    }
    cb(null, true);
  }
};

// Cấu hình Multer cho Excel
const multerExcelConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join('public', 'temp');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận file Excel!'), false);
    }
    cb(null, true);
  }
};


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  // Lấy sản phẩm với phân trang và lọc
  @Get('products-paginate')
  @Roles('ADMIN')
  async getProductsWithPaginate(@Query() query: any) {
    const { page, limit, keyword, category, factory } = query;

    const {products, total} = await this.productService.getProductsWithPaginate(page, limit, keyword, category, factory);
    return {
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        products: products,
        total: total
      }
    }
  }

  // Lấy sản phẩm theo bộ lọc
  @Post('filter-products')
  @Public()
  async getFilteredProducts(@Req() req: ExpressRequest) {
    const category = req.body.category;
    const filters = req.body.filters as ProductFilters ;
    const {count, products} = await this.productService.getFilterProducts(category, filters);
    return { 
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data:{
        count,
        products
      }
      
     };
  }

  // Lấy danh sách laptop bán chạy
  @Get('top-selling-laptop')
  @Public()
  async getTopSellingLaptop() {
    const data = await this.productService.getTopSellingLaptop();
    return { 
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: data
     };
  }

  // Lấy danh sách điện thoại bán chạy
  @Get('top-selling-phone')
  @Public()
  async getTopSellingPhone() {
    const data = await this.productService.getTopSellingPhone();
    return { 
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: data
     };
  }

  // Lấy sản phẩm bán chạy nhất
  @Get('top-selling-product')
  @Roles('ADMIN')
  async getTopSellingProduct() {
    const data = await this.productService.getTopSellingProduct();
    return { 
      success: true,
      products : data
    };
  }

  // Lấy tất cả sản phẩm
  @Get('all-products')
  async getAllProducts() {
    const products = await this.productService.getAllProducts();
    return { 
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      products: products
     };
  }

  // Lấy chi tiết sản phẩm theo ID
  @Get('products/:id')
  @Public()
  async getProductById(@Param('id') id: string) {
    const data = await this.productService.getProductById(Number(id));
    if (!data.product) throw new BadRequestException('Not found');
    return { 
      success: true,
      message: 'Lấy chi tiết sản phẩm thành công',
      data : data
    };
  }

  // Tạo sản phẩm mới
  @Post('product')
  @Roles('ADMIN') 
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  async createProduct(@Body() body: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    const product = await this.productService.createProduct(body, files);
    return { 
      success: true,
      message: 'Tạo sản phẩm thành công', 
      product: product
    };
  }

  // Import sản phẩm từ file Excel
  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('excel', multerExcelConfig))
  async importProductsFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel!');
    }
    
    try {
      const importedCount = await this.productService.importProducts(file.path);
      
      // Xóa file Excel sau khi import thành công
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return { 
        success: true,
        message: `Import thành công ${importedCount} sản phẩm` 
      };
    } catch (error) {
      // Xóa file ngay cả khi có lỗi
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Cập nhật sản phẩm
  @Put('products/:id')
  @Roles('ADMIN')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const product = await this.productService.updateProduct(Number(id), body);
    return { 
      success: true,
      message: 'Cập nhật thành công', 
      data: {
        product
      }  
    };
  }

  // Xóa sản phẩm
  @Delete('products/:id')
  @Roles('ADMIN')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(Number(id));
    return { 
      success: true,      
      message: 'Xóa sản phẩm thành công' };
  }

  // Thêm features cho sản phẩm
  @Post('product-features/:productID')
  @Roles('ADMIN')
  async addProductFeatures(@Param('productID') productID: string, @Body() body: any) {
    const { featureIDs } = body;
    await this.productService.addProductFeatures(Number(productID), featureIDs);
    return {
      success: true,
      message: 'Thêm đặc điểm sản phẩm thành công'
    };
  }

  // Xóa feature của sản phẩm
  @Delete('product-feature')
  @Roles('ADMIN')
  async deleteProductFeature(@Query() query: any) {
    const { productID, featureID } = query;
    await this.productService.deleteProductFeature(Number(productID), Number(featureID));
    return {
      success: true,
      message: 'Xóa đặc điểm sản phẩm thành công'
    };
  }

  // Thêm nhiều ảnh cho sản phẩm
  @Post('product-images/:productID')
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async addProductImages(
    @Param('productID') productID: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    await this.productService.addProductImages(Number(productID), files);
    return {
      success: true,
      message: 'Thêm ảnh sản phẩm thành công'
    };
  }

  // Xóa ảnh sản phẩm
  @Delete('product-image/:imageId')
  @Roles('ADMIN')
  async deleteProductImage(@Param('imageId') imageId: string) {
    await this.productService.deleteProductImage(Number(imageId));
    return {
      success: true,
      message: 'Xóa ảnh sản phẩm thành công'
    };
  }

  // Tạo đánh giá cho sản phẩm
  @Post('reviews/:productID')
  async createReview(
    @Param('productID') productID: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const userID = req.user.id;
    const { rating, comment, orderItemID } = body;
    
    const review = await this.productService.createReview(
      Number(productID), userID, Number(rating), comment, Number(orderItemID)
    );
    return { 
      success: true,
      message: 'Đánh giá thành công', 
      data: {
        review
      } 
    };
  }
}
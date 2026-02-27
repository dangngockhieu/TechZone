import { Controller, Delete, Get, Patch, Post, Req, Query } from "@nestjs/common";
import { Request } from "express";
import { CartService } from "./cart.service";
@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService
    ) {}

    // Add Product to Cart 
    @Post('cart')
    async addProductToCart(@Req() req : Request) {
        const userID = Number((req.user as any)?.id);
        const productID = Number(req.body.productID);
        await this.cartService.addProductToCart(userID, productID);
        return {
            success: true,
            message: 'Thêm sản phẩm vào giỏ hàng thành công'
        };
    }

    // Number Cart 
    @Get('number-cart')
    async numberCart(@Req() req : Request) {
        const userID = Number((req.user as any)?.id);
        const totalCart = await this.cartService.numberCart(userID);
        return {
            success: true,
            message: 'Lấy số lượng sản phẩm trong giỏ hàng thành công',
            data:{
                totalCart: totalCart || 0
            }
        };
    }

    // Get Cart 
    @Get('cart')
    async getCart(@Req() req : Request) {
        const userID = Number((req.user as any)?.id);
        const cartItems = await this.cartService.getCart(userID);
        return {
            success: true,
            message: 'Lấy thông tin giỏ hàng thành công',
            data:{
                cartItems: cartItems || []
            }
            
        };
    }

    // Update quantity Product from Cart 
    @Patch('cart')
    async updateQuantityCart(@Req() req : Request, @Query() query: any) {
        const userID = Number((req.user as any)?.id);
        const productID = Number(query.productID);
        const newNumber = Number(req.body.newNumber);
        await this.cartService.updateQuantityCart(userID, productID, newNumber);
        return {
            success: true,
            message: 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công'
        };
    }

    // Remove Cart
    @Delete('cart')
    async removeCart(@Req() req : Request, @Query() query: any) {
        const userID = Number((req.user as any)?.id);
        const productID = Number(query.productID);
        await this.cartService.deleteCart(userID, productID);
        return {
            success: true,
            message: 'Xoá sản phẩm khỏi giỏ hàng thành công'
        };
    }

    // Buy Now 
    @Post('buy-now')
    async buyNow(@Req() req : Request) {
        const userID = Number((req.user as any)?.id);
        const productID = Number(req.body.productID);
        await this.cartService.buyNow(userID, productID);
        return {
            success: true,
            message: 'Buy Now thành công'
        };
    }

    // Check Out 
    @Patch('checkout')
    async checkout(@Req() req : Request) {
        const userID = Number((req.user as any)?.id);
        const productID = Number(req.body.productID);
        await this.cartService.checkout(userID, productID);
        return {
            success: true,
            message: 'Thanh toán giỏ hàng thành công'
        };
    }
}
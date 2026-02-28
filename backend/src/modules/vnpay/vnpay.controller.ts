import { Controller, Post, Get, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { CreatePaymentDTO } from './dto';
import { JwtAuthGuard } from '../../auth/guard';
import { Public } from '../../auth/decorater/customize';
import { Request, Response } from 'express';
import { ReturnQueryFromVNPay } from 'vnpay';

@Controller('vnpay')
export class VnpayController {
    constructor(private readonly vnpayService: VnpayService) {}

    // Tạo URL thanh toán VNPay
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createPayment(@Body() body: CreatePaymentDTO, @Req() req: Request) {
        const user = req.user as any;
        const userID = user?.id;
        
        // Lấy IP address
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
        const clientIP = Array.isArray(ipAddr) ? ipAddr[0] : ipAddr.toString().split(',')[0];

        const paymentUrl = await this.vnpayService.createPaymentUrl(
            Number(body.orderID),
            userID,
            clientIP
        );

        return {
            success: true,
            message: 'Tạo URL thanh toán thành công',
            paymentUrl: paymentUrl
        };
    }

    // Return URL - VNPay redirect về sau khi thanh toán
    @Get('return')
    @Public()
    async vnpayReturn(@Query() query: ReturnQueryFromVNPay, @Res() res: Response) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const result = await this.vnpayService.handleReturn(query);

        if (result.success) {
            // Redirect đến trang thành công
            return res.redirect(`${frontendURL}/payment-success?orderID=${result.orderID}`);
        } else {
            // Redirect đến trang đơn hàng
            return res.redirect(`${frontendURL}/orders`);
        }
    }

    // Kiểm tra trạng thái thanh toán
    @Get('status')
    @UseGuards(JwtAuthGuard)
    async checkPaymentStatus(@Query('orderID') orderID: string, @Req() req: Request) {
        const user = req.user as any;
        const userID = user?.id;

        const status = await this.vnpayService.checkPaymentStatus(Number(orderID), userID);

        return {
            success: true,
            message: 'Lấy trạng thái thanh toán thành công',
            data: status,
        };
    }
}
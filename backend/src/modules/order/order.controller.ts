import { Controller, Post, Req, Body, Get, Patch, Delete } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDTO, OrderDTO } from './dto/order.dto';
import { Request } from 'express';
import { Roles } from "../../auth/decorater/roles";
import { Throttle, SkipThrottle} from '@nestjs/throttler';
import { Role } from "../../enums";

@Controller('order')
export class OrderController {
    constructor(
        private readonly orderService: OrderService
    ) {}

    // Tạo đơn hàng
    @Post('order')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    async createOrder(@Req() req: Request, @Body() body: CreateOrderDTO) {
        const { recipientName, address, phone, items, totalPrice, paymentMethod } = body;
        const userID = (req as any).user?.id;
        const orderID = await this.orderService.createOrder(userID, recipientName, address, phone, items, totalPrice, paymentMethod);
        return {
            success: true,
            message: 'Tạo đơn hàng thành công',
            data:{
                orderID: orderID
            }

        };
    }

    // Lấy List Order chờ xử lý
    @Get('orders/pending')
    @Roles(Role.ADMIN)
    async getPendingOrders(@Req() req: Request) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const {orders, pg} = await this.orderService.getPendingOrders(page, limit);
        return {
            success: true,
            message: 'Lấy danh sách đơn hàng chờ xử lý thành công',
            data: {
                orders: orders,
                pg: pg
            }

        };
    }

    @Delete('order')
    @Roles(Role.ADMIN)
    async deleteOrder(@Req() req: Request) {
        const orderID = Number(req.query.orderID);
        await this.orderService.deleteOrder(orderID);
        return {
            success: true,
            message: 'Hủy đơn hàng thành công'
        };
    }

    // Lấy List Order theo status
    @Get('orders')
    @Roles(Role.ADMIN)
    async getListOrders(@Req() req: Request) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = (req.query.status as string) || 'SHIPPING';
        const {orders, pg} = await this.orderService.getOrderforAdmin(page, limit, status);
        return {
            success: true,
            message: 'Lấy danh sách đơn hàng thành công',
            data:{
                orders: orders,
                pg: pg
            }
        };
    }

    // Lấy chi tiết đơn hàng
    @Get('orders-item')
    @Roles(Role.ADMIN)
    async getOrderDetail(@Req() req: Request) {
        const orderID = parseInt(req.query.orderID as string, 10);
        const products = await this.orderService.getOrderItem(orderID);
        return {
            success: true,
            message: 'Lấy chi tiết đơn hàng thành công',
            data:{
                products: products
            }

        };
    }

    // Cập nhật trạng thái đơn hàng
    @Patch('order-to-shipping')
    @SkipThrottle()
    @Roles(Role.ADMIN)
    async updateOrderStatus(@Req() req: Request, @Body() body: any) {
        const orderID = Number(req.query.orderID);
        const { trackingCode, expectedDate } = body;
        await this.orderService.updatePendingtoShipping(orderID, trackingCode,  expectedDate);
        return {
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công'

        };
    }

    // ===================== Cập nhật trạng thái đơn hàng =====================
    @Patch('order')
    async updateOrderforUser(@Req() req: Request) {
        const userID = Number((req as any).user?.id);
        const orderID = Number(req.query.orderID);
        const status = (req.body.status as string);
        await this.orderService.updateOrderforUser(orderID, userID, status);
        return {
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công'
        };
    }
    // ===================== Lấy danh sách đơn hàng của người dùng =====================
    @Get('my-orders')
    async getUserOrders(@Req() req: Request) {
        const userID = (req as any).user?.id;
        const status = (req.query.status as string) || 'PENDING';
        const orders = await this.orderService.getUserOrders(userID, status);
        return {
            success: true,
            message: 'Lấy danh sách đơn hàng của người dùng thành công',
            data: {
                orders
            }
        };
    }

    // ===================== Count Order =====================
    @Get('count')
    @SkipThrottle()
    @Roles(Role.ADMIN)
    async countOrders(@Req() req: Request) {
        const {count, countPending, countShipping, countCompleted} = await this.orderService.countOrders();
        return {
            success: true,
            message: 'Đếm đơn hàng thành công',
            data: {
                count, countPending, countShipping, countCompleted
            }
        };
    }

    // ===================== Thống kê doanh thu tháng này =====================
    @Get('revenue-this-month')
    @SkipThrottle()
    @Roles(Role.ADMIN)
    async revenueThisMonth(@Req() req: Request) {
        const {currentMonthRevenue, growth} = await this.orderService.getRevenueThisMonth();
        return {
            success: true,
            message: 'Thống kê doanh thu tháng này thành công',
            data: {
                revenue: +currentMonthRevenue,
                growth
            }
        };
    }

    // ===================== Thống kê doanh thu năm nay =====================
    @Get('revenue-by-month')
    @SkipThrottle()
    @Roles(Role.ADMIN)
    async revenueThisYear(@Req() req: Request) {
        const revenueData = await this.orderService.getRevenueByMonth();
        return {
            success: true,
            message: 'Thống kê doanh thu năm nay thành công',
            data: {
                revenueData
            }
        };
    }

    // ===================== Buy Again =====================
    @Post('buy-again')
    async buyAgain(@Req() req: Request, @Body() body: OrderDTO) {
        const userID = (req as any).user?.id;
        const { products } = body;
        await this.orderService.buyAgain(userID, products);
        return {
            success: true,
            message: 'Thêm sản phẩm từ đơn hàng trước vào giỏ hàng thành công',
            data:{}
        };
    }
}
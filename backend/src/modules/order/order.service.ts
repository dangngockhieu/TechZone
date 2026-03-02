import { OrderItem, ProductDTO } from './interface/order.interface';
import { Injectable } from "@nestjs/common";
import { BadRequestException, InternalServerErrorException } from '../../help/exception';
import { Inject } from "@nestjs/common";
import { Pool } from "pg";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Cron } from '@nestjs/schedule';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class OrderService {
    constructor(
        @Inject('DATABASE_POOL') private pool: Pool
    ) {} 

    // Tạo đơn hàng 
    async createOrder(userID: number, recipientName: string, 
        address: string, phone: string, items: OrderItem[], 
        totalPrice: number, paymentMethod: string ) : Promise<void> { 
        const nowVN = dayjs().tz('Asia/Ho_Chi_Minh').toDate();
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // TRỪ KHO & KIỂM TRA TỒN KHO
            for (const item of items) {
                const updateStockQuery = `
                    UPDATE "products" 
                    SET quantity = quantity - $1, sold = sold + $1
                    WHERE id = $2 AND quantity >= $1
                `;
                const stockResult = await client.query(updateStockQuery, [item.quantity, item.productID]);

                if (stockResult.rowCount === 0) {
                    throw new BadRequestException(`Sản phẩm ID ${item.productID} không đủ hàng hoặc đã hết!`);
                }
            }

            // TẠO ORDER 
            const insertOrderQuery = `
                INSERT INTO "orders" 
                    ("userID", "recipientName", address, phone, "totalPrice", status, "orderDate")
                VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
                RETURNING id;
            `;
        
            const orderRes = await client.query(insertOrderQuery, [
                userID, recipientName, address, phone, totalPrice, nowVN
            ]);
            const orderID = orderRes.rows[0].id;

            // TẠO ORDER ITEMS 
            const insertItemQuery = `
                INSERT INTO "order_items" ("orderID", "productID", quantity, price)
                VALUES ($1, $2, $3, $4)
            `;
        
            for (const item of items) {
                await client.query(insertItemQuery, [orderID, item.productID, item.quantity, item.price]);
            }

            // TẠO PAYMENT
            const insertPaymentQuery = `
                INSERT INTO "payments" ("orderID", amount, method, status, "createdAt")
                VALUES ($1, $2, $3, 'UNPAID', $4)
            `;
            await client.query(insertPaymentQuery, [orderID, totalPrice, paymentMethod, nowVN]);
 
            // Xóa những món đã mua khỏi giỏ của user
            const clearCartQuery = `
                DELETE FROM "carts" 
                WHERE "userID" = $1 AND "productID" = ANY($2::int[])
            `;
            const productIDs = items.map(i => i.productID);
            await client.query(clearCartQuery, [userID, productIDs]);

            await client.query('COMMIT');
            return orderID;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Create Order Error:', error);

            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi hệ thống khi tạo đơn hàng');
        } finally {
            client.release();
        }
    }

    // Xóa đơn hàng
    async deleteOrder(orderID: number): Promise<void> {
        const query=`
            SELECT method
            FROM "payments"
            WHERE "orderID" = $1
        `;
        const result = await this.pool.query(query, [orderID]);
        if (result.rows.length === 0) {
            throw new BadRequestException('Đơn hàng không tồn tại');
        }
        const paymentMethod = result.rows[0].method;

        if (paymentMethod !== 'COD') {
            throw new BadRequestException('Chỉ có thể hủy đơn hàng với phương thức thanh toán COD');
        }

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query('DELETE FROM "payments" WHERE "orderID" = $1', [orderID]);
            await client.query('DELETE FROM "order_items" WHERE "orderID" = $1', [orderID]);
            await client.query('DELETE FROM "orders" WHERE id = $1 AND status = \'PENDING\'', [orderID]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Lấy List Order chờ xử lý 
    async getPendingOrders(page: number, limit: number): Promise<any> {
        const offset = (page - 1) * limit;
        const baseQuery = `
            FROM "orders" o
            JOIN "payments" p ON o.id = p."orderID"
            WHERE o.status = 'PENDING'
            AND (
                p.status = 'PAID' 
                OR (p.status = 'UNPAID' AND p.method = 'COD')
            )
        `;
        const queryData = `
            SELECT 
                o.id AS "orderID", o."userID", o."recipientName", o.address, o.phone, o."totalPrice", 
                o.status AS "orderStatus", o."orderDate",
                p.method AS "paymentMethod", p.status AS "paymentStatus",
                (SELECT u.email FROM "users" u WHERE u.id = o."userID") AS "userEmail"
            ${baseQuery}
            ORDER BY o."orderDate" DESC
            LIMIT $1 OFFSET $2
        `;

        const queryCount = `
            SELECT COUNT(*) AS total 
            ${baseQuery}
        `;

        try {
            const [resData, resCount] = await Promise.all([
                this.pool.query(queryData, [limit, offset]),
                this.pool.query(queryCount) 
            ]);

        
            const total = Number(resCount.rows[0]?.total) || 0; 
            const orders = resData.rows;

            return {
                orders: orders,
                pg :{
                    totalRecords: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Number(page)
                }
                
            };

        } catch (error) {
            console.error('Lỗi lấy danh sách đơn hàng:', error);
            throw new Error('Database Error');
        }
    }

    // Lấy danh sách đơn hàng cho admin theo trạng thái 
    async getOrderforAdmin (page : number, limit : number, status: string): Promise<any> {
        const offset = (page - 1) * limit;
        const baseQuery = `
            FROM "orders" o
            JOIN "payments" p ON o.id = p."orderID"
            WHERE o.status = $1
        `;
        const queryData = `
            SELECT 
                o.id AS "orderID", o."userID", o."recipientName", o.address, o.phone, o."totalPrice", 
                o.status AS "orderStatus", o."orderDate", o."trackingCode", o."deliveryDate", 
                o."expectedDate", o."receivedDate",
                p.method AS "paymentMethod", p.status AS "paymentStatus",
                (SELECT u.email FROM "users" u WHERE u.id = o."userID") AS "userEmail"
            ${baseQuery}
            ORDER BY o."orderDate" DESC
            LIMIT $2 OFFSET $3
        `;

        const queryCount = `
            SELECT COUNT(*) AS total 
            ${baseQuery}
        `;

        try {
            const [resData, resCount] = await Promise.all([
                this.pool.query(queryData, [status, limit, offset]),
                this.pool.query(queryCount, [status]) 
            ]);

            const total = Number(resCount.rows[0]?.total) || 0; 
            const orders = resData.rows;

            return {
                orders: orders,
                pg :{
                    totalRecords: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: Number(page)
                }
                
            };

        } catch (error) {
            console.error('Lỗi lấy danh sách đơn hàng:', error);
            throw new Error('Database Error');
        }
    }

    // Chi tiết đơn hàng
    async getOrderItem(orderID: number): Promise<any[]> {
        const query = `
            SELECT p.id AS "productID", p.name, 
                oi.quantity, oi.price AS "unitPrice",
            (
                SELECT pi.url
                FROM product_images pi
                WHERE pi."productID" = p.id
                ORDER BY pi.id ASC
                LIMIT 1
            ) AS "imageUrl"
            FROM "order_items" oi
            JOIN "products" p ON oi."productID" = p.id
            WHERE oi."orderID" = $1
        `;
        const result =  await this.pool.query(query, [orderID]);
        return result.rows;
    }

    // Cập nhật trạng thái đơn hàng sang quá trình vận chuyển
    async updatePendingtoShipping (orderID: number, trackingCode: string, expectedDate: Date|null): Promise<any> {
        const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const expectedVN = expectedDate ? dayjs(expectedDate).tz("Asia/Ho_Chi_Minh").toDate() : null;

        const query = `
            UPDATE "orders" 
            SET status = 'SHIPPING', "trackingCode" = $1, "deliveryDate" = $2, "expectedDate" = $3
            WHERE id = $4
            RETURNING *
        `;
        const updatedOrder = await this.pool.query(query, [trackingCode, nowVN, expectedVN, orderID]);

        return updatedOrder.rows[0];
    };

    // Cập nhật trạng thái đơn hàng sang hoàn thành 
    async updateOrderforUser (orderID: number, userID: number, status: string): Promise<any> {
        const orderQuery = `
            SELECT *
            FROM orders
            WHERE id = $1 AND "userID" = $2
        `;
        const orderResult = await this.pool.query(orderQuery, [orderID, userID]);
        if (orderResult.rows.length === 0) {
            throw new BadRequestException('Đơn hàng không tồn tại hoặc không thuộc về người dùng');
        }
        const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        if(status === 'COMPLETED'){
            const query1 = `
                UPDATE orders
                SET status = 'COMPLETED', "receivedDate" = $1
                WHERE id = $2 
            `;

            const query2= `
                UPDATE "products" p 
                SET sold = p.sold + oi.quantity
                FROM "order_items" oi
                WHERE p.id = oi."productID" AND oi."orderID" = $1
            `;
            const query3 = `
                UPDATE payments
                SET status = 'PAID'
                WHERE "orderID" = $1
            `;
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');

                // Update Order Status
                const updatedOrder = await client.query(query1, [nowVN, orderID]);

                // Update Product Sold 
                await client.query(query2, [orderID]);

                // Update Payment Status
                await client.query(query3, [orderID]);

                await client.query('COMMIT');
                return updatedOrder.rows[0];
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }
        else{
            const query1 = `
                UPDATE orders
                SET status = 'CANCELED'
                WHERE id = $1
            `;
            const updatedOrder = await this.pool.query(query1, [orderID]);
            return updatedOrder.rows[0];
        } 
    };

    // Lấy danh sách đơn hàng của người dùng 
    async getUserOrders(userID: number, status: string): Promise<any[]> {
        const query = `
            SELECT 
                o.id AS "orderID",
                o."totalPrice",
                o.status,
                o."orderDate",
                pm.method AS "paymentMethod",
                pm.status AS "paymentStatus",
                p.id AS "productID",
                p.name AS "productName",
                oi.id AS "orderItemID",
                oi.quantity,
                oi.price AS "unitPrice",
                oi."isReviewed",
            (
                SELECT pi.url
                FROM product_images pi
                WHERE pi."productID" = p.id
                ORDER BY pi.id ASC
                LIMIT 1
            ) AS "imageUrl"
            FROM orders o
            JOIN payments pm ON pm."orderID" = o.id
            JOIN order_items oi ON oi."orderID" = o.id
            JOIN products p ON p.id = oi."productID"

            WHERE o."userID" = $1
            AND o.status = $2

            ORDER BY o."orderDate" DESC;
        `;
        const result = await this.pool.query(query, [userID, status]);
        const orders = {};
        for (const row of result.rows) {
            const id = row.orderID;
            if (!orders[id]) {
                orders[id] = {
                    orderID: row.orderID,
                    totalPrice: row.totalPrice,
                    status: row.status,
                    orderDate: row.orderDate,
                    paymentMethod: row.paymentMethod,
                    paymentStatus: row.paymentStatus,
                    products: []   
                };
            }
            orders[id].products.push({
                productID: row.productID,
                name: row.productName,
                orderItemID: row.orderItemID,
                quantity: row.quantity,
                unitPrice: row.unitPrice,
                isReviewed: row.isReviewed,
                imageUrl: row.imageUrl
            });
        }
        return Object.values(orders);
    }

    // Thống kê số lượng đơn hàng trong tháng 
    async countOrders(){
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const startOfMonth = dayjs(vnNow).startOf('month').toDate();
        const endOfMonth = dayjs(vnNow).endOf('month').toDate();
        const query1 = `
            SELECT COUNT(*) AS "orderCount"
            FROM "orders"
            WHERE "orderDate" BETWEEN $1 AND $2
            AND status <> 'CANCELLED'
        `;
        const query2 = `
            SELECT COUNT(*) AS "orderCount"
            FROM "orders"
            WHERE "orderDate" BETWEEN $1 AND $2
            AND status = $3
        `;
        try {
            const [result, resultPending, resultShipping, resultCompleted] = await Promise.all([
                this.pool.query(query1, [startOfMonth, endOfMonth]),
                this.pool.query(query2, [startOfMonth, endOfMonth, 'PENDING']),
                this.pool.query(query2, [startOfMonth, endOfMonth, 'SHIPPING']),
                this.pool.query(query2, [startOfMonth, endOfMonth, 'COMPLETED']) 
            ]);
            return {
                count: Number(result.rows[0]?.orderCount) || 0,
                countPending: Number(resultPending.rows[0]?.orderCount) || 0,
                countShipping: Number(resultShipping.rows[0]?.orderCount) || 0,
                countCompleted: Number(resultCompleted.rows[0]?.orderCount) || 0
            }
        }catch (error) {
            console.error('Lỗi tính tổng đơn hàng:', error);
            throw new InternalServerErrorException('Database Error');
        }
    }

    // Thống kê doanh thu trong tháng hiện tại 
    async getRevenueThisMonth(){
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh");
        const startOfCurrentMonth = vnNow.startOf('month').toDate();
        const endOfCurrentMonth = vnNow.endOf('month').toDate();
        const startOfPrevMonth = vnNow.subtract(1, 'month').startOf('month').toDate();
        const endOfPrevMonth = vnNow.subtract(1, 'month').endOf('month').toDate();

        const query =`
            SELECT SUM("totalPrice") AS "revenue"
            FROM "orders"
            WHERE status = 'COMPLETED'
            AND "orderDate" BETWEEN $1 AND $2
        `;

        const [result1, result2] = await Promise.all([
            this.pool.query(query, [startOfCurrentMonth, endOfCurrentMonth]),
            this.pool.query(query, [startOfPrevMonth, endOfPrevMonth]), 
        ]);
        const currentMonthRevenue = result1.rows[0]?.revenue || 0;
        const prevMonthRevenue = result2.rows[0]?.revenue || 0;

        let growth = 0;
        if (prevMonthRevenue > 0) {
            growth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        } else if (currentMonthRevenue > 0) {
            growth = 100;
        }

        return {
            currentMonthRevenue,
            growth: Number(growth.toFixed(2)), 
        }
    }

    // Thống kê doanh thu theo tháng 
    async  getRevenueByMonth(){
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const year = dayjs(vnNow).year();

        const startOfYear = dayjs().tz("Asia/Ho_Chi_Minh").year(year).startOf('year').toDate();
        const endOfYear = dayjs().tz("Asia/Ho_Chi_Minh").year(year).endOf('year').toDate();
        const query =`
            SELECT "orderDate", "totalPrice"
            FROM "orders"
            WHERE status = 'COMPLETED'
            AND "orderDate" BETWEEN $1 AND $2
        `;
        const resultData = await this.pool.query(query, [startOfYear, endOfYear]);
        const result = resultData.rows;

        const monthlyRevenue = Array(12).fill(0);
        result.forEach((r) => {
            const vnDate = dayjs(r.orderDate).tz("Asia/Ho_Chi_Minh");
            const month = vnDate.month(); 
            monthlyRevenue[month] += r.totalPrice;
        });

        return monthlyRevenue;
    }
    
    // Mua lại các sản phẩm trong đơn hàng trước đó
    async buyAgain(userID: number, products: ProductDTO[]): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            for (const p of products) {
                const queryProduct = `SELECT id FROM "products" WHERE id = $1 AND quantity > 0`;
                const productRes = await client.query(queryProduct, [p.productID]);

                if (productRes.rows.length === 0) {
                    continue; 
                }
                const queryUpsert = `
                    INSERT INTO "carts" ("userID", "productID", "number", "isSelected")
                    VALUES ($1, $2, 1, true)
                    ON CONFLICT ("userID", "productID") 
                    DO UPDATE SET "isSelected" = true;
                `;
            
                await client.query(queryUpsert, [userID, p.productID]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Lỗi buyAgain:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Tự động xóa đơn hàng thanh toán online nhưng không hoàn thành sau 7 ngày
    @Cron('0 0 * * 1', { timeZone: 'Asia/Ho_Chi_Minh' }) // Chạy vào lúc 00:00 mỗi Thứ Hai hàng tuần
    async deleteUnpaidOrders(): Promise<void> {
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const thresholdDate = dayjs(vnNow).subtract(7, 'day').toDate();
        const queryOrder = `
            SELECT o.id AS "orderID"
            FROM "orders" o
            JOIN "payments" p ON o.id = p."orderID"
            WHERE p.method <> 'COD'
            AND p.status = 'UNPAID'
            AND o."orderDate" < $1
        `;
        const result = await this.pool.query(queryOrder, [thresholdDate]);
        const orderIDs = result.rows.map(r => r.orderID);
        // Xoá OrderItem và Cộng lại số lượng vào kho
         const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const orderID of orderIDs) {
                const queryItems = `
                    SELECT "productID", quantity
                    FROM "order_items"
                    WHERE "orderID" = $1
                `;
                const itemsRes = await client.query(queryItems, [orderID]);
                const items = itemsRes.rows;
                for (const item of items) {
                    const queryUpdateStock = `
                        UPDATE "products"
                        SET quantity = quantity + $1, sold = sold - $1
                        WHERE id = $2
                    `;
                    await client.query(queryUpdateStock, [item.quantity, item.productID]);
                }

                const queryDeleteItems = `
                    DELETE FROM "order_items"
                    WHERE "orderID" = $1
                `;
                await client.query(queryDeleteItems, [orderID]);

                const queryPayment = `
                    DELETE FROM "payments"
                    WHERE "orderID" = $1
                `;
                await client.query(queryPayment, [orderID]);

                const queryOrder = `
                    DELETE FROM "orders"
                    WHERE id = $1
                `;
                await client.query(queryOrder, [orderID]);

            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
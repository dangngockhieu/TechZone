import { Injectable, Inject } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '../../help/exception';
import { Pool } from 'pg';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, ReturnQueryFromVNPay } from 'vnpay';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class VnpayService {
    private vnpay: VNPay;

    constructor(@Inject('DATABASE_POOL') private pool: Pool) {
        // Khởi tạo VNPay instance
        this.vnpay = new VNPay({
            tmnCode: process.env.VNPAY_TMNCODE,
            secureSecret: process.env.VNPAY_HASHSECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: 'SHA512' as any,
            loggerFn: ignoreLogger,
        });
    }

    // Tạo URL thanh toán VNPay
    async createPaymentUrl(orderID: number, userID: number, ipAddr: string): Promise<string> {
        try {
            // Kiểm tra order có tồn tại và thuộc về user không
            const query = `
                SELECT o.id, o."totalPrice", o."userID", p.id as "paymentID", p.amount, p.status
                FROM "orders" o
                LEFT JOIN "payments" p ON o.id = p."orderID"
                WHERE o.id = $1 AND o."userID" = $2
            `;
            const result = await this.pool.query(query, [orderID, userID]);

            if (result.rowCount === 0) {
                throw new BadRequestException('Order không tồn tại hoặc không thuộc về bạn');
            }

            const order = result.rows[0];

            if (!order.paymentID) {
                throw new BadRequestException('Không tìm thấy thông tin thanh toán');
            }

            if (order.status === 'PAID') {
                throw new BadRequestException('Đơn hàng này đã được thanh toán');
            }

            const amount = Math.round(Number(order.amount));
            // Validate số tiền
            if (!amount || amount <= 0 || isNaN(amount)) {
                throw new BadRequestException('Số tiền không hợp lệ');
            }

            // VNPay sandbox thường giới hạn 100 triệu VND
            const MAX_AMOUNT = 100000000; // 100 triệu
            if (amount > MAX_AMOUNT) {
                throw new BadRequestException(`Số tiền vượt quá giới hạn thanh toán (tối đa ${MAX_AMOUNT.toLocaleString('vi-VN')} VND)`);
            }

            // Tạo thời gian
            const now = dayjs().tz('Asia/Ho_Chi_Minh');
            const createDate = now.format('YYYYMMDDHHmmss');
            const expireDate = now.add(15, 'minute').format('YYYYMMDDHHmmss');

            // Tạo TxnRef (mã tham chiếu giao dịch)
            const txnRef = `${orderID}_${Date.now().toString().slice(-6)}`;

            // Build payment URL
            const paymentUrl = this.vnpay.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: ipAddr || '127.0.0.1',
                vnp_TxnRef: txnRef,
                vnp_OrderInfo: `Thanh toan don hang ${orderID}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
                vnp_Locale: VnpLocale.VN,
            });

            return paymentUrl;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Lỗi tạo URL thanh toán:', error);
            throw new InternalServerErrorException('Lỗi tạo URL thanh toán VNPay');
        }
    }

    // Xử lý callback từ VNPay
    async handleReturn(query: ReturnQueryFromVNPay): Promise<{ success: boolean; orderID?: number; message: string }> {
        try {
            
            // Verify chữ ký
            const isValid = this.vnpay.verifyReturnUrl(query);
            
            if (!isValid) {
                return {
                    success: false,
                    message: 'Chữ ký không hợp lệ',
                };
            }

            const responseCode = query.vnp_ResponseCode;
            const txnRef = query.vnp_TxnRef;
            const transactionNo = query.vnp_TransactionNo;

            // Lấy orderID từ txnRef
            const orderID = parseInt(txnRef?.split('_')[0] || '0', 10);
            console.log('Parsed OrderID:', orderID);

            if (!orderID) {
                return {
                    success: false,
                    message: 'Không tìm thấy mã đơn hàng',
                };
            }

            // Kiểm tra mã phản hồi
            if (responseCode === '00') {
                const client = await this.pool.connect();
                try {
                    await client.query('BEGIN');

                    // Cập nhật trạng thái payment
                    const paymentUpdate = await client.query(
                        `UPDATE "payments" 
                         SET status = 'PAID', "transactionID" = $1 
                         WHERE "orderID" = $2
                         RETURNING *`,
                        [transactionNo, orderID]
                    );
                    // Cập nhật trạng thái order
                    const orderUpdate = await client.query(
                        `UPDATE "orders" 
                         SET status = 'PENDING' 
                         WHERE id = $1
                         RETURNING *`,
                        [orderID]
                    );

                    await client.query('COMMIT');

                    return {
                        success: true,
                        orderID,
                        message: 'Thanh toán thành công',
                    };
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                } finally {
                    client.release();
                }
            } else {
                return {
                    success: false,
                    orderID,
                    message: 'Thanh toán thất bại hoặc bị hủy',
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi xử lý thanh toán',
            };
        }
    }

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(orderID: number, userID: number) {
        const query = `
            SELECT p.status, p."transactionID", p.amount, o.status as "orderStatus"
            FROM "payments" p
            INNER JOIN "orders" o ON p."orderID" = o.id
            WHERE o.id = $1 AND o."userID" = $2
        `;
        const result = await this.pool.query(query, [orderID, userID]);

        if (result.rowCount === 0) {
            throw new BadRequestException('Không tìm thấy thông tin thanh toán');
        }

        return result.rows[0];
    }
}


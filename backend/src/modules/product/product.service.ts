import { Injectable, Inject} from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '../../help/exception';
import { Pool } from 'pg';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ProductFilters, Product} from './interface';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ProductService {
    constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

    // LẤY DANH SÁCH SẢN PHẨM (PAGINATE + FILTER) 
    async getProductsWithPaginate(page: number, limit: number, keyword = '', category = '', factory = '') {
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const offset = (pageNum - 1) * limitNum;

        // Xây dựng WHERE Clause
        let whereClauses = ['1=1'];
        const params: any[] = [];
        let paramIndex = 1; 

        if (category && ['LAPTOP', 'PHONE'].includes(category)) {
            whereClauses.push(`p.category = $${paramIndex++}`);
            params.push(category);
        }

        if (factory && factory !== 'ALL') {
            whereClauses.push(`p.factory = $${paramIndex++}`);
            params.push(factory);
        }

        if (keyword && keyword.trim() !== '') {
            whereClauses.push(`p.name ILIKE $${paramIndex++}`);
            params.push(`%${keyword.trim()}%`);
        }

        const whereSQL = whereClauses.join(' AND ');

        const queryProducts = `
            SELECT p.*,
            (
                SELECT json_agg(json_build_object('id', i.id, 'url', i.url))
                FROM "product_images" i
                WHERE i."productID" = p.id
            ) AS images,
            (
                SELECT json_agg(json_build_object('id', f.id, 'name', f.name))
                FROM "product_features" pf
                JOIN "features" f ON pf."featureID" = f.id
                WHERE pf."productID" = p.id
            ) AS features
            FROM "products" p
            WHERE ${whereSQL}
            ORDER BY p.id ASC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        // Thêm limit và offset vào params
        const queryParams = [...params, limitNum, offset];

        // Query 2: Đếm tổng
        const queryCount = `SELECT COUNT(*) as total FROM "products" p WHERE ${whereSQL}`;

        try {
            const [resProducts, resCount] = await Promise.all([
                this.pool.query(queryProducts, queryParams),
                this.pool.query(queryCount, params) 
            ]);

            const total = Number(resCount.rows[0].total) || 0;

            return {
                products: resProducts.rows,
                total: total
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Lỗi lấy danh sách sản phẩm');
        }
    }

    // Lấy 5 sp Laptop bán chạy nhất 
    async getTopSellingLaptop (){
        const query =`
            SELECT 
                p.id, p.name, p.coupon, p.price, p."originalPrice",
                ROUND(AVG(r.rating), 2) AS "avgRating",
                COUNT(r.id) AS "totalReviews",
            (
                SELECT JSON_ARRAYAGG(pi.url)
                FROM product_images pi 
                WHERE pi."productID" = p.id 
            ) AS "imageUrls"
            FROM products p
            LEFT JOIN reviews r ON p.id = r."productID"
            WHERE p.category = 'LAPTOP' AND p.quantity > 0
            GROUP BY p.id
            ORDER BY p.sold DESC
            LIMIT 5;
        `;
    const products = await this.pool.query(query);
    return {
        products: products.rows
    };
}

    // Lấy 5 sp Phone bán chạy nhất 
    async getTopSellingPhone (){
        const query =`
            SELECT 
                p.id, p.name, p.coupon, p.price, p."originalPrice",
                ROUND(AVG(r.rating), 2) AS "avgRating",
                COUNT(r.id) AS "totalReviews",
            (
                SELECT JSON_ARRAYAGG(pi.url)
                FROM product_images pi 
                WHERE pi."productID" = p.id 
            ) AS "imageUrls"
            FROM products p
            LEFT JOIN reviews r ON p.id = r."productID"
            WHERE p.category = 'PHONE' AND p.quantity > 0
            GROUP BY p.id
            ORDER BY p.sold DESC
            LIMIT 5;
        `;
        const products = await this.pool.query(query);
        return {
            products: products.rows
        };
    }

    // Lấy sản phẩm bán chạy nhất trong tháng
    async getTopSellingProduct (){
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh");
        const startOfMonth = vnNow.startOf('month').toDate();
        const endOfMonth = vnNow.endOf('month').toDate();

        const query = `
            SELECT p.id, p.name, SUM(oi.quantity) AS sold
            FROM "order_items" oi
            INNER JOIN "orders" o ON oi."orderID" = o.id
            INNER JOIN "products" p ON oi."productID" = p.id
            WHERE o.status = 'COMPLETED'
            AND o."orderDate" >= $1 
            AND o."orderDate" <= $2
            GROUP BY p.id, p.name
            ORDER BY sold DESC
            LIMIT 5;
        `;
        const res = await this.pool.query(query, [startOfMonth, endOfMonth]);
        return res.rows;
    }

    // Lấy tất cả sản phẩm với filter 
    async getFilterProducts(category: string, filters: ProductFilters) {
        const whereClauses: string[] = [];
        const params: any[] = [];
        let paramIndex = 1; 

        // Filter Category 
        whereClauses.push(`p.category = $${paramIndex++}`);
        params.push(category);

        // Filter Factory (Thương hiệu)
        if (filters?.factories?.length) {
            const placeholders = filters.factories.map(() => `$${paramIndex++}`).join(', ');
            whereClauses.push(`p.factory IN (${placeholders})`);
            params.push(...filters.factories);
        }

        //  Filter Product Features (Nhu cầu)
        if (filters?.product_features?.length) {
            const placeholders = filters.product_features.map(() => `$${paramIndex++}`).join(', ');
            whereClauses.push(`
                EXISTS (
                    SELECT 1 FROM "product_features" pf
                WHERE pf."productID" = p.id AND pf."featureID" IN (${placeholders})
                )
            `);
            params.push(...filters.product_features);
        }

        // Filter Price (Khoảng giá)
        if (filters?.price) {
            const { min, max } = filters.price;
            if (min != null && max != null) {
                whereClauses.push(`p.price BETWEEN $${paramIndex++} AND $${paramIndex++}`);
                params.push(min, max);
            } else if (min != null) {
                whereClauses.push(`p.price >= $${paramIndex++}`);
                params.push(min);
            } else if (max != null) {
                whereClauses.push(`p.price <= $${paramIndex++}`);
                params.push(max);
            }
        }

        // Filter Specs (Cấu hình chi tiết)
        if (filters?.specs) {
            const specs = filters.specs;

            // Hàm helper để tạo điều kiện LIKE cho specs (CPU, RAM, GPU...)
            const addSpecFilter = (colName: string, values: string[]) => {
                if (!values?.length || values.includes("Tất cả")) return;
        
                const conditions = values.filter(v => v && v !== "Tất cả")
                    .map(v => {
                        params.push(`%${v.toLowerCase().replace(/\s/g, '')}%`);
                        return `REPLACE(LOWER(p.${colName}), ' ', '') LIKE $${paramIndex++}`;
                    });
        
                if (conditions.length) whereClauses.push(`(${conditions.join(' OR ')})`);
            };

            addSpecFilter('cpu', specs.CPU);
            addSpecFilter('ram', specs.RAM);
            addSpecFilter('"graphicsCard"', specs.GPU); 
            addSpecFilter('storage', specs.Storage);
            addSpecFilter('screen', specs.ScreenSize);
            addSpecFilter('screen', specs.Screen);

            // === Lọc PIN ===
            if (specs.PIN?.length && !specs.PIN.includes("Tất cả")) {
                const pinConditions = specs.PIN
                    .filter(v => v && v !== "Tất cả")
                    .map(v => {
                        const num = parseInt(v.match(/\d+/)?.[0] || '0', 10);
                        const min = num;
                        const max = num + 1000;
                    return `
                        (substring(p.battery from '[0-9]+')::int >= ${min} 
                        AND substring(p.battery from '[0-9]+')::int < ${max})
                    `;
                });

                if (pinConditions.length) whereClauses.push(`(${pinConditions.join(' OR ')})`);
            }
        }

        // Ghép các điều kiện
        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // ==================== QUERY CHÍNH ====================
        const query1 = `
            SELECT 
                p.id, p.name, p.coupon, p.price, p."originalPrice", p.factory,
                ROUND(AVG(r.rating), 2) AS "avgRating",
                COUNT(r.id) AS "totalReviews",
                COALESCE(
                (
                    SELECT json_agg(pi.url)
                    FROM "product_images" pi 
                    WHERE pi."productID" = p.id
                ), '[]'
                ) AS "imageUrls"
            FROM "products" p
            LEFT JOIN "reviews" r ON p.id = r."productID"
            ${whereSQL}
            GROUP BY p.id
            ORDER BY p.sold DESC
        `;

        const query2 = `
            SELECT COUNT(*) AS count
            FROM "products" p
            ${whereSQL}
        `;

        try {

            const [result, resCount] = await Promise.all([
                this.pool.query(query1, params),
                this.pool.query(query2, params) 
            ]);
      
            // Xử lý dữ liệu trả về
            return {
                count: Number(resCount.rows[0].count) || 0,
                products: result.rows.map(p => ({
                ...p,
                avgRating: Number(p.avgRating) || 0,
                totalReviews: Number(p.totalReviews) || 0,
                imageUrls: p.imageUrls || [] 
            }))};

        } catch (error) {
            console.error('Lỗi lọc sản phẩm:', error);
            throw new InternalServerErrorException('Lỗi khi lấy danh sách sản phẩm');
        }
    }

    // Lấy tất cả sản phẩm cho ChatBot lọc
    async getAllProducts() {
        const query = `
            SELECT 
                p.*,
            (
                SELECT pi.url
                FROM product_images pi 
                WHERE pi."productID" = p.id
                LIMIT 1
            ) AS image,
            (
                SELECT JSON_ARRAYAGG(f.name)
                FROM features f 
                JOIN product_features pf ON f.id = pf."featureID"
                WHERE pf."productID" = p.id
            ) AS features
            FROM products p
            GROUP BY p.id
            ORDER BY p.sold DESC
        `;

        try {

            const result = await this.pool.query(query);
      
            // Xử lý dữ liệu trả về
            return result.rows;

        } catch (error) {
            console.error('Lỗi lọc sản phẩm:', error);
            throw new InternalServerErrorException('Lỗi khi lấy danh sách sản phẩm');
        }
    }

    // LẤY CHI TIẾT SẢN PHẨM 
    async getProductById(id: number) {
        const productQuery = `
            SELECT p.*,
                ROUND(AVG(r.rating), 2) AS "avgRating",
                COUNT(r.id) AS "totalReviews",
            (
                SELECT json_agg(pi.url)
                FROM "product_images" pi 
                WHERE pi."productID" = p.id 
            ) AS "imageUrls"
            FROM "products" p
            LEFT JOIN "reviews" r ON p.id = r."productID"
            WHERE p.id = $1
            GROUP BY p.id;
        `;

        // Lấy danh sách review chi tiết
        const reviewsQuery = `
            SELECT 
                r.id, r.rating, r.comment, r."createdAt",
                u.name AS "userName"
            FROM "reviews" r
            INNER JOIN "users" u ON r."userID" = u.id
            WHERE r."productID" = $1
            ORDER BY r."createdAt" DESC;
        `;

        const [resProduct, resReviews] = await Promise.all([
            this.pool.query(productQuery, [id]),
            this.pool.query(reviewsQuery, [id])
        ]);

        const product = resProduct.rows[0];
        if (!product) return { product: null, reviews: [] };
        product.imageUrls = product.imageUrls || [];

        return { product, reviews: resReviews.rows };
    }

    // Add đặc điểm cho sản phẩm 
    async addProductFeatures (productID: number, featureIDs: number[]){
        if (!Array.isArray(featureIDs) || featureIDs.length === 0) {
            throw new BadRequestException("featureIDs must be a non-empty array.");
        }

        // Chuẩn bị dữ liệu cho Bulk Insert
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        // Loop để tạo chuỗi 
        for (const fId of featureIDs) {
            placeholders.push(`($${paramIndex}, $${paramIndex + 1})`);
            values.push(productID, fId);
            paramIndex += 2;
        }

        // Viết Query
        const query = `
            INSERT INTO "product_features" ("productID", "featureID")
            VALUES ${placeholders.join(', ')}
            ON CONFLICT ("productID", "featureID") DO NOTHING
        `;

        // Thực thi
        await this.pool.query(query, values);

    };

    // Xóa đặc điểm sản phẩm
    async deleteProductFeature (productID: number, featureID: number) {
        const query = `
            DELETE FROM "product_features"
            WHERE "productID" = $1 AND "featureID" = $2
        `;
        await this.pool.query(query, [productID, featureID]);
    };

    // TẠO SẢN PHẨM MỚI 
    async createProduct(data: any, files: Array<Express.Multer.File>) {
        const client = await this.pool.connect();
    
        try {
            await client.query('BEGIN');

            // Xử lý giá tiền
            let finalPrice = Number(data.originalPrice);
            const couponValue = Number(data.coupon) || 0;
            if (couponValue > 0) {
                finalPrice = finalPrice - (finalPrice * couponValue / 100);
                finalPrice = Math.floor(finalPrice / 10000) * 10000;
            }

            // Insert Product
            const insertProductQuery = `
                INSERT INTO "products" (
                    name, "originalPrice", price, coupon, quantity, warranty, infor, 
                    cpu, ram, storage, screen, "graphicsCard", battery, weight, 
                    "releaseYear", category, factory, sold
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 0
                ) RETURNING *;
            `;
      
            const resProduct = await client.query(insertProductQuery, [
                data.name, data.originalPrice, finalPrice, couponValue, data.quantity, 
                data.warranty, data.infor, data.cpu, data.ram, data.storage, data.screen, 
                data.graphicsCard, data.battery, data.weight, data.releaseYear, 
                data.category, data.factory
            ]);
            const product = resProduct.rows[0];

            // Insert Images 
            if (files && files.length > 0) {
                let insertImagesQuery = `INSERT INTO "product_images" ("url", "productID") VALUES `;
                const imageParams = [];
                const valueStrings = [];
        
                files.forEach((file, index) => {
                    const url = `/products/${file.filename}`;
                    valueStrings.push(`($${index * 2 + 1}, $${index * 2 + 2})`);
                    imageParams.push(url, product.id);
                });

                insertImagesQuery += valueStrings.join(', ');
                await client.query(insertImagesQuery, imageParams);
            }

            await client.query('COMMIT');
            return product;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Lỗi tạo sản phẩm:', error);
            throw new InternalServerErrorException('Không thể tạo sản phẩm');
        } finally {
            client.release();
        }
    }

    // Thêm nhiều sản phẩm từ file Excel 
    async importProducts(filePath: string) {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length) {
            throw new Error("File Excel không có dữ liệu");
        }

        for (const row of rows) {
        const rowData = row as any;

        // ÉP FIELD DATA TỪ EXCEL 
        const data: Product = {
            name: rowData.name || "",
            originalPrice: +rowData.originalPrice || 0,
            quantity: +rowData.quantity || 0,
            coupon: +rowData.coupon || 0,

            // String fields
            warranty: rowData.warranty?.toString() || "",
            infor: rowData.infor?.toString() || "",
            cpu: rowData.cpu?.toString() || "",
            ram: rowData.ram?.toString() || "",
            storage: rowData.storage?.toString() || "",
            screen: rowData.screen?.toString() || "",
            graphicsCard: rowData.graphicsCard?.toString() || "",
            battery: rowData.battery?.toString() || "",
            weight: rowData.weight?.toString() || "",
            releaseYear: rowData.releaseYear?.toString() || "",
            category: rowData.category?.toString() || "",
            factory: rowData.factory?.toString() || "",
        };

        let finalPrice = data.originalPrice;
        const couponValue = data.coupon;

        let roundedPrice = data.originalPrice;
        if (couponValue > 0) {
            finalPrice = data.originalPrice - (data.originalPrice * couponValue / 100);
            roundedPrice = Math.floor(finalPrice / 10000) * 10000;
        }

        // INSERT USING POOL
        const insertQuery = `
            INSERT INTO "products" (
                name, "originalPrice", price, coupon, quantity, warranty, infor, 
                cpu, ram, storage, screen, "graphicsCard", battery, weight, 
                "releaseYear", category, factory, sold
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 0
            )
        `;
        
        await this.pool.query(insertQuery, [
            data.name, data.originalPrice, roundedPrice, data.coupon, data.quantity,
            data.warranty, data.infor, data.cpu, data.ram, data.storage,
            data.screen, data.graphicsCard, data.battery, data.weight,
            data.releaseYear, data.category, data.factory
        ]);
    }

    return rows.length;
}

    // Thêm nhiều ảnh (khi edit muốn thêm ảnh mới) 
    async addProductImages (productID: number, files: Array<Express.Multer.File>) {
        if (!files?.length) return;
        
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        for (const file of files) {
            placeholders.push(`($${paramIndex}, $${paramIndex + 1})`);
            values.push(`/products/${file.filename}`, productID);
            paramIndex += 2;
        }

        const query = `
            INSERT INTO "product_images" (url, "productID")
            VALUES ${placeholders.join(', ')}
        `;
        
        await this.pool.query(query, values);
    }

    // Xóa ảnh sản phẩm
    async deleteProductImage (imageID: number) {
        const query1=`SELECT * FROM "product_images" WHERE id = $1`;
        const query2 = `DELETE FROM "product_images" WHERE id = $1`;
        const image = await this.pool.query(query1, [imageID]);
        if (image.rowCount === 0) {
            throw new BadRequestException('Image not found');
        }
        const filePath = path.join('public', image.rows[0].url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await this.pool.query(query2, [imageID]);
    };

    // CẬP NHẬT SẢN PHẨM 
    async updateProduct(id: number, data: any) {
        // Logic tính giá mới
        const basePrice = Number(data.originalPrice);
        const couponValue = Number(data.coupon) || 0;
        const finalPrice = basePrice - (basePrice * couponValue) / 100;
        const roundedPrice = Math.floor(finalPrice / 10000) * 10000;

        const query = `
            UPDATE "products" 
            SET 
                name = $1, "originalPrice" = $2, price = $3, coupon = $4, quantity = $5,
                warranty = $6, infor = $7, cpu = $8, ram = $9, storage = $10,
                screen = $11, "graphicsCard" = $12, battery = $13, weight = $14,
                "releaseYear" = $15, category = $16, factory = $17
            WHERE id = $18
            RETURNING *;
        `;

        const res = await this.pool.query(query, [
            data.name, basePrice, roundedPrice, couponValue, data.quantity,
            data.warranty, data.infor, data.cpu, data.ram, data.storage,
            data.screen, data.graphicsCard, data.battery, data.weight,
            data.releaseYear, data.category, data.factory, id
        ]);

        return res.rows[0];
    }

    // XÓA SẢN PHẨM 
    async deleteProduct(id: number) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Lấy danh sách ảnh để xóa file vật lý
            const imgRes = await client.query('SELECT url FROM "product_images" WHERE "productID" = $1', [id]);
            const images = imgRes.rows;

            // Xóa dữ liệu trong DB 
            await client.query('DELETE FROM "product_images" WHERE "productID" = $1', [id]);
            await client.query('DELETE FROM "product_features" WHERE "productID" = $1', [id]);
            await client.query('DELETE FROM "products" WHERE id = $1', [id]);

            await client.query('COMMIT');
            // Xóa file ảnh trong ổ cứng 
            for (const img of images) {
                const filePath = path.join('public', img.url); 
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.warn(`Không thể xóa file ${filePath}:`, err.message);
                    }
                }
            }

        } catch (error) {
            await client.query('ROLLBACK');
            throw new InternalServerErrorException('Lỗi khi xóa sản phẩm');
        } finally {
            client.release();
        }
    }

    // TẠO ĐÁNH GIÁ (REVIEW) 
    async createReview(productID: number, userID: number, rating: number, comment: string, orderItemID: number) {
        // Kiểm tra xem đã mua hàng chưa
        const checkQuery = `
            SELECT oi.id 
            FROM "order_items" oi
            JOIN "orders" o ON oi."orderID" = o.id
            WHERE oi.id = $1 
                AND o."userID" = $2 
                AND o.status = 'COMPLETED'
                AND oi."isReviewed" = false
            LIMIT 1
        `;
        const checkRes = await this.pool.query(checkQuery, [orderItemID, userID]);
    
        if (checkRes.rowCount === 0) {
            throw new BadRequestException('Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng');
        }

        const client = await this.pool.connect();
            try {
                await client.query('BEGIN');

            // Tạo review
            const insertReview = `
                INSERT INTO "reviews" ("productID", "userID", rating, comment)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const resReview = await client.query(insertReview, [productID, userID, rating, comment]);

            // Cập nhật trạng thái đã review
            await client.query('UPDATE "order_items" SET "isReviewed" = true WHERE id = $1', [orderItemID]);

            await client.query('COMMIT');
            return resReview.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Số sản phẩm trong kho
    async countProducts() {
        const query = `SELECT COUNT(*) AS count FROM "products"`;
        const res = await this.pool.query(query);
        return Number(res.rows[0].count) || 0;
    }
}


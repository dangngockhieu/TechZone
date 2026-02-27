import { Injectable } from "@nestjs/common";
import { BadRequestException } from "../../help/exception";
import { Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class CartService {
    constructor(
        @Inject('DATABASE_POOL') private pool: Pool
    ) {} 

    // Check Product in cart 
    async checkProductInCart(userID: number, productID: number): Promise<boolean> {
        const existingCart =`
            SELECT * FROM "carts"
            WHERE "userID" = $1 AND "productID" = $2           
        `;
        const cartResult = await this.pool.query(existingCart, [userID, productID]);
        return cartResult.rowCount > 0;
    }

    // Thêm item vào cart 
    async addProductToCart(userID: number, productID: number): Promise<void> {
        const queryProduct = `
            SELECT *
            FROM "products"
            WHERE id=$1
            AND quantity > 0
        `;
        const product = await this.pool.query(queryProduct, [productID]);
        if (product.rowCount === 0) {
            throw new BadRequestException('Sản phẩm không tồn tại hoặc đã hết hàng');
        }

        const existingCart = await this.checkProductInCart(userID, productID);
        if (existingCart) {
            const updateCart = `
                UPDATE "carts"
                SET number = number + 1
                WHERE "userID" = $1 AND "productID" = $2
            `;
            await this.pool.query(updateCart, [userID, productID]);
        } else {
            const insertCart = `
                INSERT INTO "carts" ("userID", "productID", number)
                VALUES ($1, $2, 1)
            `;
            await this.pool.query(insertCart, [userID, productID]);
        }    
    } 
    
    // Đếm số item trong cart 
    async numberCart(userID: number): Promise<number> {
        const query =`
            SELECT COUNT(*) AS "totalCart" FROM "carts"
            WHERE "userID" = $1        
        `;
        const result = await this.pool.query(query, [userID]);
        return parseInt(result.rows[0].totalCart, 10);
    }

    // Lấy thông tin giỏ hàng 
    async getCart(userID: number): Promise<any[]> {
        const query=`
            SELECT p.id, p.name, p.price, p.quantity, 
                p."originalPrice", c.number, c."isSelected",
            (
                SELECT pi.url
                FROM product_images pi
                WHERE pi."productID" = p.id
                ORDER BY pi.id ASC
                LIMIT 1
            ) AS "imageUrl"
            FROM products p
            INNER JOIN carts c 
            ON p.id = c."productID"
            WHERE c."userID" = $1
        `;
        const result = await this.pool.query(query, [userID]);
        return result.rows;
    }

    // Update số lượng sản phẩm trong giỏ hàng 
    async updateQuantityCart(userID: number, productID: number, newNumber: number): Promise<void>{
        if(newNumber<0){
            throw new BadRequestException('Số lượng không hợp lệ');
        }
        const query=`
            SELECT name, quantity 
            FROM products
            WHERE id = $1
        `;
        const result = await this.pool.query(query, [productID]);
        if(result.rowCount === 0){
            throw new BadRequestException('Sản phẩm không tồn tại');
        }
        const availableQuantity = result.rows[0].quantity;
        if(newNumber > availableQuantity){
            throw new BadRequestException(`Chỉ còn ${availableQuantity} sản phẩm trong kho`);
        }
        const updateQuery=`
            UPDATE carts 
            SET number = $1
            WHERE "userID" = $2 AND "productID" = $3
        `;
        await this.pool.query(updateQuery, [newNumber, userID, productID]);
    }

    // Xoá sản phẩm khỏi giỏ hàng 
    async deleteCart(userID: number, productID: number): Promise<void> {
        const deleteQuery=`
            DELETE FROM carts 
            WHERE "userID" = $1 AND "productID" = $2
        `;
        await this.pool.query(deleteQuery, [userID, productID]);  
    }

    // Mua ngay 
    async buyNow(userID: number, productID: number): Promise<void> {
        const queryProduct = `
            SELECT *
            FROM "products"
            WHERE id=$1
            AND quantity > 0
        `;
        const product = await this.pool.query(queryProduct, [productID]);
        if (product.rowCount === 0) {
            throw new BadRequestException('Sản phẩm không tồn tại hoặc đã hết hàng');
        }

        const existingCart = await this.checkProductInCart(userID, productID);
        if (existingCart) {
            const updateCart = `
                UPDATE "carts"
                SET "isSelected" = true
                WHERE "userID" = $1 AND "productID" = $2
            `;
            await this.pool.query(updateCart, [userID, productID]);
        } else {
            const insertCart = `
                INSERT INTO "carts" ("userID", "productID", number, "isSelected")
                VALUES ($1, $2, 1, true)
            `;
            await this.pool.query(insertCart, [userID, productID]);
        }
    }

    // Thanh toán sản phẩm 
    async checkout(userID: number, productID: number): Promise<void> {
        const updateCart = `
                UPDATE "carts"
                SET "isSelected" = false
                WHERE "userID" = $1 AND "productID" = $2
            `;
        await this.pool.query(updateCart, [userID, productID]);
    }
}
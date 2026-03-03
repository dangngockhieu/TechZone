import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import * as argon from 'argon2';
import 'dotenv/config';

@Injectable()
export class DatabaseSeeder {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async seed() {
    console.log(' Bắt đầu seed dữ liệu...');
    // Sử dụng client riêng để có thể dùng transaction nếu cần thiết
    const client = await this.pool.connect();

    try {
      // ========== USERS ==========
      const userCountRes = await client.query(`SELECT COUNT(*) FROM "users"`);
      const userCount = parseInt(userCountRes.rows[0].count, 10);

      if (userCount === 0) {
        console.log('👤 Tạo người dùng mẫu...');
        const passwordHash = await argon.hash('123456');
        
        const usersToInsert = [
          ['Admin', 'admin@gmail.com', passwordHash, 'ADMIN', true],
          ['User', 'user@gmail.com', passwordHash, 'USER', true],
          ['Nguyễn Văn A', 'a@gmail.com', passwordHash, 'USER', true],
          ['Trần Thị B', 'b@gmail.com', passwordHash, 'USER', true],
          ['Lê Văn C', 'c@gmail.com', passwordHash, 'USER', true],
        ];

        for (const user of usersToInsert) {
          await client.query(
            `INSERT INTO "users" (name, email, password, role, "isVerified") VALUES ($1, $2, $3, $4, $5)`,
            user
          );
        }
      }
      const usersRes = await client.query(`SELECT * FROM "users"`);
      const users = usersRes.rows;

      // ========== FEATURES ==========
        const featureCountRes = await client.query(`SELECT COUNT(*) FROM "features"`);
      const featureCount = parseInt(featureCountRes.rows[0].count, 10);

      if (featureCount === 0) {
        console.log(' Tạo các tính năng...');
        const featuresToInsert = [
          'Văn phòng', 'Gaming', 'Mỏng nhẹ', 'Đồ họa', 'Cảm ứng', 
          'Laptop AI', 'Điện thoại 5G', 'Điện thoại AI', 'Gaming Phone', 
          'Phổ thông 4G', 'Điện thoại gập'
        ];

        for (const fName of featuresToInsert) {
            await client.query(`INSERT INTO "features" (name) VALUES ($1)`, [fName]);
        }
      }
        const featuresRes = await client.query(`SELECT * FROM "features"`);
      const features = featuresRes.rows;
      // Tạo lookup table cho feature để dễ map ID
      const featureMap = Object.fromEntries(features.map(f => [f.name, f.id]));

      // ========== PRODUCTS ==========
      const productCountRes = await client.query(`SELECT COUNT(*) FROM "products"`);
      const productCount = parseInt(productCountRes.rows[0].count, 10);

      if (productCount === 0) {
        console.log(' Tạo sản phẩm mẫu...');

        const productsData = [
          // Laptops
          ["Dell Inspiron 15", 20000000, 18000000, 10, 20, "12 tháng", "Laptop học tập và làm việc hiệu năng tốt.", "Intel Core i5", "8GB", "512GB SSD", "15.6 inch Full HD", "Intel Iris Xe", "56Wh", "1.7kg", "2024", "LAPTOP", "DELL"],
          ["HP Pavilion 14", 19000000, 17000000, 10, 25, "12 tháng", "Thiết kế nhỏ gọn, tiện lợi di chuyển.", "Intel Core i7", "16GB", "512GB SSD", "14 inch Full HD", "Intel Iris Xe", "50Wh", "1.5kg", "2024", "LAPTOP", "HP"],
          ["ASUS TUF Gaming F15", 25000000, 23000000, 8, 15, "24 tháng", "Laptop gaming hiệu năng mạnh mẽ, bền bỉ.", "Intel Core i7", "16GB", "1TB SSD", "15.6 inch Full HD", "RTX 4060", "90Wh", "2.2kg", "2024", "LAPTOP", "ASUS"],
          ["Lenovo ThinkPad X1 Carbon", 30000000, 28000000, 7, 10, "36 tháng", "Siêu mỏng nhẹ, pin trâu, hiệu suất cao.", "Intel Core i7", "16GB", "1TB SSD", "14 inch 2K IPS", "Intel Iris Xe", "57Wh", "1.1kg", "2024", "LAPTOP", "LENOVO"],
          ["MacBook Air M3 2024", 32000000, 30000000, 6, 12, "12 tháng", "Chip M3 mới, pin cực trâu, macOS mượt mà.", "Apple M3", "8GB", "512GB SSD", "13.6 inch Retina", "Apple GPU", "52.6Wh", "1.24kg", "2024", "LAPTOP", "MACBOOK"],
          // Phones
          ["iPhone 15 Pro", 32000000, 29000000, 9, 20, "12 tháng", "Siêu phẩm của Apple với chip A17 Pro.", "A17 Pro", "8GB", "256GB", "6.1 inch OLED", "Apple GPU", "3300mAh", "187g", "2024", "PHONE", "IPHONE"],
          ["Samsung Galaxy S24 Ultra", 35000000, 32000000, 8, 15, "12 tháng", "Camera 200MP, hiệu năng mạnh mẽ.", "Snapdragon 8 Gen 3", "12GB", "512GB", "6.8 inch AMOLED", "Adreno 750", "5000mAh", "233g", "2024", "PHONE", "SAMSUNG"],
          ["Xiaomi 14 Pro", 25000000, 22000000, 10, 18, "12 tháng", "Giá rẻ, hiệu năng cao, sạc siêu nhanh.", "Snapdragon 8 Gen 3", "12GB", "256GB", "6.7 inch AMOLED", "Adreno 740", "4600mAh", "200g", "2024", "PHONE", "XIAOMI"],
          ["Oppo Find X7", 27000000, 25000000, 7, 20, "12 tháng", "Camera đẹp, thiết kế sang trọng.", "Dimensity 9300", "16GB", "512GB", "6.74 inch AMOLED", "Immortalis-G720", "4800mAh", "210g", "2024", "PHONE", "OPPO"],
          ["Samsung Galaxy Z Fold6", 35000000, 31500000, 10, 25, "12 tháng", "Flagship killer cấu hình mạnh mẽ.", "Snapdragon 8 Gen 3", "12GB", "256GB", "7.6 inch OLED", "Adreno 750", "5000mAh", "205g", "2024", "PHONE", "SAMSUNG"]
        ];

        const insertProductQuery = `
          INSERT INTO "products" (
            name, "originalPrice", price, coupon, quantity, warranty, infor, 
            cpu, ram, storage, screen, "graphicsCard", battery, weight, "releaseYear", category, factory
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `;

        for (const p of productsData) {
          await client.query(insertProductQuery, p);
        }
      }
      const productsRes = await client.query(`SELECT * FROM "products"`);
      const products = productsRes.rows;

      // ========== PRODUCT FEATURES ==========
      const pfCountRes = await client.query(`SELECT COUNT(*) FROM "product_features"`);
      const pfCount = parseInt(pfCountRes.rows[0].count, 10);

      if (pfCount === 0) {
        console.log('Gắn feature cho sản phẩm...');

        const assignFeatures = async (productName: string, featureNames: string[]) => {
          const product = products.find(p => p.name === productName);
          if (!product) return;
          for (const fName of featureNames) {
            const featureId = featureMap[fName];
            if (featureId) {
              await client.query(
                `INSERT INTO "product_features" ("productID", "featureID") VALUES ($1, $2)`,
                [product.id, featureId]
              );
            }
          }
        };

        // Laptops
        await assignFeatures("Dell Inspiron 15", ["Văn phòng"]);
        await assignFeatures("HP Pavilion 14", ["Văn phòng", "Mỏng nhẹ"]);
        await assignFeatures("ASUS TUF Gaming F15", ["Gaming", "Đồ họa"]);
        await assignFeatures("Lenovo ThinkPad X1 Carbon", ["Văn phòng", "Mỏng nhẹ"]);
        await assignFeatures("MacBook Air M3 2024", ["Mỏng nhẹ", "Laptop AI"]);

        // Phones
        await assignFeatures("iPhone 15 Pro", ["Điện thoại 5G"]);
        await assignFeatures("Samsung Galaxy S24 Ultra", ["Điện thoại 5G", "Điện thoại AI"]);
        await assignFeatures("Xiaomi 14 Pro", ["Gaming Phone", "Phổ thông 4G"]);
        await assignFeatures("Oppo Find X7", ["Gaming Phone", "Điện thoại 5G"]);
        await assignFeatures("Samsung Galaxy Z Fold6", ["Điện thoại 5G", "Điện thoại gập"]);
      }

      // ========== ORDERS + REVIEWS ==========
      const orderCountRes = await client.query(`SELECT COUNT(*) FROM "orders"`);
      const orderCount = parseInt(orderCountRes.rows[0].count, 10);

      if (orderCount === 0) {
        console.log('🛒 Tạo đơn hàng và đánh giá...');
        
        for (const product of products) {
          // Shuffle và lấy 3 users
          const reviewers = [...users].sort(() => 0.5 - Math.random()).slice(0, 3);
          const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);

          for (const user of reviewers) {
            const totalPrice = product.price || product.originalPrice;

            // 1. Tạo Order (sử dụng RETURNING id để lấy ID vừa tạo)
            const orderRes = await client.query(
              `INSERT INTO "orders" ("userID", "totalPrice", "recipientName", address, phone, status, "orderDate", "trackingCode", "deliveryDate", "receivedDate") 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
              [
                user.id, totalPrice, user.name, "123 Đường ABC, TP.HCM", "0901234567", 
                "COMPLETED", nowVN, `TRACK-${product.id}-${user.id}`, nowVN, nowVN
              ]
            );
            const orderId = orderRes.rows[0].id;

            // 2. Tạo OrderItem dựa trên orderId vừa lấy
            await client.query(
              `INSERT INTO "order_items" ("orderID", "productID", quantity, price, "isReviewed") VALUES ($1, $2, $3, $4, $5)`,
              [orderId, product.id, 1, totalPrice, true]
            );

            // 3. Tạo Payment dựa trên orderId
            await client.query(
              `INSERT INTO "payments" ("orderID", amount, method, status) VALUES ($1, $2, $3, $4)`,
              [orderId, totalPrice, 'COD', 'PAID']
            );

            // 4. Tạo Review
            const rating = Math.floor(Math.random() * 5) + 1;
            const comment = `Sản phẩm ${product.name} rất tốt! Người dùng ${user.name} hài lòng.`;
            await client.query(
              `INSERT INTO "reviews" ("userID", "productID", rating, comment) VALUES ($1, $2, $3, $4)`,
              [user.id, product.id, rating, comment]
            );
          }

          // Cập nhật số lượng bán ra
          await client.query(
            `UPDATE "products" SET sold = $1 WHERE id = $2`,
            [reviewers.length, product.id]
          );
        }
      }

      console.log('Seed hoàn tất!');
    } catch (error) {
      console.error('Lỗi seed:', error);
      throw error;
    } finally {
      client.release(); // Trả kết nối lại cho Pool
    }
  }
}

// Run seeder when executed directly
async function bootstrap() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL is missing. Please set it in .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const seeder = new DatabaseSeeder(pool as any);

  try {
    await seeder.seed();
    console.log('Seed finished successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

bootstrap();
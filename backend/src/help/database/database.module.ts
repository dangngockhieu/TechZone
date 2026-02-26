import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global() 
@Module({
    imports: [ConfigModule], 
    providers: [
    {
        provide: 'DATABASE_POOL', 
        useFactory: (configService: ConfigService) => {
            return new Pool({
                connectionString: configService.get<string>('DATABASE_URL'),
            });
        },
        inject: [ConfigService],
    },
    ],
    exports: ['DATABASE_POOL'], 
})
export class DatabaseModule {}
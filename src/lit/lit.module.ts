import { DynamicModule, Module } from '@nestjs/common';
import { LitService } from './lit.service';
import { LitController } from './lit.controller';
import { MockLitService } from './lit.service.mock';

@Module({})
export class LitModule {
  static forRoot(): DynamicModule {
    const isTest = process.env.NODE_ENV === 'test';

    const litServiceProvider = {
      provide: LitService,
      useClass: isTest ? MockLitService : LitService,
    };

    return {
      module: LitModule,
      controllers: [LitController],
      providers: [litServiceProvider],
      exports: [litServiceProvider],
    };
  }
}

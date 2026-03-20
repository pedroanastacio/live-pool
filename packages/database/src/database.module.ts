import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

@Module({})
export class DatabaseModule {
  static forRoot(options: TypeOrmModuleOptions) {
    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forRoot(options)],
    };
  }
}

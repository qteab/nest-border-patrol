import { DynamicModule, FactoryProvider, Global, Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ModuleAsyncOptions, ModuleOptions } from "./types";
import { MODULE_OPTIONS_KEY } from "./border-patrol.constants";
import { BorderPatrolExceptionFilter } from "./border-patrol.filter";

@Global()
@Module({})
export class BorderPatrolCoreModule {
  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider = {
      provide: MODULE_OPTIONS_KEY,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    const filterProvider: FactoryProvider = {
      provide: APP_FILTER,
      inject: [MODULE_OPTIONS_KEY],
      useFactory: (options: ModuleOptions) => {
        if (
          options.useDefaultFilter ||
          options.useDefaultFilter === undefined
        ) {
          return new BorderPatrolExceptionFilter();
        }
        return null;
      },
    };

    return {
      exports: [],
      module: BorderPatrolCoreModule,
      providers: [optionsProvider, filterProvider],
    };
  }
}

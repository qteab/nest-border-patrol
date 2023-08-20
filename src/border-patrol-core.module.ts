import { patchNestjsSwagger } from '@abitia/zod-dto';
import { DynamicModule, FactoryProvider, Global, Module } from "@nestjs/common";
import {
  APP_FILTER,
  DiscoveryModule
} from "@nestjs/core";
import { BorderPatrolExplorerService } from "./border-patrol-explorer.service";
import { MODULE_OPTIONS_KEY } from "./border-patrol.constants";
import { BorderPatrolExceptionFilter } from "./border-patrol.filter";
import { ModuleAsyncOptions, ModuleOptions } from "./types";

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

    patchNestjsSwagger();

    return {
      imports: [DiscoveryModule],
      exports: [],
      module: BorderPatrolCoreModule,
      providers: [optionsProvider, filterProvider, BorderPatrolExplorerService],
    };
  }
}

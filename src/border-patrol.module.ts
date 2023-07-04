import { DynamicModule, Module } from "@nestjs/common";
import { ModuleAsyncOptions } from "./types";
import { BorderPatrolCoreModule } from "./border-patrol-core.module";

@Module({})
export class BorderPatrolModule {
  public static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    return {
      module: BorderPatrolModule,
      imports: [BorderPatrolCoreModule.forRootAsync(options)],
    };
  }
}

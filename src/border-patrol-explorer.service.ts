import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { printNode, zodToTs } from "zod-to-ts";
import path from "node:path";
import { BORDER_CONFIGURATION_KEY } from "./border-patrol.constants";
import fs from "node:fs/promises";

@Injectable()
export class BorderPatrolExplorerService implements OnModuleInit {
  private readonly logger = new Logger(BorderPatrolExplorerService.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner
  ) {}

  public async onModuleInit() {
    const outEnv = process.env.BORDER_PATROL_GATEWAY_TYPES;
    if (!outEnv) {
      return;
    }

    const wsPackageConstants = await import("@nestjs/websockets/constants")
      .then((mod) => {
        return {
          GATEWAY_METADATA: mod.GATEWAY_METADATA,
          MESSAGE_MAPPING_METADATA: mod.MESSAGE_MAPPING_METADATA,
          MESSAGE_METADATA: mod.MESSAGE_METADATA,
        };
      })
      .catch((e) => null);

    if (!wsPackageConstants) {
      throw new Error("@nestjs/websockets not installed");
    }

    const outPath = path.join(process.cwd(), outEnv);
    if (path.extname(outPath) !== ".ts") {
      throw new Error("Path must be a .ts file");
    }

    const gateways = this.discoveryService
      .getProviders()
      .filter(
        (wrapper) =>
          wrapper.metatype &&
          this.reflector.get(
            wsPackageConstants.GATEWAY_METADATA,
            wrapper.metatype
          )
      );

    const gatewayHandlers = gateways
      .flatMap((gateway) => {
        const instancePrototype = Object.getPrototypeOf(gateway.instance);
        const methodNames =
          this.metadataScanner.getAllMethodNames(instancePrototype);

        return methodNames.map((methodName) => {
          const method = instancePrototype[methodName];
          const isMessageMapping = Reflect.getMetadata(
            wsPackageConstants.MESSAGE_MAPPING_METADATA,
            method
          );
          if (!isMessageMapping) {
            return null;
          }

          const event = Reflect.getMetadata(
            wsPackageConstants.MESSAGE_METADATA,
            method
          ) as string;
          const configuration = Reflect.getMetadata(
            BORDER_CONFIGURATION_KEY,
            method
          );
          const dataType = printNode(zodToTs(configuration.body).node);

          return {
            event,
            dataZodSchema: configuration.body,
            dataTsString: dataType,
          };
        });
      })
      .filter((handler): handler is NonNullable<typeof handler> => !!handler)
      .sort((a, b) => a.event.localeCompare(b.event));

    const gatewayMessageTsType =
      "type ClientMessage = " +
      gatewayHandlers
        .map(
          (handler) => `{
  event: "${handler.event}";
  data: ${handler.dataTsString.replaceAll("\n", "\n\t")};
}
`
        )
        .join(" | \n");

    fs.mkdir(path.dirname(outPath), { recursive: true }).then(() => {
      fs.writeFile(outPath, gatewayMessageTsType, "utf-8");
    });
  }
}

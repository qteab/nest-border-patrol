import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "ws";
import { WsAdapter } from "@nestjs/platform-ws";
import { BorderPatrolModule } from "~/border-patrol.module";
import { UseBorder } from "~/border-patrol.decorators";
import { createWsBorder } from "~/utility/createWsBorder";
import { z } from "zod";
import fs from "node:fs/promises";
import { InferFromBorder } from "~/types";

jest.mock("node:fs");

const PORT = 9000;

const border = createWsBorder(
  z.object({
    prop1: z.string(),
    prop2: z.string().nullable(),
  })
);

@WebSocketGateway(PORT)
export class EventsGateway {
  @WebSocketServer()
  // @ts-expect-error
  server: Server;

  @SubscribeMessage("events")
  @UseBorder(border)
  onEvent(@MessageBody() data: InferFromBorder<typeof border, "messageBody">) {}
}

describe("BorderPatrolExplorerService websockets", () => {
  let app: INestApplication;

  const writeFileMock = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    fs.mkdir = jest.fn().mockResolvedValueOnce(undefined);
    fs.writeFile = writeFileMock;

    process.env.BORDER_PATROL_GATEWAY_TYPES = "./kalas.ts";
    const module = await Test.createTestingModule({
      imports: [
        BorderPatrolModule.forRootAsync({
          useFactory: () => ({}),
        }),
      ],
      providers: [EventsGateway],
    }).compile();

    app = module.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it("should find all gateway methods and extract types", async () => {
    const expectedString = `type ClientMessage = {
  event: "events";
  data: {
        prop1: string;
        prop2: string | null;
    };
}
`;
    // expect(writeFileMock).toHaveBeenCalledWith(
    //   expect.stringContaining("kalas.ts"),
    //   data
    // );
    expect(writeFileMock).toHaveBeenCalledTimes(1);
    const actualString = writeFileMock.mock.calls[0][1];

    expect(actualString.replaceAll(/\s/g, "")).toEqual(
      expectedString.replaceAll(/\s/g, "")
    );
  });
});

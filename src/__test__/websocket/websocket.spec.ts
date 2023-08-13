import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import WebSocket, { Server } from "ws";
import { WsAdapter } from "@nestjs/platform-ws";
import { BorderPatrolModule } from "~/border-patrol.module";
import { UseBorder } from "~/border-patrol.decorators";
import { createWsBorder } from "~/utility/createWsBorder";
import { z } from "zod";
import { InferFromBorder } from "~/types";

const PORT = 9000;

const border = createWsBorder(
  z.object({
    prop1: z.string(),
    prop2: z.string().nullable(),
  })
);

const recieverMock = jest.fn();

@WebSocketGateway(PORT)
export class EventsGateway {
  @WebSocketServer()
  // @ts-expect-error
  server: Server;

  @SubscribeMessage("events")
  @UseBorder(border)
  onEvent(@MessageBody() data: InferFromBorder<typeof border, "messageBody">) {
    // console.log("In da shit", data);
    // return from([1, 2, 3]).pipe(
    //   map((item) => ({ event: "events", data: item }))
    // );
    recieverMock(data);
  }
}

describe("Websockets", () => {
  let app: INestApplication;
  let socket: WebSocket;

  beforeEach(async () => {
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
    const socketUrl = `ws://[${
      app.getHttpServer().listen().address().address
    }]:${PORT}`;

    await new Promise((resolve) => {
      socket = new WebSocket(socketUrl);
      socket.on("open", () => {
        resolve(undefined);
      });
    });
  });

  afterEach(async () => {
    socket.close();
    await app.close();
    recieverMock.mockReset();
  });

  it("should let messages pass through when data is valid", async () => {
    socket.send(
      JSON.stringify({
        event: "events",
        data: {
          prop1: "hihii",
          prop2: null,
        },
      })
    );

    // Wait for message to be recieved
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 500));

    expect(recieverMock).toHaveBeenCalledTimes(1);
  });

  it("should block invalid messages", async () => {
    socket.send(
      JSON.stringify({
        event: "events",
        data: {
          prop1: "hihii",
          prop2: 123,
        },
      })
    );

    // Wait for message to be recieved
    await new Promise((resolve) => setTimeout(() => resolve(undefined), 500));

    expect(recieverMock).not.toHaveBeenCalled();
  });
});

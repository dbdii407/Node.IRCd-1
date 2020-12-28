// Copyright 2020 Michael Rodriguez
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const EventEmitter = require("events");
const logger = require("./logger");
const net = require("net");

// This class handles incoming network connections from clients, and emits the
// following events:
//
// 'clientConnected': A client has connected to the server.
//
// 'clientDisconnected': A client has disconnected from the server without
// using the `QUIT` command, likely due to a network error on their part.
//
// 'clientSentData`: A client has sent a string to the server. Internally, the
// buffer is converted to a string and is automatically trimmed before being
// emitted.
class NetworkManager extends EventEmitter {
  #connectionHandler = net.createServer(socket => {
    this.emit("clientConnected", socket);

    socket.on("data", (Data) => {
      this.emit("clientSentData", socket, Data.toString());
    });

    socket.on("end", () => {
      this.emit("clientDisconnected");
    });
  });

  constructor() {
    super();
  }

  // Adds a listener.
  addListener(Hostname, Port) {
    this.#connectionHandler.listen({ host: Hostname, port: Port }, () => {
      logger.info(
        `listening for incoming client connections on ${Hostname}:${Port}`
      );
    });
  }
}

module.exports = NetworkManager;

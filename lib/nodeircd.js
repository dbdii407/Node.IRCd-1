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

const Configuration = require("./config");
const NetworkManager = require("./network");
const Logger = require("./logger");
const User = require("./user");

// Core commands
const NICKCommand = require("./command/nick");
const USERCommand = require("./command/user");
const SUMMONCommand = require("./command/summon");
const USERSCommand = require("./command/users");
const MOTDCommand = require("./command/motd");

// Defines the master server object. This essentially governs control of the
// entire application.
class NodeIRCd {
  networkManager = new NetworkManager();
  config = Configuration;

  #channels = new Map();
  #users = new Map();
  #commands = new Map();

  constructor() {
    this.addCoreCommands();
    this.connectNetworkManagerEvents();
    Logger.info("nodeircd initialized");
  }

  // Returned to a registered client to indicate that the command sent is unknown
  // by the server.
  ERR_UNKNOWNCOMMAND(Command) {
    return [421, `${Command} :Unknown command`];
  }

  // Adds the core IRC commands to the command table.
  addCoreCommands() {
    this.#commands.set("MOTD", MOTDCommand);
    this.#commands.set("NICK", NICKCommand);
    this.#commands.set("SUMMON", SUMMONCommand);
    this.#commands.set("USER", USERCommand);
    this.#commands.set("USERS", USERSCommand);
  }

  connectNetworkManagerEvents() {
    this.networkManager.on("clientConnected", socket => {
      this.#users.set(socket, new User(socket));
      Logger.debug("client connected");
    });

    this.networkManager.on("clientDisconnected", socket => {
      this.#users.delete(socket);
      Logger.debug("client disconnected");
    });

    this.networkManager.on("clientSentData", (socket, data) => {
      const ircString = data.split("\r\n");
      const userClient = this.#users.get(socket);

      ircString.forEach(element => {
        const message = element.split(" ");
        const command = message[0];

        if (!this.#commands.has(command)) {
          userClient.sendNumeric(this.ERR_UNKNOWNCOMMAND, command);
        } else {
          const cmdFunc = this.#Commands.get(command);

          // We don't need the command anymore.
          message.shift();
          cmdFunc(userClient, message);
        }
      });
    });
  }
}

module.exports = NodeIRCd;

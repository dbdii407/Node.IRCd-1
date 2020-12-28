#!/usr/bin/env node
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

const { program } = require("commander");
const readline = require("readline");
const fs = require("fs");

const Configuration = require("./config");
const NodeIRCd = require("./../lib/nodeircd");

class Application {
  #iRCd;
  #config;

  constructor() {
    this.parseCommandLineOptions();

    this.#config = new Configuration("../nodeircd.json");
    this.#iRCd = new NodeIRCd();

    this.connectConfigEvents();
    this.#config.parse();
  }

  connectConfigEvents() {
    this.#config.on("motdFile", (MOTDFile) => {
      const readInterface = readline.createInterface({
        input: fs.createReadStream(MOTDFile),
      });

      readInterface.on("line", (line) => {
        this.#iRCd.Config.MOTDLines.push(line);
      });
    });

    this.#config.on("clientListenerAdded", (ClientListener) => {
      this.#iRCd.NetworkManager.addListener(
        ClientListener.Hostname,
        ClientListener.Port
      );
    });

    this.#config.on("serverName", (serverName) => {
      // Server names cannot be modified on a configuration reload.
      this.#iRCd.Config.ServerName = serverName;
    });
  }

  parseCommandLineOptions() {
    program.version("0.0.1");

    program
      .option(
        "-c, --config_file <file>",
        "specify configuration file (default is `nodeircd.json`)"
      )
      .option(
        "-n, --nofork",
        "do not fork into the background, dumps log output to stdout"
      );

    program.parse(process.argv);
  }
}

new Application();

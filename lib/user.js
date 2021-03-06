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

const assert = require("assert");
const configuration = require("./config");
const Logger = require("./logger");

// Defines the structure of a user.
class User {
  #socket;

  // This field governs whether or not a user is considered registered to the
  // network. A user is considered registered to the network after `NICK` and
  // `USER` commands were received by the user and successfully processed.
  #registered = false;

  // Current nickname of the user.
  #nickname = "*";

  // The username of the user. The username is not the same as the nickname,
  // it can only be set once as part of the client introduction and it forms
  // part of the resulting hostname.
  //
  // e.g. if the username passed in the `USER` command was `alyx`, and their
  // nickname is `netz`, and their IP address is `172.217.7.206`, then the
  // resulting hostname is `alyx!netz@172.217.7.206`.
  #username = "";

  // The real name of the user. This may only be set once as part of the
  // client introduction.
  #realname = "";

  constructor(Socket) {
    this.#socket = Socket;
  }

  RPL_MOTDSTART(ServerName) {
    return [375, `:- ${ServerName} Message of the day -`];
  }
  RPL_MOTD(Text) {
    return [372, `:- ${Text}`];
  }
  RPL_ENDOFMOTD() {
    return [376, ":End of /MOTD command"];
  }

  // Server's MOTD file could not be opened by the server.
  ERR_NOMOTD() {
    return [422, ":MOTD File is missing"];
  }

  // Returns `true` if the user is registered to the network, or `false`
  // otherwise.
  isRegistered() {
    return this.#registered;
  }

  // Returns the current nickname.
  getNickname() {
    return this.#nickname;
  }

  // Returns the user's username.
  getUsername() {
    return this.#username;
  }

  // Returns the user's real name.
  getRealname() {
    return this.#realname;
  }

  sendVersion() {}

  // Sends the Message of the Day (MOTD) to the user, if present.
  sendMOTD() {
    if (configuration.MOTDLines.length == 0) {
      this.sendNumeric(this.ERR_NOMOTD);
      return;
    }

    this.sendNumeric(this.RPL_MOTDSTART, configuration.ServerName);

    configuration.MOTDLines.forEach((Line) => {
      this.sendNumeric(this.RPL_MOTD, Line);
    });
    this.sendNumeric(this.RPL_ENDOFMOTD);
  }

  // Sends information to the user after the user has been registered to the
  // network.
  sendWelcome() {
    // Upon connecting to an IRC server, a client is sent the MOTD
    // (if present) as well as the current user/server count (as per the
    // LUSER command). The server is also required to give an unambiguous
    // message to the client which states its name and version as well as
    // any other introductory messages which may be deemed appropriate.
    //
    // XXX: These events seem to only happen after the client has been
    // registered.
    this.sendVersion();
    this.sendMOTD();
  }

  // Registers the user to the network.
  Register() {
    this.#registered = true;
    Logger.debug(`user ${this.#nickname} registered`);
    this.sendWelcome();
  }

  // Sets the user's nickname. This function does not determine if `Nickname`
  // is valid, it is up to commands to verify that the nickname passed is
  // valid.
  setNickname(Nickname) {
    this.#nickname = Nickname;
  }

  // Sets the user's username. A user's username can only be set once.
  setUsername(Username) {
    assert(!this.#username);
    this.#username = Username;
  }

  // Sets the user's real name. A user's real name can only be set once.
  setRealname(Realname) {
    assert(!this.#realname);
    this.#realname = Realname;
  }

  // Sends a numeric reply to the user.
  //
  // The `NumericFunc` must return the [numeric, and a string] as an array.
  // Arbitrary arguments for `NumericFunc` are passed here as a syntactic
  // sugar.
  //
  // XXX: I kind of think this might be a dumb idea...
  sendNumeric(NumericFunc, ...Args) {
    const [Numeric, String] = NumericFunc(Args);
    this.#socket.write(`${Numeric} ${this.#nickname} ${String}\r\n`);
  }
}

module.exports = User;

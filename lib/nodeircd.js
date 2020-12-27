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

const NetworkManager = require('./network');
const Logger = require('./logger');
const User = require('./user');

// Core commands
const NICKCommand = require('./command/nick');
const USERCommand = require('./command/user');

// Defines the master server object. This essentially governs control of the
// entire application.
class NodeIRCd
{
    NetworkManager = new NetworkManager();

    #Channels = new Map();
    #Users    = new Map();
    #Commands = new Map();

    constructor()
    {
        this.addCoreCommands();
        this.connectNetworkManagerEvents();
        Logger.info('nodeircd initialized');
    }

    // Returned to a registered client to indicate that the command sent is unknown
    // by the server.
    ERR_UNKNOWNCOMMAND(Command)
    {
        return [421, `${Command} :Unknown command`];
    }

    addCoreCommands()
    {
        this.#Commands.set('NICK', NICKCommand);
        this.#Commands.set('USER', USERCommand);
    }

    connectNetworkManagerEvents()
    {
        this.NetworkManager.on('clientConnected', (Socket) =>
        {
            this.#Users.set(Socket, new User(Socket));
            Logger.debug('client connected');
        });

        this.NetworkManager.on('clientDisconnected', (Socket) =>
        {
            this.#Users.delete(Socket);
            Logger.debug('client disconnected');
        });

        this.NetworkManager.on('clientSentData', (Socket, Data) =>
        {
            const IRCString = Data.split(' ');
            const UserClient = this.#Users.get(Socket);

            const Command = IRCString[0];

            if (!this.#Commands.has(Command))
            {
                if (UserClient.isRegistered())
                {
                    UserClient.sendNumeric(ERR_UNKNOWNCOMMAND, Command);
                }
            }
            else
            {
                const CmdFunc = this.#Commands.get(Command);
                CmdFunc(UserClient, IRCString.shift());
            }
        });
    }
};

module.exports = NodeIRCd
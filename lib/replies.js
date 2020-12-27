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

// This module contains functions which help construct numeric response strings
// that are used by multiple commands or server events. They are meant to be
// passed to the `sendNumeric()` method in the `User` class, like so:
//
// const IRCUser = getIRCUserSomehow();
// IRCUser.sendNumeric(ERR_UNKNOWNCOMMAND, "ALYX");
//
// Assuming your nickname is `netz`, this will construct and send
// `:server_hostname 421 netz ALYX :Unknown command` to the client.
//
// All of these numeric responses are defined at
// https://tools.ietf.org/html/rfc1459#section-6.

// Returned by the server to indicate that the client must be registered before
// the server will allow it to be parsed in detail.
function ERR_NOTREGISTERED()
{ return [451, ':You have not registered']; }

// Returned by the server by numerous commands to indicate to the client that
// it didn't supply enough parameters.
function ERR_NEEDMOREPARAMS(Command)
{ return [461, `${Command} :Not enough parameters`]; }

module.exports = {ERR_NOTREGISTERED, ERR_NEEDMOREPARAMS};
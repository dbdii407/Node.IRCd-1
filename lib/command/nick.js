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

const { ERR_NEEDMOREPARAMS } = require("./../replies");

// Returned after receiving a NICK message which contains characters which do
// not fall in the defined set.
function ERR_ERRONEUSNICKNAME(Nickname) {
  return [432, `${Nickname} :Erroneous nickname`];
}

// Handles the `NICK` command.
function NICKCommand(User, Params) {
  if (Params.length == 0) {
    User.sendNumeric(ERR_NEEDMOREPARAMS, "NICK");
    return;
  }

  if (Params[0].length > 9) {
    User.sendNumeric(ERR_ERRONEUSNICKNAME, Params[0]);
    return;
  }
  User.setNickname(Params[0]);

  if (User.getUsername() && User.getRealname()) {
    User.Register();
  }
}

module.exports = NICKCommand;

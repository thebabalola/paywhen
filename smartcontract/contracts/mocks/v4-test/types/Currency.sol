// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

type Currency is address;

using CurrencyLibrary for Currency global;

library CurrencyLibrary {
    function unwrap(Currency currency) internal pure returns (address) {
        return Currency.unwrap(currency);
    }
}

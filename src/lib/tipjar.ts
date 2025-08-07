/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tipjar.json`.
 */
export type Tipjar = {
  "address": "8bfHPDePiZfE8WmqXgxzEbswtZKWyNwViWXHHM3953WY",
  "metadata": {
    "name": "tipjar",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteTipJar",
      "discriminator": [
        64,
        206,
        144,
        144,
        244,
        79,
        222,
        129
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipJar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeTipjar",
      "discriminator": [
        160,
        142,
        83,
        201,
        247,
        52,
        79,
        136
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipJar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "sendTip",
      "discriminator": [
        231,
        88,
        56,
        242,
        241,
        6,
        31,
        59
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipJar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "tip_jar.authority",
                "account": "tipJar"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawTip",
      "discriminator": [
        176,
        197,
        80,
        96,
        56,
        135,
        127,
        154
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipJar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tipJar",
      "discriminator": [
        1,
        2,
        42,
        158,
        102,
        246,
        174,
        210
      ]
    }
  ],
  "events": [
    {
      "name": "tipEvent",
      "discriminator": [
        213,
        36,
        191,
        50,
        28,
        25,
        189,
        252
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notAuthorized",
      "msg": "Not authorized"
    },
    {
      "code": 6001,
      "name": "invalidTipAmount",
      "msg": "Tip amount must be greater than zero"
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in tip jar"
    },
    {
      "code": 6003,
      "name": "tipJarNotEmpty",
      "msg": "Tip jar must be empty before deletion"
    }
  ],
  "types": [
    {
      "name": "tipEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "tipJar",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tipJar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "totalTips",
            "type": "u64"
          },
          {
            "name": "tipCount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

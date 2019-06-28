// require('babel-register')({
//   ignore: /node_modules\/(?!openzeppelin-solidity\/test\/helpers)/
// });
// require('babel-polyfill');

var HDWalletProvider = require("truffle-hdwallet-provider");
// Either use this key or get yours at https://infura.io/signup. It's free.
// https://kovan.infura.io/v3/
var infura_apikey = "";
// use your deployer account's mnemonic
var mnemonic = "";

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: { // ganache by default
            host: "localhost",
            port: 9545,
            gas: 6500000,
            gasPrice: 20000000000,
            // from: "xxxx", // default from account setting
            network_id: "*"
        },
        kovan: {
            //provider: () => new HDWalletProvider(mnemonic, "http://54.68.240.52:6969/child_0"),
            provider: () => new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/4a816cc5b9d34d6ca337b000d9139bd9"),
            //network_id: 2,
            network_id: 42,
            gas: 6500000,
            gasPrice: 1000000000,
        },
        rinkeby: {
            provider: () => new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + infura_apikey),
            network_id: 4,
            gas: 4500000
        },
        live: {}
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    mocha: {
        useColors: true
    },

    // Configure your compilers
  compilers: {
    solc: {
       version: "0.4.24",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
};

/*
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    privateNode: {
      host: '127.0.0.1',
      port: 8501,
      network_id: '*'
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ganache_cli: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  }
};
*/
import 'dotenv/config'
import * as fs from 'fs';
import csv from 'csv-parser'
import pkg from '@pokt-network/pocket-js';
const { Pocket, HttpRpcProvider, CoinDenom } = pkg;

function main() {
    const DISPATCH_URL = new URL(process.env.DISPATCH_URL) || ''
    const POCKET_RPC_URL = new URL(process.env.POCKET_RPC_URL) || ''

    const pocket = new Pocket(DISPATCH_URL, new HttpRpcProvider(POCKET_RPC_URL))

    // You must disable legacyTxCodec
    pocket.configuration.useLegacyTxCodec = false;

    fs.createReadStream('testnet-nodes.csv')
    .pipe(csv())
    .on('data', async function({ privateKey, name }) {
        try {
            const fromAccountPK = Buffer.from(privateKey, "hex");
            const passphrase = "pocket123";

            let account = await pocket.keybase.importAccount(fromAccountPK, passphrase)

            let transactionSender = await pocket.withImportedAccount(account.addressHex, passphrase)
            
            const chainID = process.env.CHAIN_ID || 'testnet'
            
            let rawTxResponse = await transactionSender
                .nodeUnjail(account.addressHex)
                .submit(chainID, "10000", CoinDenom.Upokt, `Unjailing ${chainID} node`)
            
            console.log(`${name} has been unjailed on ${chainID}. TxHash:`, rawTxResponse.hash)
        }
        catch(err) {
            console.log(err)
        }
    })
}

main()
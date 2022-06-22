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
    .on('data', async function({ privateKey, name, port }) {
        try {
            const fromAccountPK = Buffer.from(privateKey, "hex");
            const passphrase = "pocket123";

            let account = await pocket.keybase.importAccount(fromAccountPK, passphrase)

            let transactionSender = await pocket.withImportedAccount(account.addressHex, passphrase)
            
            const chainID = process.env.CHAIN_ID || 'testnet'
            // If the node is already staked, you need to stake more than the actual staking amount.
            const stakeAmount = "15005000000" // 15050 POKT. 
            const serviceURL = new URL(`https://${name}.nodes.pokt.network:${port}`)
            
            let rawTxResponse = await transactionSender
                .nodeStake(account.publicKey, account.addressHex, ["0002"], stakeAmount, serviceURL)
                .submit(chainID, "10000", CoinDenom.Upokt, `Staking ${chainID} node`)
            
            console.log(`${name} has been staked on ${chainID}. TxHash:`, rawTxResponse.hash)
        }
        catch(err) {
            console.log(err)
        }
    })
}

main()
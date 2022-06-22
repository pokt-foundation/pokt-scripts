import 'dotenv/config'
import * as fs from 'fs';
import csv from 'csv-parser'
import pkg from '@pokt-network/pocket-js';
const { Pocket, HttpRpcProvider } = pkg;

async function main() {
    const DISPATCH_URL = new URL(process.env.DISPATCH_URL) || ''
    const POCKET_RPC_URL = new URL(process.env.POCKET_RPC_URL) || ''

    const pocket = new Pocket(DISPATCH_URL, new HttpRpcProvider(POCKET_RPC_URL))

    fs.createReadStream('testnet-nodes.csv')
    .pipe(csv())
    .on('data', async function({ name, address }) {
        try {
            const { node } = await pocket.rpc().query.getNode(address)
            const { serviceURL, stakedTokens, jailed } = node

            console.log(`${name} ${serviceURL} ${stakedTokens} ${jailed}`)
        }
        catch(err) {
            console.log(err)
        }
    })
}

main()
import { toNano } from 'ton-core';
import { Card } from '../wrappers/Card';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const card = provider.open(await Card.fromInit());

    await card.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(card.address);

    // run methods on `card`
}

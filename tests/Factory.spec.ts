import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { sha256_sync } from 'ton-crypto';
import { Factory } from '../wrappers/Factory';
import '@ton-community/test-utils';
import { Card, CreateDeposit, WithdrawOwner, WithdrawUser } from '../wrappers/Card';
import { randomAddress } from '@ton-community/test-utils';
import { before } from 'node:test';

describe('Factory', () => {
    let blockchain: Blockchain;
    let factory: SandboxContract<Factory>;
    let deployer: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        user = await blockchain.treasury('user');
        factory = blockchain.openContract(await Factory.fromInit());
        const deployResult = await factory.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: factory.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    it('should create deposit', async () => {
        const message: CreateDeposit = {
            $$type: 'CreateDeposit',
            amount: toNano('0.2'),
            password: BigInt('0x' + sha256_sync('12345').toString('hex')),
            owner: deployer.address,
        };
        const address = await factory.getAddressByIndexAndOwner(0n, deployer.address);

        const deposit = await factory.send(
            deployer.getSender(),
            {
                value: toNano('0.23'),
            },
            message
        );
        const contract = blockchain.openContract(await Card.fromAddress(address));

        const balance = await contract.getBalance();
        const password = await contract.getPassword();
        expect(password == BigInt('0x' + sha256_sync('12345').toString('hex')));
        expect(toNano(balance) > toNano('0.15'));
    });
});

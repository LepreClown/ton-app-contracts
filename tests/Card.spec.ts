import { Blockchain, SandboxContract, Treasury, TreasuryContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { sha256_sync } from 'ton-crypto';
import { Card, Deposit, WithdrawOwner, WithdrawUser } from '../wrappers/Card';
import '@ton-community/test-utils';
import { rejects } from 'node:assert';

describe('Card', () => {
    let blockchain: Blockchain;
    let card: SandboxContract<Card>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        card = blockchain.openContract(await Card.fromInit(deployer.address, deployer.address, 0n));

        const deployResult = await card.send(
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
            to: card.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {});

    it('should deposit', async () => {
        const message: Deposit = {
            $$type: 'Deposit',
            password: BigInt('0x' + sha256_sync('12345').toString('hex')),
        };

        const deposit = await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );

        expect(deposit.transactions).toHaveTransaction({
            from: deployer.address,
            to: card.address,
            success: true,
        });

        const balance = await card.getBalance();
        const password = await card.getPassword();
        expect(password == BigInt('0x' + sha256_sync('12345').toString('hex')));
        expect(toNano(balance) > toNano('0.15'));
    });
    it('should diposit only one', async () => {
        const message: Deposit = {
            $$type: 'Deposit',
            password: BigInt('0x' + sha256_sync('12345').toString('hex')),
        };

        const deposit = await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );

        expect(deposit.transactions).toHaveTransaction({
            from: deployer.address,
            to: card.address,
            success: true,
        });

        const balance = await card.getBalance();
        const password = await card.getPassword();
        expect(password == BigInt('0x' + sha256_sync('12345').toString('hex')));
        expect(toNano(balance) > toNano('0.15'));

        await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );

        expect(rejects);
    });

    it('should withdrawOwner', async () => {
        const message: WithdrawOwner = {
            $$type: 'WithdrawOwner',
            amount: toNano('0.2'),
        };

        const withdraw = await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );

        expect(withdraw.transactions).toHaveTransaction({
            from: deployer.address,
            to: card.address,
            success: true,
        });

        const balance = await card.getBalance();
        expect(toNano(balance) > toNano('0.15'));
    });
    it('should withdrawUser with password', async () => {
        const message: WithdrawUser = {
            $$type: 'WithdrawUser',
            amount: toNano('0.2'),
            password: '12345',
        };

        const balanceBefore = card.getBalance();

        await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );
        const balanceAfter = card.getBalance();

        const hashPassword = await card.getPassword();
        expect(hashPassword == BigInt('0x' + sha256_sync(message.password).toString('hex')));
        expect(balanceBefore > balanceAfter);
    });
    it('should not withdrawUser without password', async () => {
        const message: WithdrawUser = {
            $$type: 'WithdrawUser',
            amount: toNano('0.2'),
            password: 'string',
        };

        const balanceBefore = card.getBalance();

        await card.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            message
        );
        const balanceAfter = card.getBalance();

        const hashPassword = await card.getPassword();
        expect(hashPassword != BigInt('0x' + sha256_sync(message.password).toString('hex')));
        expect(balanceBefore > balanceAfter);
    });
});

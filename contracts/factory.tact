import "@stdlib/deploy";
import "./card";
import "./messages";

contract Factory with Deployable {
    const minTonForStorage: Int = ton("0.03");
    const gasConsumption: Int = ton("0.03");
    next_deposit_index: Int as uint64 = 0;
    init(){}

    receive(msg: CreateDeposit){
        require(msg.amount >= 0, "Deposit amount must be greater than 0");
        let deposit_init: StateInit = initOf Card(sender(), myAddress(), self.next_deposit_index);
        self.next_deposit_index = self.next_deposit_index + 1;
        send(SendParameters{to: contractAddress(deposit_init),
                value: 0,
                body: Deposit{password: msg.password}.toCell(),
                mode: SendRemainingBalance + SendIgnoreErrors,
                code: deposit_init.code,
                data: deposit_init.data
            }
        );
    }

    get fun depositIndex(): Int {
        return self.next_deposit_index;
    }

    get fun addressByIndexAndOwner(item_index: Int, owner: Address): Address {
        let initCode: StateInit = initOf Card(owner, myAddress(), item_index);
        return contractAddress(initCode);
    }
}
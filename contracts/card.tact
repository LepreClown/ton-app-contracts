import "@stdlib/ownable";
import "@stdlib/deploy";
import "./messages";

contract Card with Deployable, Ownable {
    const MinTonForStorage: Int = ton("0.01");
    owner: Address;
    from: Address;
    item: Int as uint64;
    password: Int as uint256;
    init(owner: Address, from: Address, next_item: Int){
        self.from = from;
        self.item = next_item;
        self.owner = owner;
        self.password = 0;
    }

    receive(msg: Deposit){
        require(self.password == 0, "Password is installed");
        self.password = msg.password;
    }

    receive(msg: WithdrawUser){
        require(sha256(msg.password) == self.password, "Not corect password");
        if (msg.amount != 0) {
            send(SendParameters{to: sender(),
                    bounce: true,
                    value: msg.amount,
                    mode: SendRemainingValue + SendIgnoreErrors
                }
            );
        } else {
            send(SendParameters{to: sender(),
                    bounce: true,
                    value: msg.amount,
                    mode: SendRemainingBalance + SendIgnoreErrors
                }
            );
        }
    }

    receive(msg: WithdrawOwner){
        self.requireOwner();
        if (msg.amount != 0) {
            send(SendParameters{to: sender(),
                    bounce: true,
                    value: msg.amount,
                    mode: SendRemainingValue + SendIgnoreErrors
                }
            );
        } else {
            send(SendParameters{to: sender(),
                    bounce: true,
                    value: msg.amount,
                    mode: SendRemainingBalance + SendIgnoreErrors
                }
            );
        }
    }

    get fun password(): Int {
        return self.password;
    }

    get fun cardByIndex(): Int {
        return self.item;
    }

    get fun balance(): String {
        return myBalance().toCoinsString();
    }

    get fun addressContract(): Address {
        return myAddress();
    }
}
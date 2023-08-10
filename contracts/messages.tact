message WithdrawOwner {
    amount: Int as coins;
}
message WithdrawUser {
    amount: Int as coins;
    password: String;
}
message Deposit {
    password: Int as uint256;
}
message CreateDeposit {
    password: Int as uint256;
    amount: Int as coins;
    owner: Address;
}
pragma solidity ^0.4.17;


contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    modifier managerOnly() {
        require(msg.sender == manager);
        _;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);

        players.push(msg.sender);
    }

    function random() public view returns (uint256) {
        return uint256(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public managerOnly {
        //choose a winner at random
        uint256 index = random() % players.length;

        //transfer all the money in the accnt address to the winner
        players[index].transfer(this.balance);

        //empty out the players array
        players = new address[](0); //by reinitializind it as a new dynamic array (of length 0 at first)
    }

    function showPlayers() public view returns (address[]) {
        return players;
    }
}

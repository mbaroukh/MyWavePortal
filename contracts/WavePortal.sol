// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;        
    }
    uint256 private seed;
    Wave[] private waves;
    uint256 nbWaves;
    mapping(address => uint256) usersLastWave;
 
    event NewWave(address indexed from, uint256 timestamp, string message);
 
    constructor() payable {
        console.log("Wave smart contract ready !");
        seed = block.timestamp + block.difficulty;
    }

    function wave(string memory _message) public {
        uint256 idx = usersLastWave[msg.sender];
        if (idx>0) {
            console.log("block = %s, wave = %s", block.timestamp, waves[idx-1].timestamp);
            require(
                ( waves[idx-1].timestamp + 30 seconds ) < block.timestamp,
                string(abi.encodePacked("wait 30 seconds for msg \"", _message, "\""))
            );
        } else {
            console.log("%s has not waved for now", msg.sender);
        }

        Wave memory newwave = Wave(msg.sender, _message, block.timestamp);
        waves.push(newwave);
        nbWaves++;
        usersLastWave[msg.sender]=waves.length;
        emit NewWave(msg.sender, newwave.timestamp, newwave.message);
        console.log("%s has waved \"%s\"!", msg.sender, _message);

        seed = (block.timestamp + block.difficulty + seed ) % 100;
        if (seed < 50) {
            console.log("Randomness spoke : %s will have some reward!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
    }

    function unwaveLast() public {
        uint256 idx = usersLastWave[msg.sender];
        if (idx==0) {
            console.log("No wave for user %s !", msg.sender);
            return;
        }
        nbWaves--;
        usersLastWave[msg.sender]=0;
        delete waves[idx-1];
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", nbWaves);
        return nbWaves;
    }

    function getMyLastWave() public view returns (string memory) {
        uint256 idx = usersLastWave[msg.sender];
        if (idx==0) {
            console.log("No wave for user %s !", msg.sender);
            return "";
        }
        return waves[idx-1].message;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

}

// 0x5FbDB2315678afecb367f032d93F642f64180aa3
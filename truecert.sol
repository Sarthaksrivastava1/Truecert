// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LimitedIPFSDataStorage {

    struct DataEntry {
        uint256 id;
        address addedBy;
        uint256 timestamp;
        string field1;
        string field2;
        string field3;
        string ipfsUri;
    }

    address[4] public allowedUsers;
    uint256 public dataCount;
    mapping(uint256 => DataEntry) public dataEntries;

    event DataAdded(uint256 indexed id, address indexed addedBy, uint256 timestamp, string ipfsUri);

    constructor(address[4] memory _users) {
        allowedUsers = _users;
    }

    modifier onlyAllowed() {
        bool allowed = false;
        for (uint i = 0; i < allowedUsers.length; i++) {
            if (msg.sender == allowedUsers[i]) {
                allowed = true;
                break;
            }
        }
        require(allowed, "Not authorized to add data");
        _;
    }

    function addData(
        string memory _field1,
        string memory _field2,
        string memory _field3,
        string memory _ipfsUri
    ) public onlyAllowed returns (uint256) {
        dataCount++;
        dataEntries[dataCount] = DataEntry(
            dataCount,
            msg.sender,
            block.timestamp,
            _field1,
            _field2,
            _field3,
            _ipfsUri
        );

        emit DataAdded(dataCount, msg.sender, block.timestamp, _ipfsUri);
        return dataCount;
    }

    function getData(uint256 _id) public view returns (
        uint256,
        address,
        uint256,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        DataEntry memory entry = dataEntries[_id];
        return (
            entry.id,
            entry.addedBy,
            entry.timestamp,
            entry.field1,
            entry.field2,
            entry.field3,
            entry.ipfsUri
        );
    }

    function getAllowedUsers() public view returns (address[4] memory) {
        return allowedUsers;
    }
}

pragma solidity ^0.8.0;

import "./CloneFactory.sol";
import "../utils/IReferenceERC721.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract ERC721Factory is CloneFactory, Ownable {
    event ERC721Created(address indexed sender, address indexed owner, address indexed contractAddress);

    mapping(uint256 => address) public contractVersions;
    uint public versionCount = 0;

    function createERC721(address _user, uint256 _version, string memory _name, string memory _symbol, uint256 maxNFTs) public returns (address _contract) {
        require(contractVersions[_version] != address(0), "Invalid version supplied");
        _contract = createClone(contractVersions[_version]);
        IReferenceERC721(_contract).initialize(_user, _name, _symbol, maxNFTs);
        emit ERC721Created(msg.sender, _user, _contract);
    }

    function addContractVersion(address _implementation, uint256 _version) public onlyOwner {
        require(contractVersions[_version] == address(0), "Version has already been used");
        require(_implementation != address(0), "Invalid implementation address");
        versionCount++;
        require(_version == versionCount, "Invalid version supplied");
        contractVersions[_version] = _implementation;
    }
}
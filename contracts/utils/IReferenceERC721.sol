pragma solidity ^0.8.0;

interface IReferenceERC721 {
	function initialize(address owner_, string memory name_, string memory symbol_, uint256 maxNFTs) external;

}
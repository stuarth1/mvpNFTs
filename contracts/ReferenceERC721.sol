pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "./utils/ReferenceOwnable.sol";

contract ReferenceERC721 is ERC721Enumerable, ReferenceOwnable {
	using SafeMath for uint256;

	bool private isReference;

	string public _baseTokenURI;
	uint256 public MAX_NFTS;
	string private erc721Name;
	string private erc721Symbol;

	constructor() ERC721("", ""){
		isReference = true;
	}

	function initialize(address owner_, string memory name_, string memory symbol_, uint256 maxNFTs) external {
		require(isReference == false, "Reference contract cannot be initialized");
		require(owner() == address(0), "Contract has already been initialized");
		require(owner_ != address(0), "Owner must be a valid address");
		_owner = owner_;
		erc721Name = name_;
		erc721Symbol = symbol_;
		MAX_NFTS = maxNFTs;
	}

	function transferOwnership(address newOwner) public virtual onlyOwner {
		require(newOwner != address(0), "Ownable: new owner is the zero address");
		require(isReference == false, "Reference contract cannot be initialized");
		_transferOwnership(newOwner);
	}

	function mintNFTs(uint numberOfTokens) public onlyOwner {
			require(MAX_NFTS != 0, "MAX NFTS must be initialized");
			for(uint i = 0; i < numberOfTokens; i++) {
					uint mintIndex = totalSupply();
					if (totalSupply() < MAX_NFTS) {
							_safeMint(msg.sender, mintIndex);
					}
			}
	}

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string memory baseURI) public onlyOwner {
    _baseTokenURI = baseURI;
  }
	
	function name() public view virtual override returns (string memory) {
			return erc721Name;
	}

	function symbol() public view virtual override returns (string memory) {
			return erc721Symbol;
	}
}
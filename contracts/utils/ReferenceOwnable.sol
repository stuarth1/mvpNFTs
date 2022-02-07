pragma solidity ^0.8.0;

contract ReferenceOwnable { 
	address internal _owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  modifier onlyOwner() {
    require(owner() == msg.sender, "ReferenceOwnable: caller is not the owner");
    _;
  }

	function owner() public view virtual returns (address) {
			return _owner;
	}
  function _transferOwnership(address newOwner) internal virtual {
    address oldOwner = _owner;
    _owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }
}
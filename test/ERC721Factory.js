const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');

const DECIMALS = 1000000000000000000; // 1eth
let erc721Factory;
let referenceERC721;
let owner;
let acct1;
let acct2;
let accts;
const provider = waffle.provider;
const sevenDays = 7 * 24 * 60 * 60;

describe('ERC721Factory', function () {
  beforeEach(async function () {
    [owner, acct1, acct2, ...accts] = await ethers.getSigners();
    const ERC721Factory = await ethers.getContractFactory('ERC721Factory');
    erc721Factory = await ERC721Factory.deploy();
    const ReferenceERC721 = await ethers.getContractFactory('ReferenceERC721');
    referenceERC721 = await ReferenceERC721.deploy();
    await erc721Factory.addContractVersion(referenceERC721.address, 1);
    expect(await erc721Factory.contractVersions(1)).to.equal(
      referenceERC721.address
    );
  });

  it('Should be able to create new contract from acct1', async function () {
    const ReferenceERC721 = await ethers.getContractFactory('ReferenceERC721');
    const contractName = 'TestName';
    const contractSymbol = 'TestSymbol';
    const tx = await erc721Factory
      .connect(acct1)
      .createERC721(acct1.address, 1, contractName, contractSymbol, 10);
    const receipt = await tx.wait();
    const contractAddress = receipt.events[0].args.contractAddress;
    const acct1ERC721 = await ReferenceERC721.attach(contractAddress);
    expect(await acct1ERC721.name()).to.equal(contractName);
    expect(await acct1ERC721.symbol()).to.equal(contractSymbol);
    expect(await acct1ERC721.owner()).to.equal(acct1.address);
  });

  it('Should be able to create two new contracts from acct1 and acct2 and have them be unique', async function () {
    const ReferenceERC721 = await ethers.getContractFactory('ReferenceERC721');
    const contractName1 = 'TestName1';
    const contractSymbol1 = 'TestSymbol1';
    const contractName2 = 'TestName2';
    const contractSymbol2 = 'TestSymbol2';
    const tx1 = await erc721Factory
      .connect(acct1)
      .createERC721(acct1.address, 1, contractName1, contractSymbol1, 10);
    const receipt1 = await tx1.wait();
    const contractAddress1 = receipt1.events[0].args.contractAddress;
    const acct1ERC721 = await ReferenceERC721.attach(contractAddress1);
    expect(await acct1ERC721.name()).to.equal(contractName1);
    expect(await acct1ERC721.symbol()).to.equal(contractSymbol1);
    expect(await acct1ERC721.owner()).to.equal(acct1.address);

    const tx2 = await erc721Factory
      .connect(acct2)
      .createERC721(acct2.address, 1, contractName2, contractSymbol2, 15);
    const receipt2 = await tx2.wait();
    const contractAddress2 = receipt2.events[0].args.contractAddress;
    const acct2ERC721 = await ReferenceERC721.attach(contractAddress2);
    expect(await acct2ERC721.name()).to.equal(contractName2);
    expect(await acct2ERC721.symbol()).to.equal(contractSymbol2);
    expect(await acct2ERC721.owner()).to.equal(acct2.address);
  });

  it('Only owner acct1 should be able to mint', async function () {
    const ReferenceERC721 = await ethers.getContractFactory('ReferenceERC721');
    const contractName1 = 'TestName1';
    const contractSymbol1 = 'TestSymbol1';
    const tx1 = await erc721Factory
      .connect(acct1)
      .createERC721(acct1.address, 1, contractName1, contractSymbol1, 10);
    const receipt1 = await tx1.wait();
    const contractAddress1 = receipt1.events[0].args.contractAddress;
    const acct1ERC721 = await ReferenceERC721.attach(contractAddress1);
    await acct1ERC721.connect(acct1).mintNFTs(5);
    expect(await acct1ERC721.totalSupply()).to.equal(5);

    await expect(acct1ERC721.connect(acct2).mintNFTs(3)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );

    await acct1ERC721.connect(acct1).mintNFTs(7);
    expect(await acct1ERC721.totalSupply()).to.equal(10);
  });

  it('Only owner for each contract should be ablet to mint', async function () {
    const ReferenceERC721 = await ethers.getContractFactory('ReferenceERC721');
    const contractName1 = 'TestName1';
    const contractSymbol1 = 'TestSymbol1';
    const contractName2 = 'TestName2';
    const contractSymbol2 = 'TestSymbol2';

    const tx1 = await erc721Factory
      .connect(acct1)
      .createERC721(acct1.address, 1, contractName1, contractSymbol1, 10);
    const receipt1 = await tx1.wait();
    const contractAddress1 = receipt1.events[0].args.contractAddress;
    const acct1ERC721 = await ReferenceERC721.attach(contractAddress1);
    await acct1ERC721.connect(acct1).mintNFTs(5);
    await expect(acct1ERC721.connect(acct2).mintNFTs(3)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );

    const tx2 = await erc721Factory
      .connect(acct2)
      .createERC721(acct2.address, 1, contractName2, contractSymbol2, 15);
    const receipt2 = await tx2.wait();
    const contractAddress2 = receipt2.events[0].args.contractAddress;
    const acct2ERC721 = await ReferenceERC721.attach(contractAddress2);
    await acct2ERC721.connect(acct2).mintNFTs(5);
    await expect(acct2ERC721.connect(acct1).mintNFTs(3)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
  });
});

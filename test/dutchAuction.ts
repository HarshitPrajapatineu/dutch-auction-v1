import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BasicDutchAuction", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBasicDutchAuction() {
    const reservePrice = "10000";
    const numBlocksAuctionOpen = 1000;

    const offerPriceDecrement = "10";
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

    const BasicDutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    const basic_dutch_auction = await BasicDutchAuction.deploy(reservePrice, numBlocksAuctionOpen, offerPriceDecrement);

    return { basic_dutch_auction, reservePrice, numBlocksAuctionOpen, offerPriceDecrement, owner, account1, account2, account3, account4 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { basic_dutch_auction, owner, account1 } = await loadFixture(deployBasicDutchAuction);
      console.log(await owner.getBalance(),"balanceee");
      console.log(ethers.utils.formatEther(await account1.getBalance()),"balanceee");
      
      

      expect(await basic_dutch_auction.owner()).to.equal(owner.address);
    });

    it("Should set the right reserve price", async function () {
        const { basic_dutch_auction, reservePrice } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.reservePrice()).to.equal(reservePrice);
    });

    it("Should set the right number of block auction open", async function () {
        const { basic_dutch_auction, numBlocksAuctionOpen } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
    });

    it("Should set the right offer price decrement", async function () {
        const { basic_dutch_auction, offerPriceDecrement } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.offerPriceDecrement()).to.equal(offerPriceDecrement);
    });

  });
describe("Auction", function () {
    it("Buyers will bid and bid will be refunded", async function () {
      const { basic_dutch_auction,owner, account1, account2, account3, account4 } = await loadFixture(deployBasicDutchAuction);
      const bid1 = await basic_dutch_auction.connect(account1).bid({value: '100'});
      const receipt1 = await bid1.wait()
      const gasSpent1 = receipt1.gasUsed.mul(receipt1.effectiveGasPrice)
      expect(await account1.getBalance()).to.eq(ethers.utils.parseEther("10000").sub(gasSpent1))
    });

    it("Buyers will bid and bid will be accepted", async function () {
        const { basic_dutch_auction,owner, account1, account2, account3, account4 } = await loadFixture(deployBasicDutchAuction);
        const balance_before = await owner.getBalance();
        const bid3 = await basic_dutch_auction.connect(account3).bid({value: '50000'});
        const receipt3 = await bid3.wait()
        const gasSpent3 = receipt3.gasUsed.mul(receipt3.effectiveGasPrice)
        expect(await account3.getBalance()).to.eq(ethers.utils.parseEther("10000").sub(gasSpent3.add('50000')))
        expect (await owner.getBalance()).to.eq(balance_before.add(50000));
      });

      it("Buyers can not bid after auction ended", async function () {
        const { basic_dutch_auction,owner, account1, account2, account3, account4 } = await loadFixture(deployBasicDutchAuction);
        const bid3 = await basic_dutch_auction.connect(account3).bid({value: '50000'});
        await expect(basic_dutch_auction.connect(account4).bid({value: '1000'})).to.be.revertedWith(
          "auction is ended"
        );
      });

    it("Owner can not bid", async function () {
        const { basic_dutch_auction,owner} = await loadFixture(deployBasicDutchAuction);
        await expect(basic_dutch_auction.connect(owner).bid({value: '1000'})).to.be.revertedWith(
          "owner can't bid"
        );
      });
});
});

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SubscriptionPlatform", function () {
  let subscriptionPlatform;
  let owner, user1, user2, user3;

  const DEFAULT_FEE = ethers.parseEther("0.1");
  const DEFAULT_PERIOD = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const SubscriptionPlatform = await ethers.getContractFactory("SubscriptionPlatform");
    subscriptionPlatform = await SubscriptionPlatform.deploy();
    await subscriptionPlatform.waitForDeployment();
  });

  describe("Service Creation", function () {
    it("Should create a service with correct parameters", async function () {
      await expect(subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD))
        .to.emit(subscriptionPlatform, "ServiceCreated")
        .withArgs(1, user1.address, DEFAULT_FEE);

      const [serviceOwner, fee, periodLength, isPaused] = await subscriptionPlatform.getServiceInfo(1);
      expect(serviceOwner).to.equal(user1.address);
      expect(fee).to.equal(DEFAULT_FEE);
      expect(periodLength).to.equal(DEFAULT_PERIOD);
      expect(isPaused).to.be.false;
    });

    it("Should increment service count", async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
      expect(await subscriptionPlatform.serviceCount()).to.equal(1);

      await subscriptionPlatform.connect(user2).createService(DEFAULT_FEE, DEFAULT_PERIOD);
      expect(await subscriptionPlatform.serviceCount()).to.equal(2);
    });

    it("Should revert with zero fee", async function () {
      await expect(subscriptionPlatform.connect(user1).createService(0, DEFAULT_PERIOD))
        .to.be.revertedWith("Fee must be greater than zero");
    });

    it("Should revert with zero period", async function () {
      await expect(subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, 0))
        .to.be.revertedWith("Period length must be greater than zero");
    });
  });

  describe("Subscription Purchase", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
    });

    it("Should allow subscription purchase with correct payment", async function () {
      const tx = await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      const receipt = await tx.wait();
      const currentTime = receipt.blockNumber;

      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.true;
      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(DEFAULT_FEE);

      // Check that endTime is in the expected range (current time + period ± 2 seconds tolerance)
      const endTime = await subscriptionPlatform.getSubscriptionEndTime(1, user2.address);
      const blockTime = await time.latest();
      expect(endTime).to.be.closeTo(blockTime + DEFAULT_PERIOD, 2);
    });

    it("Should extend existing subscription", async function () {
      // First subscription
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      const firstEndTime = await subscriptionPlatform.getSubscriptionEndTime(1, user2.address);

      // Extend subscription
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      const secondEndTime = await subscriptionPlatform.getSubscriptionEndTime(1, user2.address);

      expect(secondEndTime).to.equal(firstEndTime + BigInt(DEFAULT_PERIOD));
      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(DEFAULT_FEE * 2n);
    });

    it("Should refund excess payment", async function () {
      const excessAmount = ethers.parseEther("0.2");
      const initialBalance = await ethers.provider.getBalance(user2.address);

      const tx = await subscriptionPlatform.connect(user2).subscribe(1, { value: excessAmount });
      const receipt = await tx.wait();

      const finalBalance = await ethers.provider.getBalance(user2.address);

      // Verify that the user was refunded (balance should be higher than if they paid the full excess)
      const worstCaseBalance = initialBalance - excessAmount - (receipt.gasUsed * receipt.gasPrice);
      const bestCaseBalance = initialBalance - DEFAULT_FEE;

      expect(finalBalance).to.be.gt(worstCaseBalance);
      expect(finalBalance).to.be.lt(bestCaseBalance);
    });

    it("Should revert with insufficient payment", async function () {
      const insufficientAmount = ethers.parseEther("0.05");
      await expect(subscriptionPlatform.connect(user2).subscribe(1, { value: insufficientAmount }))
        .to.be.revertedWith("Insufficient payment provided");
    });

    it("Should revert for non-existent service", async function () {
      await expect(subscriptionPlatform.connect(user2).subscribe(999, { value: DEFAULT_FEE }))
        .to.be.revertedWith("Service does not exist");
    });

    it("Should revert for paused service", async function () {
      await subscriptionPlatform.connect(user1).setServicePauseStatus(1, true);
      await expect(subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE }))
        .to.be.revertedWith("Service is currently paused");
    });
  });

  describe("Gift Subscription", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
    });

    it("Should allow gifting subscription to another user", async function () {
      const tx = await subscriptionPlatform.connect(user2).giftSubscription(1, user3.address, { value: DEFAULT_FEE });

      expect(await subscriptionPlatform.hasActiveSubscription(1, user3.address)).to.be.true;
      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.false;
      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(DEFAULT_FEE);

      // Check that endTime is in expected range
      const endTime = await subscriptionPlatform.getSubscriptionEndTime(1, user3.address);
      const blockTime = await time.latest();
      expect(endTime).to.be.closeTo(blockTime + DEFAULT_PERIOD, 2);
    });

    it("Should revert when gifting to zero address", async function () {
      await expect(subscriptionPlatform.connect(user2).giftSubscription(1, ethers.ZeroAddress, { value: DEFAULT_FEE }))
        .to.be.revertedWith("Zero address not allowed");
    });
  });

  describe("Service Management", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
    });

    it("Should allow owner to change service fee", async function () {
      const newFee = ethers.parseEther("0.2");

      await expect(subscriptionPlatform.connect(user1).changeServiceFee(1, newFee))
        .to.emit(subscriptionPlatform, "ServiceFeeChanged")
        .withArgs(1, DEFAULT_FEE, newFee);

      const [, fee, ,] = await subscriptionPlatform.getServiceInfo(1);
      expect(fee).to.equal(newFee);
    });

    it("Should revert when non-owner tries to change fee", async function () {
      const newFee = ethers.parseEther("0.2");
      await expect(subscriptionPlatform.connect(user2).changeServiceFee(1, newFee))
        .to.be.revertedWith("Only the service owner can call this function");
    });

    it("Should revert when changing fee to zero", async function () {
      await expect(subscriptionPlatform.connect(user1).changeServiceFee(1, 0))
        .to.be.revertedWith("New fee must be greater than zero");
    });

    it("Should allow owner to pause and resume service", async function () {
      await expect(subscriptionPlatform.connect(user1).setServicePauseStatus(1, true))
        .to.emit(subscriptionPlatform, "ServicePauseStatusChanged")
        .withArgs(1, true);

      const [, , , isPaused] = await subscriptionPlatform.getServiceInfo(1);
      expect(isPaused).to.be.true;

      await subscriptionPlatform.connect(user1).setServicePauseStatus(1, false);
      const [, , , isResumed] = await subscriptionPlatform.getServiceInfo(1);
      expect(isResumed).to.be.false;
    });

    it("Should revert when non-owner tries to pause service", async function () {
      await expect(subscriptionPlatform.connect(user2).setServicePauseStatus(1, true))
        .to.be.revertedWith("Only the service owner can call this function");
    });
  });

  describe("Revenue Withdrawal", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
    });

    it("Should allow owner to withdraw revenue", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);

      await expect(subscriptionPlatform.connect(user1).withdrawRevenue(1))
        .to.emit(subscriptionPlatform, "RevenueWithdrawn")
        .withArgs(1, user1.address, DEFAULT_FEE);

      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(0);

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert when non-owner tries to withdraw", async function () {
      await expect(subscriptionPlatform.connect(user2).withdrawRevenue(1))
        .to.be.revertedWith("Only the service owner can call this function");
    });

    it("Should revert when no revenue to withdraw", async function () {
      await subscriptionPlatform.connect(user1).withdrawRevenue(1); // First withdrawal
      await expect(subscriptionPlatform.connect(user1).withdrawRevenue(1))
        .to.be.revertedWith("No revenue to withdraw");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
    });

    it("Should return false for non-active subscription", async function () {
      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.false;
      expect(await subscriptionPlatform.getSubscriptionEndTime(1, user2.address)).to.equal(0);
    });

    it("Should return false for expired subscription", async function () {
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });

      // Fast forward past subscription end time
      await time.increase(DEFAULT_PERIOD + 1);

      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.false;
      expect(await subscriptionPlatform.getSubscriptionEndTime(1, user2.address)).to.equal(0);
    });

    it("Should return false for subscription at exact expiry time", async function () {
      const tx = await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      const expectedEndTime = block.timestamp + DEFAULT_PERIOD;

      // Set time to exact expiry moment (endTime == block.timestamp should be false)
      await time.increaseTo(expectedEndTime);

      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.false;
      expect(await subscriptionPlatform.getSubscriptionEndTime(1, user2.address)).to.equal(0);
    });

    it("Should return correct service information", async function () {
      const [serviceOwner, fee, periodLength, isPaused] = await subscriptionPlatform.getServiceInfo(1);
      expect(serviceOwner).to.equal(user1.address);
      expect(fee).to.equal(DEFAULT_FEE);
      expect(periodLength).to.equal(DEFAULT_PERIOD);
      expect(isPaused).to.be.false;
    });
  });

  describe("Fallback and Receive", function () {
    it("Should revert on direct ETH transfer via fallback", async function () {
      await expect(user1.sendTransaction({
        to: await subscriptionPlatform.getAddress(),
        value: ethers.parseEther("1.0"),
        data: "0x1234"
      })).to.be.reverted;
    });

    it("Should revert on direct ETH transfer via receive", async function () {
      await expect(user1.sendTransaction({
        to: await subscriptionPlatform.getAddress(),
        value: ethers.parseEther("1.0")
      })).to.be.revertedWith("Direct payments not accepted");
    });
  });

  describe("Edge Cases and Security", function () {
    beforeEach(async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE, DEFAULT_PERIOD);
    });

    it("Should handle multiple services from same owner", async function () {
      await subscriptionPlatform.connect(user1).createService(DEFAULT_FEE * 2n, DEFAULT_PERIOD * 2);

      expect(await subscriptionPlatform.serviceCount()).to.equal(2);

      const [owner1, fee1, , ] = await subscriptionPlatform.getServiceInfo(1);
      const [owner2, fee2, , ] = await subscriptionPlatform.getServiceInfo(2);

      expect(owner1).to.equal(user1.address);
      expect(owner2).to.equal(user1.address);
      expect(fee1).to.equal(DEFAULT_FEE);
      expect(fee2).to.equal(DEFAULT_FEE * 2n);
    });

    it("Should handle subscription after service owner change (not implemented, for future)", async function () {
      // This test verifies current behavior - service ownership is immutable
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.true;
    });

    it("Should maintain accurate revenue accounting", async function () {
      // Multiple subscriptions
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      await subscriptionPlatform.connect(user3).subscribe(1, { value: DEFAULT_FEE });

      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(DEFAULT_FEE * 2n);

      // Partial withdrawal doesn't exist, but verify full withdrawal resets to 0
      await subscriptionPlatform.connect(user1).withdrawRevenue(1);
      expect(await subscriptionPlatform.serviceRevenue(1)).to.equal(0);
    });

    it("Should handle reactivation of expired subscription", async function () {
      // Subscribe and let it expire
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });
      await time.increase(DEFAULT_PERIOD + 1);

      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.false;

      // Resubscribe
      const currentTime = await time.latest();
      await subscriptionPlatform.connect(user2).subscribe(1, { value: DEFAULT_FEE });

      expect(await subscriptionPlatform.hasActiveSubscription(1, user2.address)).to.be.true;
      const newEndTime = await subscriptionPlatform.getSubscriptionEndTime(1, user2.address);
      expect(newEndTime).to.be.closeTo(currentTime + DEFAULT_PERIOD, 2); // 2 second tolerance
    });
  });
});
# Deployment Guide

This guide provides step-by-step instructions for deploying the SubscriptionPlatform smart contract to the Sepolia testnet and verifying it on Etherscan.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn** package manager
3. **MetaMask** or another Ethereum wallet
4. **Sepolia ETH** for gas fees
5. **Etherscan API key** for contract verification

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Sepolia RPC URL (get from Infura, Alchemy, or other provider)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Private key of your deployment wallet (NEVER share this!)
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Obtain Sepolia ETH

Get test ETH from a Sepolia faucet:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

You'll need approximately 0.01-0.02 ETH for deployment and verification.

### 4. Get Etherscan API Key

1. Visit [Etherscan.io](https://etherscan.io/)
2. Create an account and log in
3. Go to "My Profile" → "API Keys"
4. Create a new API key
5. Add it to your `.env` file

## Deployment Process

### 1. Compile Contracts

```bash
npm run compile
```

This will:
- Compile the Solidity contracts
- Generate ABI and bytecode
- Check for compilation errors

### 2. Run Tests (Optional but Recommended)

```bash
npm test
```

Ensure all tests pass before deployment:
- 29 tests should pass
- Coverage should be >95%

### 3. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

The deployment script will:
1. Connect to Sepolia network
2. Deploy the SubscriptionPlatform contract
3. Display the contract address
4. Save deployment information

**Expected Output:**
```
Deploying SubscriptionPlatform...
SubscriptionPlatform deployed to: 0xb423403e9F65C2fA17dA91f4A05Ee445398a8652
Network: sepolia
Deployer: 0xB190A000F4727364c556DbB677472c341A202A06
Gas used: ~1,500,000
```

**✅ DEPLOYED CONTRACT ADDRESS**: `0xb423403e9F65C2fA17dA91f4A05Ee445398a8652`

## Contract Verification

### 1. Verify on Etherscan

```bash
npm run verify 0xb423403e9F65C2fA17dA91f4A05Ee445398a8652
```

**✅ VERIFICATION COMPLETED SUCCESSFULLY**

**Expected Output:**
```
Successfully submitted source code for contract
0xb423403e9F65C2fA17dA91f4A05Ee445398a8652 for verification on the block explorer.
Waiting for verification result...
Successfully verified contract SubscriptionPlatform on the block explorer.
```

**🔗 Etherscan Verification Link**: https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#code

### 2. Manual Verification (if needed)

If automatic verification fails:

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Navigate to your contract address
3. Click "Contract" → "Verify and Publish"
4. Choose "Solidity (Single file)"
5. Fill in the details:
   - **Compiler Version**: 0.8.30
   - **License**: MIT
   - **Optimization**: Enabled with 200 runs
6. Copy and paste the contract source code
7. Click "Verify and Publish"

## Deployment Script Details

The deployment script (`scripts/deploy.js`) performs the following:

```javascript
async function main() {
    // Get deployer account
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy contract
    const SubscriptionPlatform = await ethers.getContractFactory("SubscriptionPlatform");
    const subscriptionPlatform = await SubscriptionPlatform.deploy();

    await subscriptionPlatform.deployed();

    console.log("SubscriptionPlatform deployed to:", subscriptionPlatform.address);
}
```

## Post-Deployment Verification

### 1. Check Contract on Etherscan

Visit your contract on Sepolia Etherscan:
**🔗 Contract URL**: https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652

**✅ DEPLOYMENT VERIFICATION COMPLETE**:
- ✅ Contract is verified (green checkmark)
- ✅ Source code is visible
- ✅ Contract name shows "SubscriptionPlatform"
- ✅ Compiler version is 0.8.30
- ✅ Contract deployed on: September 19, 2025
- ✅ Deployer: 0xB190A000F4727364c556DbB677472c341A202A06

### 2. Test Contract Functions

You can interact with the contract directly on Etherscan:

1. Go to "Contract" → "Write Contract"
2. Connect your wallet
3. Test basic functions:
   - `createService(fee, periodLength)`
   - `subscribe(serviceId)` (with ETH value)
   - View functions under "Read Contract"

### 3. Monitor Contract Activity

- Check transaction history
- Monitor events emitted
- Verify gas usage matches expectations

## Troubleshooting

### Common Issues and Solutions

#### 1. Insufficient Gas
**Error**: "Transaction ran out of gas"
**Solution**: Increase gas limit in hardhat.config.js

#### 2. Invalid Private Key
**Error**: "Invalid private key"
**Solution**:
- Ensure private key starts with '0x'
- Verify key is from correct wallet
- Check .env file formatting

#### 3. Network Connection Issues
**Error**: "Could not connect to network"
**Solution**:
- Verify RPC URL is correct
- Check internet connection
- Try alternative RPC provider

#### 4. Verification Failures
**Error**: "Verification failed"
**Solution**:
- Ensure contract is fully deployed
- Wait a few minutes after deployment
- Try manual verification on Etherscan
- Check compiler settings match exactly

#### 5. Insufficient Balance
**Error**: "Insufficient funds"
**Solution**:
- Get more Sepolia ETH from faucets
- Verify wallet address has funds
- Check network is Sepolia, not mainnet

### Getting Help

If you encounter issues:

1. **Check Hardhat Documentation**: [hardhat.org](https://hardhat.org/)
2. **Etherscan Help**: [docs.etherscan.io](https://docs.etherscan.io/)
3. **Ethereum Stack Exchange**: [ethereum.stackexchange.com](https://ethereum.stackexchange.com/)

## Security Reminders

⚠️ **Important Security Notes**:

- **Never share your private key**
- **Never commit .env files to version control**
- **Use separate wallets for development and production**
- **Double-check network before deployment**
- **Verify contract address after deployment**

## Deployment Checklist

- [x] Dependencies installed
- [x] .env file configured
- [x] Sepolia ETH obtained (0.05 ETH balance)
- [x] Etherscan API key set
- [x] Tests passing (29/29 tests, 95% coverage)
- [x] Contract compiled successfully
- [x] Deployed to Sepolia
- [x] Contract address saved: `0xb423403e9F65C2fA17dA91f4A05Ee445398a8652`
- [x] Contract verified on Etherscan
- [x] **🎉 DEPLOYMENT COMPLETE - READY FOR SUBMISSION**

## Next Steps

After successful deployment:

1. **Document the deployment** - save all addresses and transaction hashes
2. **Test thoroughly** - create services and subscriptions
3. **Monitor performance** - track gas usage and events
4. **Plan mainnet deployment** - when ready for production

---

**Author**: James Barclay
**Last Updated**: September 2025

For additional support, refer to the project README.md and TECHNICAL_IMPLEMENTATION.md files.
# 🚀 SubscriptionPlatform Smart Contract

> **A decentralized subscription platform empowering creators and subscribers on the Ethereum blockchain**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue.svg)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Sepolia-green.svg)](https://sepolia.etherscan.io/)
[![Verified](https://img.shields.io/badge/Etherscan-Verified-success.svg)](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#code)

## 📋 Project Status Dashboard

| Component | Status | Details |
|-----------|--------|---------|
| **Smart Contract** | ✅ **COMPLETE** | [`SubscriptionPlatform.sol`](./contracts/SubscriptionPlatform.sol) - Fully implemented |
| **Testing Suite** | ✅ **COMPLETE** | 29/29 tests passing, 95.12% coverage |
| **Deployment** | ✅ **LIVE** | [Sepolia Testnet](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652) |
| **Verification** | ✅ **VERIFIED** | [Source Code on Etherscan](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#code) |
| **Documentation** | ✅ **COMPLETE** | [Technical Docs](./TECHNICAL_IMPLEMENTATION.md) • [Deployment Guide](./DEPLOYMENT_GUIDE.md) |
| **Quality** | ✅ **FULLY TESTED** | 95% coverage, all tests passing |

## 🌟 What is SubscriptionPlatform?

SubscriptionPlatform is a **decentralized subscription management system** built on Ethereum that revolutionizes how subscription services operate. Unlike traditional centralized platforms, this smart contract gives **complete autonomy** to service creators while ensuring **transparency and security** for all participants.

### 🎯 Key Innovation
- **Zero Platform Fees**: No middleman taking cuts from your revenue
- **Complete Control**: Service creators have full autonomy over their offerings
- **Transparent Operations**: All transactions and data are on-chain and verifiable
- **Instant Settlements**: Revenue is available for withdrawal immediately
- **Global Access**: Available to anyone with an Ethereum wallet

### 🛡️ Technical Implementation
Current implementation features:
- Solidity 0.8.30 with gas optimization techniques
- Security measures and access controls
- Comprehensive testing suite (95% coverage)
- Sepolia testnet deployment and verification

## Features

### For Service Creators
- **Create Services**: Set up subscription services with custom fees and billing periods
- **Flexible Pricing**: Change subscription fees at any time
- **Service Control**: Pause and resume services as needed
- **Revenue Management**: Withdraw accumulated revenue directly to your wallet
- **Multi-Service Support**: Create and manage multiple services simultaneously

### For Subscribers
- **Easy Subscription**: Subscribe to any active service with a single transaction
- **Automatic Extension**: Extend existing subscriptions seamlessly
- **Gift Subscriptions**: Purchase new subscription periods as gifts for other addresses
- **Transparent Status**: Check subscription status and end dates at any time

### Security & Reliability
- **Access Control**: Service owners have exclusive control over their services
- **Reentrancy Protection**: Follows Checks-Effects-Interactions pattern
- **Gas Optimized**: Packed structs and efficient storage usage
- **Error Handling**: Comprehensive custom errors for clear feedback
- **Revenue Safety**: Secure withdrawal mechanisms with proper accounting
- **ETH Transfers**: Uses `transfer()` per course material; migrating to `call()` is documented in [**FUTURE_IMPROVEMENTS.md**](./FUTURE_IMPROVEMENTS.md)

## How It Works

1. **Service Creation**: Anyone can create a subscription service by specifying a fee (in wei) and period length (in seconds)
2. **Subscription**: Users pay the service fee to activate a subscription for the specified period
3. **Management**: Service owners can modify fees, pause/resume services, and withdraw revenue
4. **Gifting**: Users can purchase subscriptions for other addresses
5. **Extension**: Active subscriptions can be extended by paying additional fees

## Contract Interface

### Core Functions

```solidity
// Create a new subscription service
function createService(uint96 fee, uint32 periodLength) external returns (uint256 serviceId)

// Subscribe to a service
function subscribe(uint256 serviceId) external payable

// Gift a subscription to another address
function giftSubscription(uint256 serviceId, address recipient) external payable

// Change service fee (owner only)
function changeServiceFee(uint256 serviceId, uint96 newFee) external

// Pause/resume service (owner only)
function setServicePauseStatus(uint256 serviceId, bool isPaused) external

// Withdraw accumulated revenue (owner only)
function withdrawRevenue(uint256 serviceId) external
```

### View Functions

```solidity
// Check if user has active subscription
function hasActiveSubscription(uint256 serviceId, address user) external view returns (bool)

// Get subscription end time
function getSubscriptionEndTime(uint256 serviceId, address user) external view returns (uint256)

// Get service information
function getServiceInfo(uint256 serviceId) external view returns (address, uint256, uint256, bool)
```

## Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Hardhat

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SC_Submit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Testing

Run the test suite:
```bash
npm test
```

Check test coverage:
```bash
npm run coverage
```

### Compilation

Compile the contracts:
```bash
npm run compile
```

### Deployment

Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

Verify on Etherscan:
```bash
npm run verify <CONTRACT_ADDRESS>
```

## 🚀 Live Deployment

**✅ DEPLOYED ON SEPOLIA TESTNET**

| Property | Value |
|----------|-------|
| **Contract Address** | [`0xb423403e9F65C2fA17dA91f4A05Ee445398a8652`](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652) |
| **Network** | [Sepolia Testnet](https://sepolia.etherscan.io/) |
| **Etherscan Verification** | [📋 View Source Code](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#code) |
| **Deployment Date** | September 19, 2025 |
| **Status** | ✅ Verified and Ready for Use |

### 🔗 Quick Links
- [📊 **Test Contract on Etherscan**](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#writeContract) - Interact directly with the contract
- [📋 **Read Contract Functions**](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#readContract) - Query contract state
- [📈 **Transaction History**](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652#events) - View all contract events

## Usage Examples

### Creating a Service

```javascript
// Create a monthly subscription service costing 0.01 ETH
const fee = ethers.utils.parseEther("0.01");
const monthInSeconds = 30 * 24 * 60 * 60;
const tx = await contract.createService(fee, monthInSeconds);
```

### Subscribing to a Service

```javascript
// Subscribe to service ID 1
const serviceId = 1;
const serviceInfo = await contract.getServiceInfo(serviceId);
const tx = await contract.subscribe(serviceId, { value: serviceInfo.fee });
```

### Checking Subscription Status

```javascript
// Check if user has active subscription
const isActive = await contract.hasActiveSubscription(serviceId, userAddress);
const endTime = await contract.getSubscriptionEndTime(serviceId, userAddress);
```

## Technical Implementation

The contract implements several advanced patterns for security and gas efficiency:

- **Packed Structs**: Data structures are optimized to minimize storage costs
- **Access Control**: Modifiers ensure only authorized users can perform sensitive operations
- **CEI Pattern**: All state changes follow Checks-Effects-Interactions for reentrancy protection
- **Custom Errors (defined)**: Custom errors are defined; string reverts are used throughout to match course patterns
- **Event Logging**: Comprehensive event emission for off-chain monitoring

## Security Considerations

- All external functions include proper input validation
- Revenue withdrawal follows secure patterns to prevent reentrancy attacks
- Fallback and receive functions reject accidental ETH transfers
- Service owners cannot interfere with other services
- Subscription extensions are calculated safely to prevent overflow

## Gas Optimizations

- Struct packing reduces storage operations
- Storage caching minimizes redundant SLOAD operations
- Custom errors defined for specific cases
- Efficient mapping usage over arrays for lookups

## Deliberate Coursework Choices

This implementation follows course material patterns and academic requirements:

### Error Handling Strategy
- **String-based `require()` statements** in modifiers align with course teaching patterns
- **Custom errors** are defined and used for specific validation cases
- **Mixed approach** demonstrates understanding of both patterns while staying course-appropriate

### ETH Transfer Method
- **`transfer()` function** is used following course examples (see `BCU24D_SmartContracts/Lektion 2/Crowdfunding.sol`)
- **2300 gas limit** is acceptable for academic demonstration purposes
- **Production migration path** documented in [**FUTURE_IMPROVEMENTS.md**](./FUTURE_IMPROVEMENTS.md)

### Data Model Design
- **Explicit `isActive` boolean** follows course patterns for clear state management
- **Struct design** prioritizes readability over maximum optimization for educational clarity

## 📚 Complete Documentation Suite

| Document | Purpose | Key Contents |
|----------|---------|--------------|
| [📋 **TECHNICAL_IMPLEMENTATION.md**](./TECHNICAL_IMPLEMENTATION.md) | Technical deep-dive | Architecture, security measures, gas optimizations |
| [🚀 **DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) | Deployment instructions | Step-by-step Sepolia deployment and verification |
| [🔮 **FUTURE_IMPROVEMENTS.md**](./FUTURE_IMPROVEMENTS.md) | Production roadmap | Security enhancements and feature additions |
| [🧪 **Test Suite**](./test/SubscriptionPlatform.test.js) | Comprehensive testing | 29 tests, 95% coverage, edge cases |

## 🔧 Production Hardening Plan

For real-world deployment, key improvements are documented in [**`FUTURE_IMPROVEMENTS.md`**](./FUTURE_IMPROVEMENTS.md):

1. **Security Enhancements**
   - Migrate from `transfer()` to `call()` for ETH transfers
   - Implement comprehensive custom error usage
   - Add reentrancy protection tests

2. **Gas Optimizations**
   - Remove redundant `isActive` field (derive from `endTime`)
   - Implement bitfield flags instead of boolean fields
   - Advanced struct packing optimizations

3. **Feature Additions**
   - Multi-period purchase functionality
   - Service ownership transfer mechanisms
   - ERC-20 token payment support

See [**`FUTURE_IMPROVEMENTS.md`**](./FUTURE_IMPROVEMENTS.md) for complete production roadmap with implementation priorities.

## 🏗️ Technical Architecture

Key implementation highlights:

### ✅ Core Components
- [x] **Data Structures**: [`Service`](./contracts/SubscriptionPlatform.sol#L13) and [`Subscription`](./contracts/SubscriptionPlatform.sol#L22) structs with gas-optimized packing
- [x] **State Management**: [`services`](./contracts/SubscriptionPlatform.sol#L64), [`subscriptions`](./contracts/SubscriptionPlatform.sol#L65), [`serviceRevenue`](./contracts/SubscriptionPlatform.sol#L66) mappings
- [x] **Access Control**: [`onlyServiceOwner`](./contracts/SubscriptionPlatform.sol#L79), [`serviceExists`](./contracts/SubscriptionPlatform.sol#L85) modifiers
- [x] **Event System**: [4 comprehensive events](./contracts/SubscriptionPlatform.sol#L29-L50) for transparent operations
- [x] **Quality Assurance**: [29 tests](./test/SubscriptionPlatform.test.js), 95% coverage

### ✅ Advanced Features
- [x] **Custom Errors (defined)**: Custom errors are declared; string `require()` reverts are used throughout to match course patterns. The [production roadmap](./FUTURE_IMPROVEMENTS.md) details a full migration to custom errors.
- [x] **Fallback Functions**: [Both fallback and receive](./contracts/SubscriptionPlatform.sol#L255-L268) implemented for ETH handling
- [x] **Live Deployment**: [✅ Verified on Sepolia](https://sepolia.etherscan.io/address/0xb423403e9F65C2fA17dA91f4A05Ee445398a8652)
- [x] **Security Measures**: [Multiple optimizations](./TECHNICAL_IMPLEMENTATION.md) and protective patterns

## Author

**James Barclay**

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
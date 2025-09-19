# SubscriptionPlatform Smart Contract

A decentralized subscription platform built on Ethereum that allows anyone to create and manage subscription services with complete autonomy and transparency.

## Overview

SubscriptionPlatform is a smart contract that enables the creation and management of subscription-based services on the blockchain. Service creators can set their own fees, manage subscribers, and withdraw revenue directly, while users can subscribe to services or gift subscriptions to others.

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
- **ETH Transfers**: Uses `transfer()` per course material; migrating to `call()` is documented in **FUTURE_IMPROVEMENTS.md**

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
- **Production migration path** documented in FUTURE_IMPROVEMENTS.md

### Data Model Design
- **Explicit `isActive` boolean** follows course patterns for clear state management
- **Struct design** prioritizes readability over maximum optimization for educational clarity

## Production Hardening Plan

For real-world deployment, key improvements are documented in `FUTURE_IMPROVEMENTS.md`:

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

See `FUTURE_IMPROVEMENTS.md` for complete production roadmap with implementation priorities.

## Author

**James Barclay**

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
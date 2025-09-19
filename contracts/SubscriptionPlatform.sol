// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title SubscriptionPlatform
/// @notice A platform for creating and managing subscription services
/// @dev Implements multi-service subscription management with owner controls
contract SubscriptionPlatform {

    // === STRUCTS ===

    /// @notice Subscription service information
    /// @dev Packed for gas optimization - fits in 2 storage slots
    struct Service {
        address owner;           // 20 bytes
        uint96 fee;             // 12 bytes - fits with address in 32-byte slot
        uint32 periodLength;    // 4 bytes
        bool isPaused;          // 1 byte
    }

    /// @notice User subscription information
    /// @dev Packed for gas optimization - fits in 1 storage slot
    struct Subscription {
        uint128 endTime;        // 16 bytes - enough for timestamps until year 10^38
        bool isActive;          // 1 byte
    }

    // === EVENTS ===

    /// @notice Emitted when a new service is created
    /// @param serviceId Unique identifier of the service
    /// @param owner Address of the service owner
    /// @param fee Subscription fee in wei
    event ServiceCreated(uint256 indexed serviceId, address indexed owner, uint256 fee);

    /// @notice Emitted when a subscription is purchased or extended
    /// @param serviceId Service being subscribed to
    /// @param subscriber Address of the subscriber
    /// @param endTime New subscription end time
    event SubscriptionPurchased(uint256 indexed serviceId, address indexed subscriber, uint256 endTime);

    /// @notice Emitted when a service is paused or resumed
    /// @param serviceId Service that was paused/resumed
    /// @param isPaused New pause status
    event ServicePauseStatusChanged(uint256 indexed serviceId, bool isPaused);

    /// @notice Emitted when revenue is withdrawn
    /// @param serviceId Service revenue was withdrawn from
    /// @param owner Service owner
    /// @param amount Amount withdrawn
    event RevenueWithdrawn(uint256 indexed serviceId, address indexed owner, uint256 amount);

    // === CUSTOM ERRORS ===

    /// @notice Thrown when caller is not the service owner
    error NotServiceOwner();

    /// @notice Thrown when service does not exist
    error ServiceNotExists();

    /// @notice Thrown when service is paused
    error ServicePaused();

    /// @notice Thrown when insufficient payment provided
    error InsufficientPayment();

    /// @notice Thrown when zero address provided
    error ZeroAddress();

    /// @notice Thrown when invalid parameters provided
    error InvalidParameters();

    // === STATE VARIABLES ===

    /// @notice Counter for generating unique service IDs
    uint256 public serviceCount;

    /// @notice Mapping from service ID to service information
    mapping(uint256 => Service) public services;

    /// @notice Mapping from service ID to user subscriptions
    mapping(uint256 => mapping(address => Subscription)) public subscriptions;

    /// @notice Mapping from service ID to accumulated revenue
    mapping(uint256 => uint256) public serviceRevenue;

    // === CONSTRUCTOR ===

    /// @notice Initialize the SubscriptionPlatform contract
    constructor() {
        // Contract initialization - serviceCount starts at 0
        serviceCount = 0;
    }

    // === MODIFIERS ===

    /// @notice Ensures the caller is the owner of the service
    modifier onlyServiceOwner(uint256 serviceId) {
        require(services[serviceId].owner == msg.sender, "Only the service owner can call this function");
        _;
    }

    /// @notice Ensures the service exists
    modifier serviceExists(uint256 serviceId) {
        require(services[serviceId].owner != address(0), "Service does not exist");
        _;
    }

    /// @notice Ensures the service is not paused
    modifier serviceNotPaused(uint256 serviceId) {
        require(!services[serviceId].isPaused, "Service is currently paused");
        _;
    }

    /// @notice Ensures address is not zero
    modifier validAddress(address addr) {
        require(addr != address(0), "Zero address not allowed");
        _;
    }

    // === EXTERNAL FUNCTIONS ===

    /// @notice Create a new subscription service
    /// @param fee Subscription fee in wei
    /// @param periodLength Length of subscription period in seconds
    /// @return serviceId The ID of the newly created service
    function createService(uint96 fee, uint32 periodLength) external returns (uint256 serviceId) {
        // Checks
        require(fee > 0, "Fee must be greater than zero");
        require(periodLength > 0, "Period length must be greater than zero");

        // Effects
        serviceId = ++serviceCount;
        services[serviceId] = Service({
            owner: msg.sender,
            fee: fee,
            periodLength: periodLength,
            isPaused: false
        });

        // Interactions
        emit ServiceCreated(serviceId, msg.sender, fee);
    }

    /// @notice Purchase or extend a subscription
    /// @param serviceId ID of the service to subscribe to
    function subscribe(uint256 serviceId)
        external
        payable
        serviceExists(serviceId)
        serviceNotPaused(serviceId)
    {
        Service storage service = services[serviceId];

        // Checks
        require(msg.value >= service.fee, "Insufficient payment provided");

        // Effects
        Subscription storage userSubscription = subscriptions[serviceId][msg.sender];
        uint256 newEndTime;

        if (userSubscription.isActive && userSubscription.endTime > block.timestamp) {
            // Extend existing active subscription
            newEndTime = userSubscription.endTime + service.periodLength;
        } else {
            // New subscription or reactivate expired subscription
            newEndTime = block.timestamp + service.periodLength;
            userSubscription.isActive = true;
        }

        userSubscription.endTime = uint128(newEndTime);

        // Assert to ensure revenue accounting is correct (should never fail in normal operation)
        uint256 oldRevenue = serviceRevenue[serviceId];
        serviceRevenue[serviceId] += service.fee;
        assert(serviceRevenue[serviceId] > oldRevenue);

        // Interactions
        emit SubscriptionPurchased(serviceId, msg.sender, newEndTime);

        // Refund excess payment
        if (msg.value > service.fee) {
            payable(msg.sender).transfer(msg.value - service.fee);
        }
    }

    /// @notice Gift a subscription to another address
    /// @param serviceId ID of the service to gift
    /// @param recipient Address to receive the gift subscription
    function giftSubscription(uint256 serviceId, address recipient)
        external
        payable
        serviceExists(serviceId)
        serviceNotPaused(serviceId)
        validAddress(recipient)
    {
        Service storage service = services[serviceId];

        // Checks
        require(msg.value >= service.fee, "Insufficient payment provided");

        // Effects
        Subscription storage recipientSubscription = subscriptions[serviceId][recipient];
        uint256 newEndTime;

        if (recipientSubscription.isActive && recipientSubscription.endTime > block.timestamp) {
            // Extend existing active subscription
            newEndTime = recipientSubscription.endTime + service.periodLength;
        } else {
            // New subscription or reactivate expired subscription
            newEndTime = block.timestamp + service.periodLength;
            recipientSubscription.isActive = true;
        }

        recipientSubscription.endTime = uint128(newEndTime);

        // Assert to ensure revenue accounting is correct (should never fail in normal operation)
        uint256 oldRevenue = serviceRevenue[serviceId];
        serviceRevenue[serviceId] += service.fee;
        assert(serviceRevenue[serviceId] > oldRevenue);

        // Interactions
        emit SubscriptionPurchased(serviceId, recipient, newEndTime);

        // Refund excess payment
        if (msg.value > service.fee) {
            payable(msg.sender).transfer(msg.value - service.fee);
        }
    }

    /// @notice Change the subscription fee for a service
    /// @param serviceId ID of the service
    /// @param newFee New subscription fee in wei
    function changeServiceFee(uint256 serviceId, uint96 newFee)
        external
        onlyServiceOwner(serviceId)
    {
        // Checks
        require(newFee > 0, "New fee must be greater than zero");

        // Effects
        services[serviceId].fee = newFee;
    }

    /// @notice Pause or resume a service
    /// @param serviceId ID of the service
    /// @param isPaused True to pause, false to resume
    function setServicePauseStatus(uint256 serviceId, bool isPaused)
        external
        onlyServiceOwner(serviceId)
    {
        // Effects
        services[serviceId].isPaused = isPaused;

        // Interactions
        emit ServicePauseStatusChanged(serviceId, isPaused);
    }

    /// @notice Withdraw accumulated revenue from a service
    /// @param serviceId ID of the service
    function withdrawRevenue(uint256 serviceId)
        external
        onlyServiceOwner(serviceId)
    {
        uint256 amount = serviceRevenue[serviceId];

        // Checks
        require(amount > 0, "No revenue to withdraw");

        // Effects (CEI pattern - effects before interactions)
        serviceRevenue[serviceId] = 0;

        // Interactions
        emit RevenueWithdrawn(serviceId, msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    // === VIEW FUNCTIONS ===

    /// @notice Check if an address has an active subscription
    /// @param serviceId ID of the service
    /// @param user Address to check
    /// @return True if user has active subscription
    function hasActiveSubscription(uint256 serviceId, address user)
        external
        view
        returns (bool)
    {
        Subscription storage userSubscription = subscriptions[serviceId][user];
        return userSubscription.isActive && userSubscription.endTime > block.timestamp;
    }

    /// @notice Get subscription end time for an address
    /// @param serviceId ID of the service
    /// @param user Address to check
    /// @return endTime End time of subscription (0 if no active subscription)
    function getSubscriptionEndTime(uint256 serviceId, address user)
        external
        view
        returns (uint256 endTime)
    {
        Subscription storage userSubscription = subscriptions[serviceId][user];
        if (userSubscription.isActive && userSubscription.endTime > block.timestamp) {
            return userSubscription.endTime;
        }
        return 0;
    }

    /// @notice Get service information
    /// @param serviceId ID of the service
    /// @return owner Service owner address
    /// @return fee Subscription fee
    /// @return periodLength Period length in seconds
    /// @return isPaused Whether service is paused
    function getServiceInfo(uint256 serviceId)
        external
        view
        returns (address owner, uint256 fee, uint256 periodLength, bool isPaused)
    {
        Service storage service = services[serviceId];
        return (service.owner, service.fee, service.periodLength, service.isPaused);
    }

    // === FALLBACK FUNCTION ===

    /// @notice Fallback function that reverts to prevent accidental ETH sends
    fallback() external {
        revert("Direct payments not accepted");
    }

    /// @notice Receive function that reverts to prevent accidental ETH sends
    receive() external payable {
        revert("Direct payments not accepted");
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrganicTraceability {
    // Enum to manage the lifecycle of the product
    enum Status { Harvested, Certified, Processed, InTransit, Delivered }

    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        Status status;
        bool isOrganic;
        uint256 timestamp;
        string metadataURI; // Link to IPFS or detailed producer data
    }

    // Database of products: ProductID => Product Details
    mapping(uint256 => Product) public products;
    uint256 public productCount;

    // Events for the Backend/Frontend to track
    event ProductCreated(uint256 id, string name, address producer);
    event StatusUpdated(uint256 id, Status status, address updatedBy);

    // Modifier to ensure only the current owner can update status
    modifier onlyOwner(uint256 _id) {
        require(products[_id].currentOwner == msg.sender, "Not the current owner");
        _;
    }

    // 1. Producer registers the organic product
    function registerProduct(string memory _name, string memory _metadataURI) public {
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            currentOwner: msg.sender,
            status: Status.Harvested,
            isOrganic: true, // Logic could be added here for a "Certification" check
            timestamp: block.timestamp,
            metadataURI: _metadataURI
        });

        emit ProductCreated(productCount, _name, msg.sender);
    }

    // 2. Update status as it moves through the chain
    function updateStatus(uint256 _id, Status _newStatus) public onlyOwner(_id) {
        products[_id].status = _newStatus;
        products[_id].timestamp = block.timestamp;

        emit StatusUpdated(_id, _newStatus, msg.sender);
    }

    // 3. View function for Consumers (via QR Code)
    function getProductDetails(uint256 _id) public view returns (Product memory) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        return products[_id];
    }
}
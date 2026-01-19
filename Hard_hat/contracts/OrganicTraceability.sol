// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrganicTraceability {
    enum Status { Harvested, Certified, Processed, InTransit, Delivered }

    struct Stage {
        Status status;
        string location;
        uint256 timestamp;
        address processedBy;
    }

    struct Metrics {
        uint256 waterUsage;   // in liters
        uint256 carbonFootprint; 
        uint256 soilHealth;    // percentage 0-100
    }

    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        bool isOrganic;
        string metadataURI;
        Metrics metrics;
        Stage[] journey; // Stores the full history on-chain
    }

    mapping(uint256 => Product) private products;
    uint256 public productCount;

    event ProductCreated(uint256 id, string name, address producer);
    event StatusUpdated(uint256 id, Status status, string location, address updatedBy);

    modifier onlyOwner(uint256 _id) {
        require(products[_id].currentOwner == msg.sender, "Not the current owner");
        _;
    }

    // 1. Register product with initial metrics
    function registerProduct(
        string memory _name, 
        string memory _metadataURI,
        string memory _initialLocation,
        uint256 _water,
        uint256 _carbon,
        uint256 _soil
    ) public {
        productCount++;
        
        Product storage newProduct = products[productCount];
        newProduct.id = productCount;
        newProduct.name = _name;
        newProduct.currentOwner = msg.sender;
        newProduct.isOrganic = true;
        newProduct.metadataURI = _metadataURI;
        newProduct.metrics = Metrics(_water, _carbon, _soil);

        // Record the first stage in the journey
        newProduct.journey.push(Stage({
            status: Status.Harvested,
            location: _initialLocation,
            timestamp: block.timestamp,
            processedBy: msg.sender
        }));

        emit ProductCreated(productCount, _name, msg.sender);
    }

    // 2. Update status and append to the journey array
    function updateStatus(
        uint256 _id, 
        Status _newStatus, 
        string memory _location
    ) public onlyOwner(_id) {
        products[_id].journey.push(Stage({
            status: _newStatus,
            location: _location,
            timestamp: block.timestamp,
            processedBy: msg.sender
        }));

        emit StatusUpdated(_id, _newStatus, _location, msg.sender);
    }

    // 3. View the full journey for a product
    function getProductJourney(uint256 _id) public view returns (Stage[] memory) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        return products[_id].journey;
    }

    // 4. View general product details
    function getProductDetails(uint256 _id) public view returns (
        string memory name,
        address currentOwner,
        bool isOrganic,
        Metrics memory metrics,
        string memory metadataURI
    ) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        Product storage p = products[_id];
        return (p.name, p.currentOwner, p.isOrganic, p.metrics, p.metadataURI);
    }
}
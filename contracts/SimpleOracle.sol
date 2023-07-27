// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleOracle {
    struct DataProvider {
        uint32 id;         // Assuming the id will not exceed 2^32 - 1
        uint32 tempPrice; // Assuming the temporary price will not exceed 2^32 - 1
    }

    mapping(address => DataProvider) public dataProviders;

    uint32 private totalTempPrices;
    uint32 private dataProviderCount;
    uint32 private nextId = 1; // Starts at 1 since 0 is used to check if a provider is registered or not
    
    uint32 public aggregatedPrice;

    event PriceUpdated(address indexed dataProvider, uint32 newPrice);
    event AggregatedPriceUpdated(uint32 newAggregatedPrice);
    event DataProviderRegistered(address indexed dataProvider, uint32 id);

    function registerDataProvider() external {
        require(dataProviders[msg.sender].id == 0, "Data provider already registered");
        
        dataProviders[msg.sender] = DataProvider({
            id: nextId,
            tempPrice: 0
        });
        
        emit DataProviderRegistered(msg.sender, nextId);
        
        nextId++;
    }

    function updatePrice(uint32 newPrice) public {
        DataProvider storage provider = dataProviders[msg.sender];
        
        require(provider.id != 0, "Data provider not registered");
        if (provider.tempPrice == 0) {
            dataProviderCount += 1;
        }

        totalTempPrices = totalTempPrices - provider.tempPrice + newPrice;

        provider.tempPrice = newPrice;

        emit PriceUpdated(msg.sender, newPrice);
    }

    function finalizePrice() external {
        require(dataProviderCount > 0, "No data providers updated prices");

        aggregatedPrice = totalTempPrices / dataProviderCount;

        totalTempPrices = 0;
        dataProviderCount = 0;

        emit AggregatedPriceUpdated(aggregatedPrice);
    }

    function getPrice() external view returns (uint32) {
        return aggregatedPrice;
    }
}
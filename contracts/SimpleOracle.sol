// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleOracle {
    struct DataProvider {
        uint32 id;
        uint32 tempPrice;
    }

    struct StateDiff {
        uint32 totalTempPricesDiff;
        uint32 dataProviderCountDiff;
    }

    mapping(address => DataProvider) public dataProviders;

    StateDiff private pendingStateDiff;

    uint32 private totalTempPrices;
    uint32 private dataProviderCount;
    uint32 private nextId = 1;
    
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
            pendingStateDiff.dataProviderCountDiff += 1;
        }

        pendingStateDiff.totalTempPricesDiff = pendingStateDiff.totalTempPricesDiff - provider.tempPrice + newPrice;

        provider.tempPrice = newPrice;

        emit PriceUpdated(msg.sender, newPrice);
    }

    function applyStateDiff() internal {
        totalTempPrices += pendingStateDiff.totalTempPricesDiff;
        dataProviderCount += pendingStateDiff.dataProviderCountDiff;

        // Reset the pending state diff
        pendingStateDiff = StateDiff(0, 0);
    }

    function finalizePrice() external {
        applyStateDiff();

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

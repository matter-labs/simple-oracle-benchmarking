const { ethers } = require('ethers');
const { displayGasCostsMatrix } = require('../scripts/benchmark');  // replace with your actual path

// Mock data (Simplified for demonstration)
const mockGasCosts = {
    zkSync: {
        deploy: ethers.BigNumber.from('200000000000000000'),
        register: ethers.BigNumber.from('100000000000000000'),
        update: {
            individualCosts: {
                dataProvider1: {
                    txCount: 2,
                    totalGas: ethers.BigNumber.from('150000000000000000')
                }
            },
            totalGasCost: ethers.BigNumber.from('150000000000000000')
        }
    },
    Optimism: {
        deploy: ethers.BigNumber.from('220000000000000000'),
        register: ethers.BigNumber.from('110000000000000000'),
        update: {
            individualCosts: {
                dataProvider1: {
                    txCount: 2,
                    totalGas: ethers.BigNumber.from('155000000000000000')
                }
            },
            totalGasCost: ethers.BigNumber.from('155000000000000000')
        }
    }
};

const networks = [{name: 'zkSync'}, {name: 'Optimism'}];

describe('Gas Costs Matrix', () => {
    let logs = [];

    beforeEach(() => {
        logs = [];
        console.log = jest.fn((...args) => logs.push(args.join(' ')));
    });

    test('should correctly display gas costs matrix', () => {
        displayGasCostsMatrix(mockGasCosts, networks);

        // Expected values based on mock data (simplified for demonstration)
        expect(logs[0]).toBe("\n========= Gas Costs Matrix =========");
        expect(logs[1]).toBe("Network\tDeploy Cost\tRegister Cost\tupdatePrice Cost\tcost per updatePrice call\t# of txs\tTotal Cost");
        expect(logs[2]).toContain('zkSync');
        expect(logs[3]).toContain('Optimism');
        // Add more assertions based on expected logs
    });

    // Add more tests if necessary
});

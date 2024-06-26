const networks = [
    {
        id: 1,
        chainId: 1,
        name: 'ethereum',
        displayName: "Ethereum mainnet",
        currencySymbol: "ETH",
        blockExplorer: "https://etherscan.io",
        blockExplorerIcon: "etherscan",
        rpcUrl: "https://mainnet.infura.io/v3/",
        icon: 'ethereum',
        factory_address: '0x924D747B95CCdc82D4f4E15F04e69f4Eb1FB39D9',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-ethereum"
    },
    {
        id: 5,
        chainId: 5,
        name: 'goerli',
        displayName: "Goerli testnet",
        currencySymbol: "GoerliETH",
        blockExplorer: "https://goerli.etherscan.io",
        blockExplorerIcon: "etherscan",
        rpcUrl: "https://goerli.infura.io/v3/",
        icon: 'ethereum',
        factory_address: '0x6DB9F75C0B79E0351B09311c4856F556b09F67a5',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-goerli"
    },
    {
        id: 137,
        chainId: 137,
        name: 'polygon',
        displayName: "Polygon",
        currencySymbol: "MATIC",
        blockExplorer: "https://polygonscan.com",
        blockExplorerIcon: "polygonscan",
        rpcUrl: "https://polygon-rpc.com",
        icon: 'polygon',
        factory_address: '0xFE259001e141A41f3bcCDBc315A8F0D23Ef84b0b',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-polygon"
    },
    {
        id: 80001,
        chainId: 80001,
        name: 'mumbai',
        displayName: "Mumbai testnet",
        currencySymbol: "MATIC",
        blockExplorer: "https://mumbai.polygonscan.com",
        blockExplorerIcon: "polygonscan",
        rpcUrl: "https://rpc-mumbai.maticvigil.com/",
        icon: 'polygon',
        factory_address: '0x94927792b88D518f9a429572dD3D40400b8BE906',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-mumbai"
    },
    {
        id: 42161,
        chainId: 42161,
        name: 'atbitrum',
        displayName: "Arbitrum one",
        currencySymbol: "ETH",
        blockExplorer: "https://arbiscan.io/",
        blockExplorerIcon: "arbitrum",
        rpcUrl: "https://arb1.arbitrum.io/rpc",
        icon: 'arbitrum',
        factory_address: '0xdf3f47707a27Ec838d7691dfB7a02a795eE554D5',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-arbitrum"
    },
    {
        id: 421614,
        chainId: 421614,
        name: 'sepolia',
        displayName: "Arbitrum sepolia",
        currencySymbol: "ETH",
        blockExplorer: "https://sepolia.arbiscan.io/",
        blockExplorerIcon: "arbitrum",
        rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
        icon: 'arbitrum',
        factory_address: '0xf1A14e96977E8dE295Ba9612691D127B157d1371',
        subgraph_url: "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-sepolia"
    },
    {
        id: 11155111,
        chainId: 11155111,
        name: 'eth_sepolia',
        displayName: "Ethereum Sepolia",
        currencySymbol: "ETHSepolia",
        blockExplorer: "https://sepolia.arbiscan.io/",
        blockExplorerIcon: "etherscan",
        rpcUrl: "https://sepolia.infura.io/v3/  ",
        icon: 'ethereum',
        factory_address: '0xD13c3B470989C3666A7b4994951582bA101C1EF8',
        subgraph_url: "https://api.studio.thegraph.com/query/21739/offchainassetvault-sepolia-eth/version/latest"
    },
    // {
    //     id: 80001,
    //     chainId: 80001,
    //     name: 'mumbai',
    //     displayName: "Mumbai testnet",
    //     currencySymbol: "MATIC",
    //     blockExplorer: "https://mumbai.polygonscan.com",
    //     rpcUrl: "https://rpc-mumbai.maticvigil.com/",
    //     icon: 'polygon',
    //     factory_address: '0x792f2567Af36fD43655f62Bf1a457e701a1f7C8d',
    //     subgraph_url: "https://api.thegraph.com/subgraphs/name/ninokeldishvili/erc20-price-oracle-vault"
    // }
];

export default networks;

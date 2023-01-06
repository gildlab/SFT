<script>
    import {Router, Link, Route, navigate} from "svelte-routing";
    import Mint from "../routes/Mint.svelte";
    import Tokens from "../routes/Tokens.svelte";
    import Members from "../routes/Members.svelte";
    import AuditHistory from "../routes/AuditHistory.svelte";
    import NewSchema from "../routes/NewSchema.svelte";
    import SetVault from "../routes/SetVault.svelte";
    import ReceiptAudit from "../routes/ReceiptAudit.svelte";
    import AssetRegister from "../routes/AssetRegister.svelte";
    import Roles from "../routes/Roles.svelte";
    import {icons} from "../scripts/assets.js";
    import {account, activeNetwork, ethersData, tokenName, tokens, vault} from "../scripts/store.js";
    import Select from "../components/Select.svelte";
    import networks from "../scripts/networksConfig.js";
    import {getContract, getSubgraphData} from "../scripts/helpers.js";
    import contractAbi from "../contract/OffchainAssetVaultAbi.json";
    import {navigateTo} from "yrv";
    import {onMount} from "svelte";
    import {ethers} from "ethers";

    export let url = "";
    let connectedAccount;

    let isMetamaskInstalled = typeof window.ethereum !== "undefined"

    let location = window.location.pathname;


    export async function setVault() {
        let contractAddress = localStorage.getItem("vaultAddress")
        let contract = await getContract($activeNetwork, contractAddress, contractAbi, $ethersData.signerOrProvider)
        if (contract) {
            vault.set(contract)
        } else {
            navigate("/", {replace: false});
        }
    }

    let accountMenuOptions = [
        {
            id: "copy",
            displayName: "Copy Address",
            action: () => {
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    // this.showTooltip = true;
                    // setTimeout(() => {
                    //     this.showTooltip = false;
                    // }, 1000);
                    return navigator.clipboard.writeText($account);
                }
                return Promise.reject("The Clipboard API is not available.");
            }
        },
        {
            id: "view",
            displayName: "View on Explorer",
            action: () => {
                window.open(`${$activeNetwork.blockExplorer}address/${$account}`);
            },
        }
    ]
    onMount(async () => {
        console.log(location)

        await setVault()
        await getEthersData()

        if (isMetamaskInstalled) {
            await setNetwork()
            connectedAccount = await getMetamaskConnectedAccount()
            if (connectedAccount) {
                account.set(connectedAccount)
                navigate(location || '/', {replace: false})
            } else {
                localStorage.removeItem('account')
            }

            window.ethereum.on("accountsChanged", async (accounts) => {
                if (!accounts.length) {
                    account.set(null);
                    localStorage.removeItem('account')
                } else {
                    account.set(accounts[0]);
                    localStorage.setItem('account', $account)
                }
            });
            window.ethereum.on("chainChanged", networkChanged);
        }
        if (location === '') {
            navigate('/')
        }
        await getTokens()

        // const grantRoleTx = await $vault.connect($ethersData.signer).grantRole(await $vault.connect($ethersData.signer).DEPOSITOR(), $account.trim());
        // await grantRoleTx.wait()


    });

    async function networkChanged() {
        await setNetwork()
        await getTokens()
    }

    async function getEthersData() {
        if (window.ethereum) {
            let temp = {}
            temp.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            temp.signer = temp.provider.getSigner();
            temp.signerOrProvider = temp.signer ? temp.signer : temp.provider;

            ethersData.set(temp)
        }
    }


    async function setNetwork() {
        let network = await $ethersData.provider.getNetwork();
        let connectedChainId = parseInt(network.chainId);
        let temp = networks.find(
            (network) => network.chainId === connectedChainId
        )
        activeNetwork.set(temp)
        return temp
    }

    async function handleNetworkSelect(event) {
        let activeNet = event.detail.selected
        let chainId = ethers.utils.hexValue(activeNet.chainId)
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{chainId}]
            });

        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: chainId,
                                chainName: activeNet.displayName,
                                rpcUrls: [activeNet.rpcUrl],
                                blockExplorerUrls: [activeNet.blockExplorer],
                                nativeCurrency: {
                                    name: activeNet.currencySymbol,
                                    symbol: activeNet.currencySymbol,
                                    decimals: 18
                                }
                            }
                        ]
                    });
                } catch (addError) {
                    // handle "add" error
                }
            }
            // handle other "switch" errors
        }

        activeNetwork.set(activeNet)
    }

    async function connect() {
        if (!isMetamaskInstalled) {
            window.open("https://metamask.io/download/", "_blank");
        } else {
            try {
                const accounts = await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                }).then(() => window.ethereum.request({
                    method: "eth_requestAccounts"
                }));
                account.set(accounts[0]);
                localStorage.setItem('account', $account)
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function getMetamaskConnectedAccount() {
        if (isMetamaskInstalled) {
            const accounts = await $ethersData.provider.listAccounts();
            return accounts.length > 0 ? accounts[0] : null;
        }
    }

    // function changeUrl(tab) {
    //     navigateTo('#' + tab)
    //     selectedTab = tab
    // }

    async function getTokens() {
        let query = `
        query {
          offchainAssetReceiptVaults(orderBy:deployTimestamp orderDirection:desc){
            deployer,
            name,
            address,
            symbol
          }
        }`

        getSubgraphData($activeNetwork, {}, query, 'offchainAssetReceiptVaults').then((res) => {
            if ($activeNetwork) {
                let temp = res.data.offchainAssetReceiptVaults
                tokens.set(temp)
                let token = $tokens.find(t => t.address === $vault.address)
                tokenName.set(token?.name)
            }
        })
    }

</script>

<Router url="{url}">

  <div class="default-header">
    <div class="logo" on:click={()=>{window.location.href = '/'}}>
      <img src={icons.logo} alt="sft logo">
    </div>
    {#if $account}
      <div class="menu">
        <Select options={networks} on:select={handleNetworkSelect}
                label={$activeNetwork?.displayName || 'Available networks'} className={'meinMenu'}
                dropDownClass={'nav-dropdown'}>
            <span slot="icon" class="select-icon"><img src={icons[$activeNetwork?.icon]}
                                                       alt={$activeNetwork?.displayName}/></span>
        </Select>
        <Select className={'meinMenu'} options={accountMenuOptions}
                label={$account.replace(/(.{6}).*(.{4})/, "$1…$2")}
                staticLabel={true} dropDownClass={'nav-dropdown'}>
        </Select>

      </div>
    {/if}

  </div>
  <div class="display-flex">
    <div class="app-navigation">
      <div class="token">
        <img src={icons.logo} alt="sft logo">
        <div class="token-name">{$tokenName}</div>
      </div>
      <div class="expand btn-hover">
        <img src={icons.expand_double} alt="expand">
      </div>
      <Link class="link" to="mint">Mint/Redeem</Link>
      <Link class="link" to="members">Members</Link>
      <Link class="link" to="roles">Roles</Link>
      <!--      <Link class="link" to="audits">Audits</Link>-->
      <Link class="link" to="asset-register">Asset Register</Link>
      <!--      <Link class="link" to="receipts">Receipt List</Link>-->
      <Link class="link" to="certificates">Certification Dates</Link>
      <Link class="link" to="tokens">Tokens</Link>
    </div>
    <div class="routes">
      <Route path="mint" component="{Mint}" ethersData={$ethersData}/>
      <Route path="members" component="{Members}"/>
      <Route path="roles" component="{Roles}"/>
      <Route path="audits" component="{AssetRegister}"/>
      <Route path="asset-register" component="{AssetRegister}"/>
      <Route path="receipt/:id" component="{ReceiptAudit}"/>
      <Route path="receipts" component="{ReceiptAudit}"/>
      <Route path="tokens" component="{Tokens}"/>
      <Route path="/" component="{SetVault}"></Route>
    </div>

    {#if !$account}
      <div>
        <div class="invalid-network f-weight-700">
          <label>To use the app:</label>
          <button class="connect-metamask-btn f-weight-700" on:click={()=>connect()}>
            {#if isMetamaskInstalled}
              <span>Connect Metamask</span>
            {/if}
            {#if !isMetamaskInstalled}
              <span>Install Metamask</span>
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </div>


</Router>

<style>

    .app-navigation {
        position: relative;
        margin-top: 77px;
        background: #FFFFFF;
        flex-direction: column;
        display: flex;
        width: 185px;
        height: calc(100vh - 130px);
        padding: 0 25px;
        color: #AE6E00;
        border-radius: 0 20px 0 0;
        line-height: 40px;
        font-weight: 700;
        font-size: 16px;
        text-decoration: none;
        /*transform: matrix(-1, 0, 0, 1, 0, 0);   */
    }


    .link > :global(a) {
        text-decoration: none;
    }

    :global(a) {
        color: #AE6E00;
    }

    :global(a):hover {
        color: #AE6E00;
        text-decoration: underline;
    }

    .default-header {
        justify-content: space-between;
        align-items: center;
        display: flex;
        padding-left: 66px;
        padding-right: 70px;
        width: 100%;
        height: 53px;
        background: linear-gradient(90.04deg, #B5DCFF 2.46%, #6F5EA1 96.36%);
    }

    .logo {
        cursor: pointer;
    }

    .logo img {
        width: 37px;
        height: 37px;
    }

    .token img {
        width: 88px;
        height: 88px;
        margin-top: -39px;
        border: 6px solid #FFFFFF;
        border-radius: 50%;
    }

    .token-name {
        font-family: 'Mukta', sans-serif;
        font-style: normal;
        font-weight: 700;
        font-size: 16px;
        line-height: 27px;
        color: #575757;
        margin-bottom: 25px;
    }

    .menu {
        display: flex;
    }

    .select-icon {
        margin-right: 10px;
    }

    .routes {
        display: flex;
        justify-content: center;
        width: calc(100% - 185px);
    }

    .expand {
        right: 13px;
        top: 1px;
        position: absolute;
    }
</style>
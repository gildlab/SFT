<script>
    import {activeNetwork, account, vault, tokens, ethersData} from "../scripts/store.js";
    import Select from "../components/Select.svelte";
    import networks from "../scripts/networksConfig.js";
    import SftSetup from "../routes/SftSetup.svelte";
    import {ethers} from "ethers";
    import {onMount} from 'svelte';
    import {Router, Route, navigateTo, router} from "yrv"
    import Roles from "./../routes/Roles.svelte";
    import {icons} from '../scripts/assets.js'
    import Redeem from "../routes/Redeem.svelte";
    import Mint from "../routes/Mint.svelte";
    import {getContract, getSubgraphData} from "../scripts/helpers.js";
    import contractAbi from "../contract/OffchainAssetVaultAbi.json";
    import Tokens from "../routes/Tokens.svelte";
    import Members from "../routes/Members.svelte";
    import AuditHistory from "../routes/AuditHistory.svelte";
    import NewSchema from "../routes/NewSchema.svelte";
    import SetVault from "../routes/SetVault.svelte";
    import ReceiptAudit from "../routes/ReceiptAudit.svelte";
    import AssetRegister from "../routes/AssetRegister.svelte";

    let connectedAccount;
    let tokenName = '';
    export let url = '';

    let isMetamaskInstalled = typeof window.ethereum !== "undefined"

    let location = window.location.hash;
    let selectedTab = 'mint'

    router.subscribe(async e => {
        if (!e.initial) {
            await setVault()
            if ($vault.address) {
                tokenName = await $vault.name()
            }
            location = e.path
            selectedTab = location.slice(1) || 'mint'
            if (location === "#list" && $tokens.length) {
                navigateTo("#list", {replace: false})
            }
            if (location === "#setup") {
                navigateTo("#setup", {replace: false})
            }
        }
    });

    export async function setVault() {
        let contractAddress = localStorage.getItem("vaultAddress")
        let contract = await getContract($activeNetwork, contractAddress, contractAbi, $ethersData.signerOrProvider)
        if (contract) {
            vault.set(contract)
        } else {
            navigateTo("#set-vault", {replace: false})
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

    let menuItems = [
        {
            id: "setup",
            displayName: "SFT Setup",
            action: () => {
                navigateTo('#setup', {replace: false})
            }
        },
        {
            id: "roles",
            displayName: "Roles",
            action: () => {
                navigateTo('#roles', {replace: false})
            }
        },
        {
            id: "mint",
            displayName: "Mint/Redeem",
            action: () => {
                navigateTo('#mint', {replace: false})
            }
        },
        {
            id: "list",
            displayName: "SFT List",
            action: () => {
                navigateTo('#list', {replace: false})
            }
        },
        {
            id: "members",
            displayName: "Members",
            action: () => {
                navigateTo('#members', {replace: false})
            }
        },
        {
            id: "audit-history",
            displayName: "Audit History",
            action: () => {
                navigateTo('#audit-history', {replace: false})
            }
        },
        {
            id: "asset-register",
            displayName: "Asset Register",
            action: () => {
                navigateTo('#asset-register', {replace: false})
            }
        },
        // {
        //     id: "new-schema",
        //     displayName: "New Schema",
        //     action: () => {
        //         navigateTo('#new-schema', {replace: false})
        //     }
        // },
    ]

    onMount(async () => {
        await setVault()
        await getEthersData()

        if (isMetamaskInstalled) {
            await setNetwork()
            connectedAccount = await getMetamaskConnectedAccount()
            if (connectedAccount) {
                account.set(connectedAccount)
                navigateTo(location || '#', {replace: false})
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
            navigateTo('#set-vault')
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

    function changeUrl(tab) {
        navigateTo('#' + tab)
        selectedTab = tab
    }

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
            }
        })
    }

</script>
<Router url={url}>

  <div class="content">
    <div class="default-header">
      <div class="logo" on:click={()=>{window.location.href = '/'}}>
        <img src={icons.logo} alt="sft logo">
        <div class="logo-label">{tokenName}</div>
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

          <Select className={'meinMenu'} options={menuItems}
                  label=""
                  staticLabel={true} showExpand="{false}" dropDownClass={'nav-dropdown'}>
            <div slot="icon">
              <img src={icons.burger}
                   alt="menu"/>
            </div>
          </Select>

        </div>
      {/if}

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
    {#if $account}
      <Route path="#asset-register" component={AssetRegister}/>

      <div class="main-card">
        <div class={$activeNetwork  ? 'show' : 'hide'}>
          <Route path="#setup" component={SftSetup} ethersData={$ethersData}/>
          <Route path="#roles" component={Roles}/>
          <Route path="#list" component={Tokens}/>
          <Route path="#members" component={Members}/>
          <Route path="#audit-history" component={AuditHistory}/>
          <Route path="#set-vault" component={SetVault}/>
          <Route path="#new-schema" component={NewSchema}/>
          <Route path="#receipt/:id" component={ReceiptAudit}/>


          <div class={location === '#mint' || location === "#redeem" ? 'tabs show' : 'tabs hide'}>
            <div class="tab-buttons">
              <button class:selected="{selectedTab === 'mint'}" class="tab-button"
                      on:click="{() =>  changeUrl('mint')}">
                Mint
              </button>
              <button class:selected="{selectedTab === 'redeem'}" class="redeem-tab tab-button"
                      on:click="{() =>  changeUrl('redeem')}">
                Redeem
              </button>
            </div>

            <div class="tab-panel-container">
              <Route path="#mint" component={Mint} ethersData={$ethersData}/>
              <Route path="#redeem" component={Redeem} ethersData={$ethersData}/>
            </div>
          </div>
        </div>
        <div class={!$activeNetwork  ? 'invalid-network show' : 'invalid-network hide'}>
          <label>Choose a supported network from the list above</label>
        </div>
      </div>
    {/if}
  </div>


  <div class="footer">
    <div class="powered-by">
      <span>Powered by</span>
      <div><a href="https://www.gildlab.xyz/" target="_blank"><img src={icons.gild_lab} alt="Gild Lab"/></a></div>
      <span>and Rain</span>
      <div><a href="https://www.rainprotocol.xyz/" target="_blank"><img src={icons.rain} alt="Rain"/></a></div>
    </div>

  </div>
</Router>


<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
  }

  .default-header {
    justify-content: space-between;
    display: flex;
    padding-left: 167px;
    width: 100%;
    padding-right: 65px;
  }

  .logo {
    cursor: pointer;
  }

  .logo-label {
    font-family: 'Mukta', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 30px;
    color: #F9DFA0;
  }

  .main-card {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -45px;
  }

  .invalid-network {
    background-color: transparent;
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-top: 6rem;
    font-style: normal;
    font-size: 40px;
    line-height: 66px;
    color: #FFFFFF;
  }

  .connect-metamask-btn {
    background: #2C2C54;
    border-radius: 30px;
    padding: 7px 35px;
    font-style: normal;
    font-size: 25px;
    line-height: 42px;
    color: #FFFFFF;
    cursor: pointer;
    border: none;
  }

  .menu {
    display: flex;
  }

  .select-icon {
    margin-right: 10px;
  }

  .tabs {
    display: flex;
    flex-direction: column;

  }

  .tab-buttons {
    display: flex;

  }

  .tab-button {
    margin: 0;
    color: #000000;
    width: 105px;
    height: 36px;
    background: linear-gradient(227.8deg, #FFFFFF 21.59%, #C5C4C4 61.47%);
    border-radius: 20px 10px 0 0;
    border: none;
    font-weight: 300;
    font-size: 16px;
    line-height: 27px;
  }

  .tab-panel-container {
    width: 492px;
    min-height: 460px;
    background: #FFFFFF;
    border-radius: 0 20px 20px 20px;
    padding-bottom: 20px;
  }

  .redeem-tab {
    border-radius: 10px 10px 0 0 !important;
    margin-left: 2px;
  }

  .selected {
    background: #FFFFFF;
    font-weight: 700;
  }

  .show {
    display: flex;
  }

  .hide {
    display: none;
  }

  .footer {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 40px;
    font-family: 'Inter', sans-serif;
  }

  .powered-by{
    width: 320px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-between;
  }

  .content {
    height: 100vh;
  }

</style>
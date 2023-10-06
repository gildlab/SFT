<script>
    import {
        activeNetwork,
        account,
        vault,
        tokens,
        ethersData,
        transactionInProgressShow,
        transactionHash,
        promptTopText,
        promptBottomText,
        promptCloseAction,
        promptNoBottom,
        promptErrorText,
        promptSuccessText,
        accountRoles,
        data,
        roles,
        sftInfo,
        tokenName,
        breadCrumbs,
        navigationButtonClicked,
        transactionInProgress,
        pageTitle,
        isCypress,
        schemas,
        currentCertification
    } from "../scripts/store.js";
    import networks from "../scripts/networksConfig.js";
    import SftSetup from "../routes/SftSetup.svelte";
    import {ethers} from "ethers";
    import {beforeUpdate, onMount} from "svelte";
    import {Router, Route, navigateTo, router} from "yrv";
    import Roles from "./../routes/Roles.svelte";
    import {icons} from "../scripts/assets.js";
    import Redeem from "../routes/Redeem.svelte";
    import Mint from "../routes/Mint.svelte";
    import {
        cborDecode,
        filterArray,
        getContract, getIpfsGetWay,
        getSubgraphData,
        mapOrder, navigate,
        setAccountRoles,
        showPrompt
    } from "../scripts/helpers.js";
    import contractAbi from "../contract/OffchainAssetVaultAbi.json";
    import Members from "../routes/Members.svelte";
    import AuditHistory from "../routes/AuditHistory.svelte";
    import NewSchema from "../routes/NewSchema.svelte";
    import AssetClasses from "../routes/AssetClasses.svelte";
    import Navigation from "../components/Navigation.svelte";
    import TransactionInProgressBanner from "../components/TransactionInProgressBanner.svelte";
    import Ipfs from "../routes/Ipfs.svelte";
    import {
        CURRENT_CERTIFICATION_QUERY,
        QUERY,
        VAULT_INFORMATION_QUERY,
        VAULTS_QUERY
    } from "../scripts/queries.js";
    import {MAGIC_NUMBERS, ROLES} from '../scripts/consts.js';
    import {ROUTE_LABEL_MAP} from '../scripts/consts';
    import SFTCreateSuccessBanner from '../components/SFTCreateSuccessBanner.svelte';
    import Manual from '../routes/Manual.svelte';
    import Home from '../routes/Home.svelte';
    import AssetRegister from '../routes/AssetRegister.svelte';
    import AssetInformation from '../routes/AssetInformation.svelte';
    import TokenOverview from '../routes/TokenOverview.svelte';
    import NewRevision from '../routes/NewRevision.svelte';
    import AssetHistory from '../routes/AssetHistory.svelte';
    import ChangeComparison from '../routes/ChangeComparison.svelte';
    import AddressOverview from '../routes/AddressOverview.svelte';
    import Certify from '../routes/Certify.svelte';
    import axios from 'axios';
    import AuditReport from '../routes/AuditReport.svelte';
    import {mock} from '../test/mock.js'

    let connectedAccount;
    export let url = "";

    let isMetamaskInstalled = typeof window.ethereum !== "undefined";

    let location = window.location.hash;
    let showCertifyWarning = false;
    let selectedTab = "#mint";
    $: $vault.address && vaultChanged();
    $: $data && getCurrentCertification()

    async function vaultChanged() {
        if ($vault.address && $activeNetwork.id && $account) {
            await getRoles($vault.address)
            accountRoles.set(await setAccountRoles($roles, $account));
            tokenName.set($data && $data.offchainAssetReceiptVault ? $data.offchainAssetReceiptVault.name : "")
        }
        showCertifyWarning = shouldShowWarning()
    }

    router.subscribe(async e => {
        //reset pageTitle
        pageTitle.set("")
        if (!e.initial) {
            let contract = await setVault()
            location = e.path
            selectedTab = location || '#mint'
            if (!contract) {
                location = e.path
                if (location === "#list" && $tokens.length) {
                    navigateTo("#list", {replace: false})
                } else if (location === "#setup") {
                    navigateTo("#setup", {replace: false})
                } else if (location === "#ipfs") {
                    navigateTo("#ipfs", {replace: false})
                } else if (location === "#manual") {
                    navigateTo("#manual", {replace: false})
                } else if (location === `#address-overview/${e.params.address}`) {
                    navigateTo(`#address-overview/${e.params.address}`, {replace: false})
                } else if (location === `#token-overview/${e.params.address}`) {
                    navigateTo(`#token-overview/${e.params.address}`, {replace: false})
                } else if (location.includes('#asset-information')) {
                    navigateTo(location, {replace: false})
                } else {
                    vault.set({})
                    location = "#"
                    navigateTo("#", {replace: false})
                }
            }

            window.scrollTo(0, 0);
        }
    });

    export async function setVault() {
        let contractAddress = localStorage.getItem("vaultAddress");
        let contract = await getContract($activeNetwork, contractAddress, contractAbi, $ethersData.signerOrProvider);
        if (contract) {
            vault.set(contract);
        }
        await getSchemas()
        return contract
    }

    beforeUpdate(() => {
        isCypress.set(!!window.Cypress)
    })

    onMount(async () => {
        await getEthersData();
        if ($isCypress) {
            account.set(mock.account)
            activeNetwork.set(mock.activeNetwork)
        } else {
            if (isMetamaskInstalled) {
                if (location === "/" || location === "") {
                    navigateTo("#");
                }
                await setNetwork();
                await getSchemas();
                connectedAccount = await getMetamaskConnectedAccount();
                if (connectedAccount) {
                    account.set(connectedAccount)
                    await vaultChanged()
                    navigateTo(location || '#', {replace: false})
                } else {
                    localStorage.removeItem("account");
                }

                window.ethereum.on("accountsChanged", async (accounts) => {
                    if (!accounts.length) {
                        account.set(null);
                        localStorage.removeItem("account");
                    } else {
                        account.set(accounts[0]);
                        localStorage.setItem("account", $account);
                        accountRoles.set(await setAccountRoles($roles, $account));

                        if ((location === '#mint' || location === '#redeem') && !$accountRoles.DEPOSITOR) {
                            navigateTo('#');
                        }
                    }
                });
                window.addEventListener("hashchange", function (e) {
                    // listen to browser back/forward button click event and update breadcrumbs accordingly
                    let newUrl = e.newURL.split('/')[3]
                    let oldURL = e.oldURL.split('/')[3]
                    if (!$navigationButtonClicked) {
                        let indexOfNewUrl = $breadCrumbs.findIndex(u => u.path === newUrl)
                        let indexOfOldUrl = $breadCrumbs.findIndex(u => u.path === oldURL)
                        if (indexOfNewUrl > 0 && indexOfNewUrl < indexOfOldUrl) {
                            breadCrumbs.set($breadCrumbs.filter(p => p.path !== oldURL))
                        }

                        if (!$breadCrumbs.find(b => b.path === newUrl)) {
                            breadCrumbs.set([...$breadCrumbs, {path: newUrl, label: ROUTE_LABEL_MAP.get(newUrl)}])
                        }
                    } else {
                        breadCrumbs.set([{path: "#", label: "Home"},
                            {path: newUrl, label: ROUTE_LABEL_MAP.get(newUrl)}])
                    }
                })
                window.ethereum.on("chainChanged", networkChanged);
            }

        }

        await getTokens();

        // const grantRoleTx = await $vault.connect($ethersData.signer).grantRole(await $vault.connect($ethersData.signer).DEPOSITOR(), $account.trim());
        // await grantRoleTx.wait()

    });

    async function networkChanged() {
        await showPrompt(null, {topText: "Loading, please wait", noBottomText: true})
        localStorage.setItem("vaultAddress", "");
        vault.set({});
        await setNetwork();
        await getTokens();
        navigateTo("#");
    }

    async function getEthersData() {
        if (window.ethereum) {
            let temp = {};
            temp.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            temp.signer = temp.provider.getSigner();
            temp.signerOrProvider = temp.signer ? temp.signer : temp.provider;

            ethersData.set(temp);
        }
    }

    async function setNetwork() {
        let network = await $ethersData.provider.getNetwork();
        let connectedChainId = parseInt(network.chainId);
        let temp = networks.find(
            (network) => network.chainId === connectedChainId
        );
        activeNetwork.set(temp);
        return temp;
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
                accountRoles.set(await setAccountRoles($roles, $account));
                localStorage.setItem("account", $account);
            } catch (error) {
                console.log(error);
            }
        }
        await setVault()
    }

    async function getMetamaskConnectedAccount() {
        if (isMetamaskInstalled) {
            const accounts = await $ethersData.provider.listAccounts();
            return accounts.length > 0 ? accounts[0] : null;
        }
    }

    function changeUrl(tab) {
        navigateTo(tab)
        selectedTab = tab
    }

    async function getTokens() {
        if ($isCypress) {
            tokens.set([mock.testToken]);
            return
        }
        try {
            await getSubgraphData($activeNetwork, {}, VAULTS_QUERY, "offchainAssetReceiptVaults").then((res) => {
                if ($activeNetwork) {
                    let temp = res.data.offchainAssetReceiptVaults;
                    tokens.set(temp)
                    transactionInProgressShow.set(false)
                    transactionInProgress.set(false)
                } else {
                    tokens.set([])
                }
            });
        } catch (e) {
            console.log(e)
        }

    }

    async function getSchemas() {
        let variables = {id: $vault?.address?.toLowerCase()}
        if ($vault.address) {
            try {
                let resp = await getSubgraphData($activeNetwork, variables, VAULT_INFORMATION_QUERY, 'offchainAssetReceiptVault')
                let receiptVaultInformations = ""
                let tempSchema = []

                if (resp && resp.data && resp.data.offchainAssetReceiptVault) {
                    receiptVaultInformations = resp.data.offchainAssetReceiptVault.receiptVaultInformations

                    if (receiptVaultInformations.length) {
                        receiptVaultInformations.map(async data => {
                            let cborDecodedInformation = cborDecode(data.information.slice(18))
                            if (cborDecodedInformation[0].get(1) === MAGIC_NUMBERS.OA_SCHEMA) {
                                let schemaHash = cborDecodedInformation[1].get(0)
                                if (schemaHash && !schemaHash.includes(',')) {
                                    let url = await getIpfsGetWay(schemaHash)
                                    try {
                                        if (url) {
                                            let res = await axios.get(url)
                                            if (res) {
                                                tempSchema.push({
                                                    ...res.data,
                                                    timestamp: data.timestamp,
                                                    id: data.id,
                                                    hash: schemaHash
                                                })
                                                tempSchema = tempSchema.filter(d => d.displayName)
                                                schemas.set(tempSchema)
                                            }
                                        }
                                    } catch (err) {
                                        // console.log(err)
                                    }
                                }
                            }

                        })
                    }
                }

            } catch (err) {
                console.log(err)
            }
        }
    }

    async function getRoles(vaultAddress) {
        if (vaultAddress) {
            try {
                let variables = {id: vaultAddress.toLowerCase()}
                let res = await getSubgraphData($activeNetwork, variables, QUERY, 'offchainAssetReceiptVault')
                if (res && res.data) {
                    data.set(res.data)
                    roles.set(res.data.offchainAssetReceiptVault?.roles?.length ?
                        res.data.offchainAssetReceiptVault?.roles :
                        ROLES)
                    let rolesFiltered = $roles.map(role => {
                        let roleRevokes = $data.offchainAssetReceiptVault.roleRevokes.filter(r => r.role.roleName ===
                            role.roleName)
                        let roleRevokedAccounts = roleRevokes.map(rr => rr.roleHolder.account.address)
                        let filtered = filterArray(role.roleHolders, roleRevokedAccounts)
                        return {roleName: role.roleName, roleHolders: filtered, roleHash: role.roleHash}
                    })

                    //Order roles from subgraph as in contract
                    let rolesOrder = ROLES.map(r => r.roleHash)
                    rolesFiltered = mapOrder(rolesFiltered, rolesOrder, 'roleHash')
                    roles.set(rolesFiltered)
                }
            } catch (e) {
                console.log(e)
            }

        }
    }


    async function getCurrentCertification() {
        if ($data.offchainAssetReceiptVault && !$currentCertification?.id) {
            let variables = {id: $vault.address, certifiedUntil: $data.offchainAssetReceiptVault.certifiedUntil}
            let resp = await getSubgraphData($activeNetwork, variables, CURRENT_CERTIFICATION_QUERY, 'offchainAssetReceiptVault')
            currentCertification.set(resp.data.offchainAssetReceiptVault.certifications[0])
        }
    }

    function shouldShowWarning() {
        let hideRoutes = [
            '#setup',
            '#ipfs',
            '#manual',
            '',
            '#',
            '#audit-history',
            '#token-overview',
            '#change-comparison',
            '#address-overview',
            '#audit-report'
        ]

        let page = location.split('/')[0]

        return !!(($data.offchainAssetReceiptVault && new Date($data.offchainAssetReceiptVault.certifiedUntil * 1000) <
            new Date()) && (page && !hideRoutes.includes(page) && page !== '#'));

    }
</script>
<Router url={url}>
  <div class={$account ? "content" : "content-not-connected"}>
    {#if (showCertifyWarning)}
      <div class="certify-warning">
        <span class="error">Warning, this token is frozen.</span>
        {#if ($currentCertification?.id)}
          <span class="brown underline cursor-pointer"
                on:click={()=>{navigate(`#audit-report/${$currentCertification?.id}`)}}>Current certification</span>
        {/if}
        {#if (!$currentCertification?.id)}
          <span class="brown underline cursor-pointer"
                on:click={()=>{navigate(`#audit-history`)}}>Certify</span>
        {/if}
      </div>
    {/if}

    <div class="logo-container rounded-full {$account ? 'border-6' : ''}  border-white">
      <a href="/">
        <img src={icons.logo} alt=""
             class="{$account ? 'bg-white' : ''} rounded-full w-full h-full"/>
      </a>
    </div>
    <div class="{ $account ? 'block' : 'hide'}">

      <Navigation path={$router.path} token={$data.offchainAssetReceiptVault}/>

      <div class={$sftInfo ? "sft-info-opened" : "" }>
        <div class="{$activeNetwork  ? 'show' : 'hide'}">
          <Route path="#" component={Home}/>
          <Route path="#asset-register" component={AssetRegister}/>
          <Route path="#asset-history/:id" component={AssetHistory}/>
          <Route path="#audit-history" component={AuditHistory}/>
          <Route path="#token-overview/:address" component={TokenOverview}/>
          <Route path="#change-comparison" component={ChangeComparison}/>
          <Route path="#address-overview/:address" component={AddressOverview}/>
        </div>
      </div>
      <div class={$sftInfo ? "main-card sft-info-opened" : "main-card" }>
        <div class="{$activeNetwork  ? 'show' : 'hide'} display-flex flex-col">

          <Route path="#setup" component={SftSetup} ethersData={$ethersData}/>
          <Route path="#roles" component={Roles}/>
          <Route path="#members" component={Members}/>
          <Route path="#asset-classes" component={AssetClasses}/>
          <Route path="#new-asset-class" component={NewSchema}/>
          <Route path="#asset-information/:id/:id" component={AssetInformation}/>
          <Route path="#ipfs" component={Ipfs}/>
          <Route path="#manual" component={Manual}/>
          <Route path="#new-revision/:id" component={NewRevision}/>
          <Route path="#certify" component={Certify}/>
          <Route path="#audit-report/:id" component={AuditReport}/>
          <div class={$router.path === '#mint' || $router.path === "#redeem" ? 'tabs show' : 'tabs hide'}>
            <div class="tab-buttons">
              <button class:selected="{selectedTab === '#mint'}" class="tab-button"
                      on:click="{() =>  changeUrl('#mint')}">
                Mint
              </button>
              <button class:selected="{selectedTab === '#redeem'}" disabled={!$accountRoles?.WITHDRAWER}
                      class="redeem-tab tab-button"
                      on:click="{() =>  changeUrl('#redeem')}">
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

  <div class="footer w-full p-2 mt-5 {$account ? 'bg-white' :'' }">
    <div class="powered-by">
      <span>Powered by</span>
      <div><a href="https://www.gildlab.xyz/" target="_blank"><img src={icons.gild_lab} alt="Gild Lab"/></a></div>
      <span>and Rain</span>
      <div><a href="https://www.rainprotocol.xyz/" target="_blank"><img src={icons.rain} alt="Rain"/></a></div>
    </div>

  </div>
  {#if $transactionInProgressShow}
    <div class="blur"></div>
  {/if}
  <TransactionInProgressBanner topText={$promptTopText}
                               bottomText={$promptBottomText}
                               transactionHash={$transactionHash}
                               noBottomText={$promptNoBottom}
                               errorText={$promptErrorText}
                               successText={$promptSuccessText}
                               on:close={$promptCloseAction}/>
  <SFTCreateSuccessBanner/>
</Router>


<style lang="scss">
  .logo-container {
    z-index: 3;
    position: fixed;
    display: flex;
    top: 20px;
    left: 55px;
  }

  .logo-container img {
    height: 85px;
    width: 85px;
  }

  .border-6 {
    border-width: 6px
  }

  .container {
    display: flex;
    flex-direction: column;
  }

  .default-header {
    justify-content: space-between;
    display: flex;
    padding-left: 107px;
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
  }

  .sft-info-opened {
    margin-left: 36rem;
  }

  .invalid-network {
    background-color: transparent;
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: calc(100vh - 200px);
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
    min-width: 600px;
    max-width: 700px;
    min-height: 535px;
    background: #FFFFFF;
    border-radius: 0 20px 20px 20px;
    padding-bottom: 20px;
  }

  .redeem-tab {
    border-radius: 10px 10px 0 0 !important;
    margin-left: 2px;
  }

  .redeem-tab:disabled {
    color: #9D9D9D;
    opacity: 0.8;
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
    font-family: 'Inter', sans-serif;
  }

  .powered-by {
    width: 320px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-between;
  }

  .content {
    height: fit-content;
    min-height: 100vh;
  }

  .content-not-connected {
    min-height: 100vh;
    height: fit-content;
    background: rgb(181, 220, 255);
    background: linear-gradient(0deg, #b5dcff 0%, #6f5ea1 100%);
    background-attachment: fixed;
  }

  .blur {
    position: fixed;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(3.5px);
    top: 0;
    z-index: 3;
  }

  .certify-warning {
    width: 100%;
    padding-bottom: 1rem;
  }


</style>
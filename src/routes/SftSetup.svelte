<script>
    import {activeNetwork, data, roles, vault} from '../scripts/store.js';
    import {ethers} from "ethers";
    import contractFactoryAbi from "../contract/OffchainAssetVaultFactoryAbi.json"
    import contractAbi from "../contract/OffchainAssetVaultAbi.json"
    import {onMount} from "svelte";
    import {ADDRESS_ZERO, TEST_CONTRACT_ADDRESS} from "../scripts/consts.js"
    import {QUERY} from "../scripts/queries.js";
    import {getEventArgs, getContract, getSubgraphData, filterArray} from "../scripts/helpers.js";
    import {navigateTo} from "yrv";
    import SftLoader from "../components/SftLoader.svelte";
    import {icons} from "../scripts/assets.js";

    let name = "";
    let admin_ledger = "";
    let symbol = "";
    let url = "";
    let loading = false;
    let showSuccess = false
    let error = ''

    export let ethersData;
    let {signer, signerOrProvider, provider} = ethersData;
    let factoryContract;

    onMount(async () => {
        if ($activeNetwork) {
            factoryContract = await getContract($activeNetwork, $activeNetwork.factory_address, contractFactoryAbi, signerOrProvider)
        }
    });

    // async function createToken() {
    //     let contract = await getContract($activeNetwork, TEST_CONTRACT_ADDRESS, contractAbi, signerOrProvider)
    //     vault.set(contract)
    //     await getSgData(contract.address)
    //     console.log($vault.address)
    //     localStorage.setItem('vaultAddress', $vault.address)
    // }

    function goToRoles() {
        navigateTo("#roles", {replace: false});
    }

    async function createToken() {
        error = ""
        let addressValid = ethers.utils.isAddress(admin_ledger);

        if (!addressValid) {
            error = "Please check Super admin address"
            return
        }
        const constructionConfig = {
            admin: admin_ledger.trim(),
            vaultConfig: {
                asset: ADDRESS_ZERO,
                name,
                symbol,
            },
        };

        const receiptConfig = {
            uri: url,
        };
        let offChainAssetVaultTx;
        try {
            offChainAssetVaultTx = await factoryContract.createChildTyped(
                receiptConfig,
                constructionConfig
            )
            if (offChainAssetVaultTx.hash) {
                loading = true
            }

            let contract;
            contract = new ethers.Contract(
                ethers.utils.hexZeroPad(
                    ethers.utils.hexStripZeros(
                        (await getEventArgs(offChainAssetVaultTx, "NewChild", factoryContract)).child
                    ),
                    20
                ),
                contractAbi,
                signer.address
            );


            name = null;
            admin_ledger = null;
            symbol = null;
            url = null;

            console.log(
                "vault deployed to:",
                contract.address
            );

            let newVault = await getContract($activeNetwork, contract.address, contractAbi, signerOrProvider)
            vault.set(newVault)
            localStorage.setItem('vaultAddress', $vault.address)
            //wait for sg data
            await getSgData(newVault.address)

            showSuccess = true;

        } catch (er) {
            console.log(er)
            console.log(er.message)
        }
        loading = false
    }

    async function getSgData(vaultAddress) {
        let variables = {id: vaultAddress.toLowerCase()}

        getSubgraphData($activeNetwork, variables, QUERY, 'offchainAssetReceiptVault').then((res) => {
            if (res && res.data) {
                data.set(res.data)
                roles.set($data.offchainAssetReceiptVault.roles)

                let rolesFiltered = $roles.map(role => {
                    let roleRevokes = $data.offchainAssetReceiptVault.roleRevokes.filter(r => r.role.roleName === role.roleName)
                    let roleRevokedAccounts = roleRevokes.map(rr => rr.roleHolder.account.address)
                    let filtered = filterArray(role.roleHolders, roleRevokedAccounts)
                    return {roleName: role.roleName, roleHolders: filtered}
                })
                roles.set(rolesFiltered)
            }

        })

    }

</script>
{#if !loading}
  <div class="sft-setup-container">
    <label class="title f-weight-700">{!showSuccess ? 'SFT Setup' : ""}</label>
    {#if !showSuccess}
      <div class="form-box">
        <div class="space-between"><label class="f-weight-700">Token name:</label> <input type="text" bind:value={name}>
        </div>
        <div class="space-between"><label class="f-weight-700">Super admin address:</label> <input type="text"
                                                                                                   bind:value={admin_ledger}>
        </div>
        <div class="space-between"><label class="f-weight-700">Token symbol:</label> <input type="text"
                                                                                            bind:value={symbol}>
        </div>
        <div class="space-between"><label class="f-weight-700">URL:</label> <input type="text" bind:value={url}></div>
      </div>
    {/if}
    {#if showSuccess}
      <div class="success-container form-box">
        <span class="success">Your SFT Setup was successful!</span>
        <img src="{icons.success_circle}" alt="sft success"/>
      </div>
    {/if}
    <div class="form-after">
      <span class="info-text f-weight-700">After creating an SFT you???ll be added as an Admin; you???ll need to add other roles to manage the token.</span>
      <div class="error">{error}</div>
      {#if !showSuccess}
        <button class="create-token btn-solid btn-submit" disabled={!name || !admin_ledger || !symbol || !url}
                on:click={() => createToken()}>Create SFT
        </button>
      {/if}
      {#if showSuccess}
        <button class="create-token btn-solid btn-submit"
                on:click={() => goToRoles()}>Ok, take me to Roles
        </button>
      {/if}
    </div>
  </div>
{/if}
{#if loading}
  <div class="loader">
    <SftLoader></SftLoader>
  </div>
{/if}
<style>
    .sft-setup-container {
        max-width: 599px;
        left: 420px;
        top: 238px;
        background: #FFFFFF;
        border-radius: 20px;
        padding: 29px 11px;
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    .title {
        margin-left: 24px;
        margin-bottom: 11px;
        font-style: normal;
        font-size: 16px;
        line-height: 27px;
        color: #000000;
    }

    .form-box {
        box-sizing: border-box;
        width: 577px;
        height: 191px;
        border: 1px solid #D2D2D2;
        border-radius: 10px;
        padding: 28px;
    }

    .form-box label {
        font-style: normal;
        font-size: 16px;
        line-height: 27px;
    }

    .form-box input {
        width: 343px;
        height: 28px;
        background: #ECECEC;
        border-radius: 5px;
        border: none;
        margin-bottom: 7px;
        padding-left: 13px;
        font-style: normal;
        font-weight: 300;
        font-size: 16px;
        line-height: 27px;
    }

    .form-after {
        align-items: center;
        display: flex;
        flex-direction: column;
    }

    .info-text {
        font-style: normal;
        font-size: 12px;
        line-height: 20px;
        margin-top: 21px;
        margin-bottom: 20px;
    }

    .create-token {
        width: 413px;
    }

    .loader {
        width: 100%;
        height: 100%;
        z-index: 10;
        top: 0;
        left: 0;
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        /*background: #000000;*/
        /*opacity: 0.4;*/
    }

    .success-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
    }

    .error {
        margin-bottom: 10px;
    }

</style>
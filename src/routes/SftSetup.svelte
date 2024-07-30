<script>
    import {
        activeNetwork,
        data, pageTitle, SFTCreated, tokens,
        transactionError, transactionInProgress, transactionInProgressShow,
        transactionSuccess,
        vault, titleIcon, account
    } from '../scripts/store.js';
    import {ethers} from "ethers";
    import cloneFactoryAbi from "../contract/CloneFactory.json";
    import contractFactoryAbi from "../contract/OffchainAssetVaultFactoryAbi.json"
    import contractAbi from "../contract/OffchainAssetVaultAbi.json"
    import {
        ADDRESS_ZERO
    } from "../scripts/consts.js"
    import {QUERY, VAULTS_QUERY} from "../scripts/queries.js";
    import {
        getEventArgs,
        getContract,
        getSubgraphData,
        getEvent,
        showPromptSFTCreate
    } from "../scripts/helpers.js";
    import {onMount} from 'svelte';
    import {icons} from "../scripts/assets.js"
    import Connect from '../components/Connect.svelte';
    import networksV2 from '../scripts/networksConfigV2.js';

    let name = "";
    let admin_ledger = "";
    let symbol = "";
    let loading = false;
    let error = ''

    export let ethersData;
    let {signer, signerOrProvider, provider} = ethersData;
    let factoryContract;
    let cloneFactoryContract;

    onMount(() => {
        pageTitle.set("Setup new SFT")
        titleIcon.set(`${icons.sft_create}`)
    })

    // async function createToken() {
    //     let contract = await getContract($activeNetwork, TEST_CONTRACT_ADDRESS, contractAbi, signerOrProvider)
    //     vault.set(contract)
    //     await getSgData(contract.address)
    //     console.log($vault.address)
    //     localStorage.setItem('vaultAddress', $vault.address)
    //     navigateTo("#sft-create-success", {replace: false});
    // }

    async function createToken() {
        transactionError.set(false)
        transactionSuccess.set(false)
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

        let offChainAssetVaultTx;
        try {
            factoryContract = await getContract($activeNetwork, $activeNetwork.factory_address, contractFactoryAbi, signerOrProvider)

            // if new contract
            if ($activeNetwork.id && networksV2.some(element => element.id === $activeNetwork.id)) {
                cloneFactoryContract = await getContract($activeNetwork, $activeNetwork.factory_address, cloneFactoryAbi, signerOrProvider)
                const offchainAssetVaultConfig = {
                    admin: admin_ledger.trim(),
                    vaultConfig: {
                        asset: ADDRESS_ZERO,
                        name: name,
                        symbol: symbol
                    }
                };
                // Encode the initialization data
                let encodedVaultConfig = ethers.utils.defaultAbiCoder.encode(
                    [
                        {
                            type: 'tuple',
                            components: [
                                {type: 'address', name: 'admin'},
                                {
                                    type: 'tuple',
                                    name: 'vaultConfig',
                                    components: [
                                        {type: 'address', name: 'asset'},
                                        {type: 'string', name: 'name'},
                                        {type: 'string', name: 'symbol'}
                                    ]
                                }
                            ]
                        }
                    ],
                    [offchainAssetVaultConfig]
                );

                offChainAssetVaultTx = await cloneFactoryContract.clone($activeNetwork.implementation_address, encodedVaultConfig);
            } else {
                offChainAssetVaultTx = await factoryContract.createChildTyped(
                    constructionConfig
                )
            }

            await showPromptSFTCreate(offChainAssetVaultTx)

            let eventArgs;
            let contract;

            if ($activeNetwork.id && networksV2.some(element => element.id === $activeNetwork.id)) {
                eventArgs = await getEventArgs(offChainAssetVaultTx, "NewClone", cloneFactoryContract)
                contract = new ethers.Contract(
                    ethers.utils.hexZeroPad(
                        ethers.utils.hexStripZeros(
                            (eventArgs).clone
                        ),
                        20
                    ),
                    cloneFactoryAbi,
                    signer.address
                );
            } else {
                eventArgs = await getEventArgs(offChainAssetVaultTx, "NewChild", factoryContract)
                contract = new ethers.Contract(
                    ethers.utils.hexZeroPad(
                        ethers.utils.hexStripZeros(
                            (eventArgs).child
                        ),
                        20
                    ),
                    contractAbi,
                    signer.address
                );
            }


            console.log("vault deployed to:", contract.address);

            let newVault = await getContract($activeNetwork, contract.address, contractAbi, signerOrProvider)

            let createChildEvent = await getEvent(offChainAssetVaultTx, "OffchainAssetReceiptVaultInitialized", newVault)
            let deployBlockNumber = createChildEvent.blockNumber

            let wait = await offChainAssetVaultTx.wait()
            if (wait.status === 1) {
                let interval = setInterval(async () => {
                    await getTokens()
                    if (deployBlockNumber.toString() === $tokens[0].deployBlock) {
                        transactionInProgress.set(false)
                        transactionInProgressShow.set(false)
                        SFTCreated.set(true)
                        clearInterval(interval)
                        vault.set(newVault)
                        localStorage.setItem('vaultAddress', $vault.address)
                        //wait for sg data
                        await getSgData(newVault.address)
                    }
                }, 2000)
            } else {
                transactionError.set(true)
            }

        } catch (er) {
            console.log("error: ", er.message)
        }
        loading = false
    }

    async function getSgData(vaultAddress) {
        let variables = {id: vaultAddress.toLowerCase()}

        getSubgraphData($activeNetwork, variables, QUERY, 'offchainAssetReceiptVault').then((res) => {
            if (res && res.data) {
                data.set(res.data)
            }

        })

    }

    async function getTokens() {
        getSubgraphData($activeNetwork, {}, VAULTS_QUERY, 'offchainAssetReceiptVaults').then((res) => {
            if ($activeNetwork) {
                let temp = res.data.offchainAssetReceiptVaults
                tokens.set(temp)
            }
        })
    }


</script>
<div class="sft-setup-container min-w-[40rem] min-h-[20rem]">

  <div class="card-header justify-start">

    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clip-path="url(#clip0_4713_13519)">
        <path
          d="M12.8311 15.4956H16.5729M16.5729 15.4956H20.2145M16.5729 15.4956L16.5805 11.7666M16.5729 15.4956L16.5947 19.1736"
          stroke="#575757" stroke-width="2.07204" stroke-linecap="round" stroke-linejoin="round"/>
        <path
          d="M20.5154 12.0004C20.5154 11.269 20.4227 10.5594 20.2495 9.88202C19.3063 6.20543 15.9684 3.48535 12.0004 3.48535C7.30103 3.48535 3.48535 7.30103 3.48535 12.0004C3.48535 16.6997 7.30103 20.5154 12.0004 20.5154C12.5151 20.5154 13.0184 20.47 13.5075 20.382"
          stroke="#575757" stroke-width="1.89223" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_4713_13519">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <div class="mt-1">Setup new SFT</div>
  </div>
  {#if $account}
    <div class="form-box">
      <div class="space-between token-name">
        <label class="f-weight-700" for="name">Token name:</label>
        <input id="name" type="text" bind:value={name} maxlength="20">
        <div class="input-length">{name.length}/20</div>
      </div>
      <div class="space-between">
        <label class="f-weight-700" for="symbol">Token symbol:</label>
        <input type="text" id="symbol" bind:value={symbol}>
      </div>
      <div class="space-between">
        <label class="f-weight-700" for="admin">Super admin address:</label>
        <input type="text" id="admin" bind:value={admin_ledger}>
      </div>
      <div class="success info-text float-left">The ‘super admin address’ will need to assign roles to manage this
        token.
      </div>
    </div>
    <div class="footer">
      {#if error}
        <div class="error">{error}</div>

      {/if}
      <button class="create-token btn-solid btn-submit" disabled={!name || !admin_ledger || !symbol}
              on:click={() => createToken()}>Create SFT
      </button>
    </div>
  {:else}
    <Connect action="setup new SFT" className="pt-20"></Connect>
  {/if}

</div>
<style>
    .sft-setup-container {
        left: 420px;
        top: 238px;
        background: #FFFFFF;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    .card-header {
        gap: 13px;
        padding: 0 24px;
    }

    .form-box {
        box-sizing: border-box;
        width: 650px;
        border-radius: 10px;
        padding: 24px 45px 50px 60px;
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

    .footer {
        align-items: center;
        display: flex;
        flex-direction: column;
        border-top: 1px solid #D2D2D2;
        padding-top: 16px;
        padding-bottom: 16px;
    }

    .info-text {
        font-size: 16px;
        line-height: 20px;
        text-align: center;
    }

    .create-token {
        width: 413px;
        /*margin-top: 20px;*/
    }

    .error {
        margin-bottom: 10px;
    }

    .token-name {
        position: relative;
    }

    .input-length {
        position: absolute;
        right: 5px;
        margin-top: 3px;
        color: #B7B7B7;
        font-size: 14px;
    }

</style>
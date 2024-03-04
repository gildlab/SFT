<script>
    import {account, activeNetwork, isCypress, isMetamaskInstalled, pageTitle, titleIcon} from "../scripts/store.js";
    import {icons} from "../scripts/assets.js";
    import networks from "../scripts/networksConfig.js";
    import {createEventDispatcher, onMount} from "svelte";
    import {formatAddress, connectAccount} from "../scripts/helpers.js";
    import HeaderDropdown from './HeaderDropdown.svelte';
    import BreadCrumbs from './BreadCrumbs.svelte';

    export let location;


    onMount(()=>{
        isCypress.set(!!window.Cypress)

        if ($isCypress) {
            account.set('0xc0d477556c25c9d67e1f57245c7453da776b51cf')
            activeNetwork.set({
                "id": 80001,
                "chainId": 80001,
                "name": "mumbai",
                "displayName": "Mumbai testnet",
                "currencySymbol": "MATIC",
                "blockExplorer": "https://mumbai.polygonscan.com",
                "blockExplorerIcon": "polygonscan",
                "rpcUrl": "https://rpc-mumbai.maticvigil.com/",
                "icon": "polygon",
                "factory_address": "0x94927792b88D518f9a429572dD3D40400b8BE906",
                "subgraph_url": "https://api.thegraph.com/subgraphs/name/gildlab/offchainassetvault-mumbai"
            })
        }
        }
    )
    let accountMenuOptions = [
        {
            id: "copy",
            displayName: "Copy address",
            action: () => {
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    // this.showTooltip = true;
                    // setTimeout(() => {
                    //     this.showTooltip = false;
                    // }, 1000);
                    return navigator.clipboard.writeText($account);
                }
                return Promise.reject("The Clipboard API is not available.");
            },
            rightIcon: 'copy'
        },
        {
            id: "view",
            displayName: "View on explorer",
            action: () => {
                window.open(`${$activeNetwork.blockExplorer}/address/${$account}`);
            },
            class: 'underline',
        }
    ]

    const dispatch = createEventDispatcher();

    function handleNetworkSelect(event) {
        dispatch('select', {
            selected: event.detail.selected
        });
    }

    function handleAccountMenuOptionsSelect(event) {
        event.detail.selected.action()
    }

    async function connect() {
        let acc = await connectAccount()
        account.set(acc);
    }

</script>

<div class="{$isMetamaskInstalled ? 'header' : ''} flex w-full h-14 justify-between pr-12 items-center font-bold">
  {#if $isMetamaskInstalled}
    <div class="w-1/3"></div>
    <div class="page-title" id="{$pageTitle.replace(' ','-').toLowerCase()}">
      {#if $titleIcon}
        <img src={$titleIcon} alt="icon"/>
      {/if}
      {$pageTitle}</div>
    <div class="flex justify-end w-1/3 whitespace-nowrap items-center">
      <HeaderDropdown triggerIcon={icons[$activeNetwork?.icon]} id="networks-dropdown"
                      triggerLabel={$activeNetwork?.displayName  || 'Supported networks'}
                      items={networks} on:select={handleNetworkSelect}></HeaderDropdown>
      {#if $account}
        <HeaderDropdown triggerLabel={formatAddress($account)} id="account-dropdown"
                        items={accountMenuOptions} on:select={handleAccountMenuOptionsSelect} triggerIcon="">
        </HeaderDropdown>
      {:else }
        <button class="connect-metamask-btn f-weight-700" on:click={()=>connect()}>
          <span>Connect wallet</span>
        </button>

      {/if}
    </div>
    {#if location && (location !== "/" && location !== "#list")}
      <BreadCrumbs/>
    {/if}
  {/if}
</div>


<style>

    .header {
        z-index: 2;
        position: fixed;
        top: 0;
        background: #6F5EA1;
        background: linear-gradient(90.04deg, #B5DCFF 2.46%, #6F5EA1 96.36%);
    }

    .page-title {
        width: 33.3%;
        color: #FFFFFF;
        font-family: "Mukta", sans-serif;
        font-size: 18px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: center;
    }

    .connect-metamask-btn {
        border-radius: 30px;
        background: #2C2C54;
        color: #FFF;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        font-family: "Mukta", sans-serif;
        padding: 2px 32px;
        width: fit-content;
        cursor: pointer;
    }

</style>


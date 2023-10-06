<script>
    import Default from "./lib/Default.svelte";
    import Header from './components/Header.svelte';
    import {activeNetwork, account, pageTitle} from './scripts/store.js';
    import {ethers} from 'ethers';
    import BreadCrumbs from './components/BreadCrumbs.svelte';
    import {router} from 'yrv';

    async function handleNetworkSelect(event) {
        let activeNet = event.detail.selected;
        if ($activeNetwork && activeNet.chainId === $activeNetwork.chainId) {
            return;
        }
        let chainId = ethers.utils.hexValue(activeNet.chainId);
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
    }


    let location = $router.path

    router.subscribe(async e => {
            //reset pageTitle
            if (!e.initial) {
                location = e.path
            }
        }
    )
</script>

<main>
  {#if ($account)}
    <Header on:select={handleNetworkSelect}></Header>
    {#if location && (location !== "/" && location !== "#")}
      <BreadCrumbs/>
    {/if}
  {/if}

  <Default/>
</main>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&family=Rubik+Iso&display=swap');
</style>

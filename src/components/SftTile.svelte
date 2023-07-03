<script>
    import {icons} from "../scripts/assets.js"
    import {cborDecode, formatAddress, timeStampToDate} from '../scripts/helpers';
    import {ethers} from 'ethers';
    import {createEventDispatcher, onMount} from 'svelte';
    import {account, activeNetwork} from '../scripts/store.js';
    import {IPFS_GETWAY, MAGIC_NUMBERS} from '../scripts/consts.js';

    export let sft = {}
    let auditors = []
    let issuers = []
    let sftLogo;
    let logoPreview;

    onMount(() => {
        getSftData()
    })

    $: sft && getSftData()

    function getSftData() {
        getVaultImages()
        getAuditors()
        getIssuers()
    }

    function getAuditors() {
        if (sft.address) {
            let tempAuditors = sft.roleHolders.filter(rh => rh.role.roleName === 'CERTIFIER')
            auditors = tempAuditors.map(a => a.account.address)
        }
    }

    function getIssuers() {
        if (sft.address) {
            let tempAuditors = sft.roleHolders.filter(rh => rh.role.roleName === 'DEPOSITOR')
            issuers = tempAuditors.map(a => a.account.address)
        }
    }

    const dispatch = createEventDispatcher();


    const onFileSelected = (e) => {
        let file = e.target.files[0];
        dispatch('fileDrop', {
            file,
            imageElement: logoPreview,
            vault: sft
        });
    }

    const onTokenSelect = (token) => {
        dispatch('tokenSelect', {
            token,
        });
    }

    async function getVaultImages() {
        let receiptVaultInformations = sft.receiptVaultInformations
        if (receiptVaultInformations.length) {
            let receiptInformations = receiptVaultInformations.map(data => {
                return cborDecode(data.information.slice(18))
            })
            let sftImages = receiptInformations.filter(i => i[0].get(1) === MAGIC_NUMBERS.OA_TOKEN_IMAGE)
            if (sftImages.length) {
                sft.icon = sftImages[0][1].get(0)
            }
        }
    }

</script>
<div class="w-full bg-white pt-5 pb-8 px-10 flex flex-row-reverse rounded-xl justify-between relative ">
  <div class="img-container">
    <div class="sft-logo-container rounded-full" class:hover={sft.deployer.toLowerCase() === $account.toLowerCase()}>
      <label for={`${sft.address}-upload`} id="sft-logo-upload"
             class="flex items-center justify-center text-white flex-col {sft.deployer.toLowerCase() === $account.toLowerCase() ? 'cursor-pointer' : '' }">
        {#if sft.icon}
          <img src={`${IPFS_GETWAY}${sft.icon}`} alt="sft logo" class="logo" bind:this={logoPreview}/>
          {#if sft.deployer.toLowerCase() === $account.toLowerCase()}
            <div class="update absolute flex-col flex items-center justify-center">
              <img src="{icons.camera}" alt="sft logo"/>
              <span class="text">Update</span>
            </div>
          {/if}
        {/if}
        {#if !sft.icon}
          {#if sft.deployer.toLowerCase() === $account.toLowerCase()}
            <img src="{icons.camera}" alt="sft logo"/>
            <span class="text">Update</span>
          {/if}
        {/if}
        {#if sft.deployer.toLowerCase() === $account.toLowerCase()}
          <input type="file" id={`${sft.address}-upload`} hidden accept=".jpg, .jpeg, .png, .svg"
                 on:change={(e)=>onFileSelected(e)}
                 bind:this={sftLogo}/>
        {/if}
      </label>

    </div>
    <div class="absolute top-2 right-2 cursor-pointer expand-btn">
      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 10.3999L19 5.1999M19 5.1999L19 10.3999M19 5.1999L14 5.1999" stroke="#9D9D9D" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 10.3999L19 5.1999M19 5.1999L19 10.3999M19 5.1999L14 5.1999" stroke="black" stroke-opacity="0.2"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 14.5601L5 19.7601M5 19.7601L5 14.5601M5 19.7601H10" stroke="#9D9D9D" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 14.5601L5 19.7601M5 19.7601L5 14.5601M5 19.7601H10" stroke="black" stroke-opacity="0.2"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
  <table class="w-8/12 leading-8 text-left">
    <tr>
      <td class="font-bold">Token name</td>
      <td class="sft-name brown">
        <span on:click={()=>onTokenSelect(sft)} class="underline cursor-pointer">{sft.name}</span>
      </td>
    </tr>
    <tr>
      <td class="font-bold">Token symbol</td>
      <td class="sft-info">{sft.symbol}</td>
    </tr>
    <tr>
      <td class="font-bold">Creation date</td>
      <td class="sft-info">{timeStampToDate(sft.deployTimestamp)}</td>
    </tr>
    <tr>
      <td class="font-bold">Number of holders</td>
      <td class="sft-info">{sft.tokenHolders.filter(h => h.balance !== "0").length}</td>
    </tr>
    <tr>
      <td class="font-bold">Token supply</td>
      <td class="sft-info">{sft?.totalShares ? ethers.utils.formatUnits(sft?.totalShares, 18) : 0}</td>
    </tr>
    <tr>
      <td class="font-bold align-text-top">Name of auditor(s)</td>
      <td class="sft-info">
        {#if !auditors.length}
          <div>N/A</div>
        {/if}
        {#each auditors as auditor}
          <div class="underline brown">
            <a href={`${$activeNetwork.blockExplorer}/address/${auditor}`} target="_blank">{formatAddress(auditor)}</a>
          </div>
        {/each}
      </td>

    </tr>
    <tr>
      <td class="font-bold">Name of issuer</td>
      <td class="sft-info">
        {#if !issuers.length}
          <div>N/A</div>
        {/if}
        {#each issuers as issuer}
          <div class="underline brown">
            <a href={`${$activeNetwork.blockExplorer}/address/${issuer}`} target="_blank">{formatAddress(issuer)}</a>
          </div>
        {/each}
      </td>
    </tr>
  </table>
</div>

<style>

    .sft-info {
        color: #575757
    }

    .img-container {
        width: 88px;
        height: 88px;
    }

    .sft-logo-container {
        background: #9D9D9D;
        width: 88px;
        height: 88px;
    }

    .sft-logo-container .logo {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .sft-logo-container.hover:hover {
        background: rgba(0, 0, 0, 0.6);
    }

    #sft-logo-upload {
        width: 88px;
        height: 88px;
    }

    .update {
        display: none;
        width: inherit;
        height: inherit;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
    }

    .sft-logo-container:hover .update {
        display: flex;
    }
</style>
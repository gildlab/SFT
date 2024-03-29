<script>
    import {icons} from "../scripts/assets.js"
    import {bytesToMeta, cborDecode, formatAddress, navigate, timeStampToDate} from '../scripts/helpers';
    import {ethers} from 'ethers';
    import {createEventDispatcher, onMount} from 'svelte';
    import {account} from '../scripts/store.js';
    import {IPFS_GETWAY, MAGIC_NUMBERS} from '../scripts/consts.js';
    import CredentialLinksEditor from './CredentialLinksEditor.svelte';
    import SftCredentialLinks from './SftCredentialLinks.svelte';

    export let sft = {}
    let auditors = []
    let issuers = []
    let sftLogo;
    let logoPreview;
    let isEditorOpen = false;
    const dispatch = createEventDispatcher();


    onMount(() => {
        getSftData()
    })

    $: sft && getSftData()

    function getSftData() {
        getVaultInformation()
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

    async function getVaultInformation() {
        let receiptVaultInformations = sft.receiptVaultInformations
        if (receiptVaultInformations.length) {
            let receiptInformations = receiptVaultInformations.map(data => {
                return cborDecode(data.information.slice(18))
            })
            let sftImages = receiptInformations.filter(i => i[0].get(1) === MAGIC_NUMBERS.OA_TOKEN_IMAGE)
            let sftCredentialLinks = receiptInformations.filter(i => i[0].get(1) ===
                MAGIC_NUMBERS.OA_TOKEN_CREDENTIAL_LINKS)
            if (sftImages.length) {
                sft.icon = sftImages[0][1].get(0)
            }
            if (sftCredentialLinks.length) {
                sft.credentialLinks = bytesToMeta(sftCredentialLinks[0][0].get(0), "json")
            }
        }
    }

    function openEditor() {
        isEditorOpen = true;
    }

    function handleOkButtonClick(event) {
        dispatch('okClick', {credentialLinks: event.detail.credentialLinks, token: event.detail.token});
    }
</script>
<div class="w-full bg-white pt-5 pb-5 {!isEditorOpen? 'pl-10 pr-6' : ''} tile relative token-{sft.name}">
  <div class="absolute right-2 cursor-pointer expand-btn">
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
  {#if !isEditorOpen}
    <div class=" mb-7 relative">
      <table class="leading-8 text-left">
        <tr>
          <td class="font-bold label ">Token name</td>
          <td class=" brown">
            <div on:click={()=>onTokenSelect(sft)} class="sft-name underline cursor-pointer"
                 id="{`token-name-${sft.name}`}">
              {sft.name.slice(0, 20)} {sft.name.length > 20 ? '...' : ''}
              {#if sft.name.length > 20}<span class="tooltip-text">{sft.name}</span>{/if}
            </div>
          </td>
        </tr>
        <tr>
          <td class="font-bold label">Token symbol</td>
          <td class="sft-info">{sft.symbol}</td>
        </tr>
        <tr>
          <td class="font-bold label">Creation date</td>
          <td class="sft-info">{timeStampToDate(sft.deployTimestamp)}</td>
        </tr>
        <tr>
          <td class="font-bold label">Number of holders</td>
          <td class="sft-info">{sft.tokenHolders.filter(h => h.balance !== "0").length}</td>
        </tr>
        <tr>
          <td class="font-bold label">Token supply</td>
          <td class="sft-info">{sft?.totalShares ? ethers.utils.formatUnits(sft?.totalShares, 18) : 0}</td>
        </tr>
        <tr>
          <td class="font-bold label align-text-top">Name of auditor(s)</td>
          <td class="sft-info value-list">
            {#if !auditors.length}
              <div>N/A</div>
            {/if}
            {#each auditors as auditor,i}
              {#if auditors.length <= 2}
                <div class="underline brown cursor-pointer">
                <span
                  on:click={()=>{navigate(`#address-overview/${auditor}`, {clear : true})}}>{formatAddress(auditor)}</span>
                </div>
              {/if}
              {#if auditors.length > 2 && i < 1}
                <div class="underline brown cursor-pointer">
                <span
                  on:click={()=>{navigate(`#address-overview/${auditor}`, {clear : true})}}>{formatAddress(auditor)}</span>
                </div>
              {/if}
            {/each}
            {#if auditors.length > 2}
              <div class="underline brown cursor-pointer">
                <span on:click={()=>{navigate(`#token-overview/${sft.address}`)}}>...more</span>
              </div>
            {/if}
          </td>

        </tr>
        <tr>
          <td class="font-bold label">Name of issuer</td>
          <td class="sft-info value-list">
            {#if !issuers.length}
              <div>N/A</div>
            {/if}
            {#each issuers as issuer,i}
              {#if issuers.length <= 2}
                <div class="underline brown cursor-pointer">
                <span
                  on:click={()=>{navigate(`#address-overview/${issuer}`, {clear : true})}}>{formatAddress(issuer)}</span>
                </div>
              {/if}
              {#if issuers.length > 2 && i < 1}
                <div class="underline brown cursor-pointer">
                <span
                  on:click={()=>{navigate(`#address-overview/${issuer}`, {clear : true})}}>{formatAddress(issuer)}</span>
                </div>
              {/if}
            {/each}
            {#if issuers.length > 2}
              <div class="underline brown cursor-pointer">
                <span on:click={()=>{navigate(`#token-overview/${sft.address}`)}}>...more</span>
              </div>
            {/if}

          </td>
        </tr>
      </table>
      <div class="img-container mr-8 absolute ">
        <div class="sft-logo-container rounded-full"
             class:hover={sft.deployer.toLowerCase() === $account.toLowerCase()}>
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
      </div>
    </div>
    <div class="links-container">
      <SftCredentialLinks {sft} on:editClick={openEditor}/>
    </div>
  {/if}
  {#if isEditorOpen}
    <CredentialLinksEditor on:okClick={handleOkButtonClick} {sft}/>
    <div class="back flex justify-end w-full cursor-pointer" on:click={()=>{isEditorOpen = false}}>
      <img src={icons.back} alt="back" class="mr-6">
    </div>
  {/if}
</div>

<style>

    .tile {
        border-radius: 10px;
    }

    .sft-info {
        color: #575757;
        padding-left: 40px;
    }

    .sft-name {
        padding-left: 40px;
        position: relative;
    }

    .sft-name:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
    }

    .label {
        white-space: nowrap;
    }

    .value-list {
        display: flex;
        column-gap: 20px;
        flex-wrap: wrap;
    }

    .img-container {
        width: 88px;
        height: 88px;
        top: 0;
        right: 0;
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

    .expand-btn {
        top: 0.7rem;
        right: 1.2rem;
    }

    .links-container {
        position: absolute;
        bottom: 1rem;
        right: 1.5rem;
    }

</style>
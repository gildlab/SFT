<script>
    import {icons} from '../scripts/assets.js';
    import {account, activeNetwork} from '../scripts/store.js';
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    function handleEditClick(event) {
        dispatch("editClick");
    }

    export let sft;
</script>
<div class="links">
  {#if sft.credentialLinks}
    {#if sft.credentialLinks.twitter}
      <a href={sft.credentialLinks.twitter} target="_blank">
        <img class="link-icon" src={icons.twitter} alt="twitter"></a>{/if}
    {#if sft.credentialLinks.telegram}
      <a href={sft.credentialLinks.telegram} target="_blank">
        <img class="link-icon" src={icons.telegram} alt="telegram"></a>{/if}
    {#if sft.credentialLinks.github}
      <a href={sft.credentialLinks.github} target="_blank">
        <img class="link-icon" src={icons.github} alt="github"></a>{/if}
    {#if sft.credentialLinks.discord}
      <a href={sft.credentialLinks.discord} target="_blank">
        <img class="link-icon" src={icons.discord} alt="discord"></a>{/if}
    {#if sft.credentialLinks.webLink}
      <a href={sft.credentialLinks.webLink} target="_blank">
        <img class="link-icon" src={icons.web_brown} alt="web"></a>{/if}
  {/if}
  <a href={`${$activeNetwork?.blockExplorer}/address/${sft.address}`} target="_blank">
    <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
  </a>
  {#if sft?.deployer?.toLowerCase() === $account.toLowerCase()}
    <img class="link-icon edit" src={icons.edit} alt="edit" on:click={handleEditClick}>
  {/if}
</div>

<style>

    .links {
        display: flex;
        align-items: center;
    }


    .edit {
        width: 21px;
        height: 21px;
    }
</style>
<script>
    import {createEventDispatcher} from 'svelte';
    import SftList from './SftList.svelte';
    import CredentialLinksEditor from './CredentialLinksEditor.svelte';
    import {icons} from '../scripts/assets.js';

    const dispatch = createEventDispatcher();
    export let tokens;
    let isEditorOpen = false
    let tokenToEdit;

    function handleTokenSelect(event) {
        dispatch('tokenSelect', {
            token: event.detail.token,
        });
    }

    function handleInputs(event) {
        dispatch('inputValueChange', {
            credentialLinks: event.detail.credentialLinks,
        });
    }

    function handleFileDrop(e) {
        dispatch('fileDrop', {
            file: e.detail.file,
            imageElement: e.detail.imageElement,
            vault: e.detail.vault
        });
    }

    function handleEditClick(event) {
        tokenToEdit = event.detail.token
        isEditorOpen = true
        dispatch('listEditClick');
    }

    function editorClosed() {
        isEditorOpen = false
        dispatch('listEditClosed');
    }

</script>
<div>
  {#if !isEditorOpen}
    <table class="sft-table">
      <thead>
      <tr>
        <th style="width: 99px"></th>
        <th>Token name</th>
        <th>Token symbol</th>
        <th>Creation date</th>
        <th>Number of holders</th>
        <th>Token supply</th>
        <th>Auditor(s)</th>
        <th>Name of issuer</th>
      </tr>
      </thead>
      <tbody>
      {#each tokens as sft }
        <SftList sft={sft} on:fileDrop={handleFileDrop} on:tokenSelect={handleTokenSelect}
                 on:inputValueChange={handleInputs} on:editClick={handleEditClick}></SftList>
      {/each}
      </tbody>
    </table>
  {/if}
  {#if isEditorOpen}
    <div class="editor mr-16 pt-4">
      <div class="back flex ml-5 w-full cursor-pointer" on:click={()=>{editorClosed()}}>
        <img src={icons.back} alt="back" class="mr-6">
      </div>
      <CredentialLinksEditor on:inputValueChange={handleInputs} sft={tokenToEdit}/>
    </div>
  {/if}
</div>
<style>
    .editor {
        background: #FFFFFF;
        height: 100vh;
        border-radius: 8px;
    }
</style>
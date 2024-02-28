<script>
    import {ethers} from 'ethers';
    import {icons} from '../scripts/assets.js';
    import {activeNetwork} from '../scripts/store.js';
    import {router} from 'yrv';
    import {navigate} from '../scripts/helpers.js';
    import SftLoader from './SftLoader.svelte';
    import Pagination from './Pagination.svelte';

    export let sftsData = []
    export let loading = false
    let address = $router.params.address

    export let perPage = 10
    let currentPage = 1;
    let filteredData = []

    $: sftsData && handlePageChange()

    async function handlePageChange(event) {
        currentPage = event?.detail.currentPage || 1
        let skip = (perPage * (currentPage - 1)) - 1
        filteredData = sftsData.filter((r, index) => index > skip && index < perPage * currentPage)
    }

</script>
<table class="sft-table relative">
  <thead>
  <tr>
    <th class="w-1/12"></th>
    <th>SFT name</th>
    <th>Balance</th>
  </tr>
  </thead>
  <tbody>
  {#if sftsData.length}
    {#each filteredData as sft}
      <tr>
        <td class="w-1/12">
          <a href={`${$activeNetwork?.blockExplorer}/address/${sft.address}`} target="_blank">
            <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
          </a>
        </td>
        <td><span on:click={()=>{navigate(`#token-overview/${sft.address}`)}}
                  class="brown underline cursor-pointer">{sft.name}</span></td>
        <td>{ethers.utils.formatUnits(sft.totalShares, 18)}</td>
      </tr>
    {/each}
  {/if}
  {#if !sftsData.length}
    <tr>
      <td colspan="3">
        {#if (!loading)}
          No data available
        {/if}
        {#if (loading)}
          <SftLoader width="50"></SftLoader>
        {/if}
      </td>
    </tr>
  {/if}
  </tbody>
  {#if sftsData.length}
    <Pagination dataLength={sftsData.length} {perPage} on:pageChange={handlePageChange}/>
  {/if}
</table>

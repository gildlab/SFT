<script>
    import {ethers} from 'ethers';
    import {toIsoDate, formatAddress} from '../scripts/helpers.js';
    import {icons} from '../scripts/assets.js';
    import {activeNetwork} from '../scripts/store.js';
    import SftLoader from './SftLoader.svelte';
    import Pagination from './Pagination.svelte';
    export let loading = false
    export let certificationsData = []
    export let perPage = 10
    let currentPage = 1;
    let filteredData = []

    $: certificationsData && handlePageChange()
    async function handlePageChange(event) {
        currentPage = event?.detail.currentPage || 1
        let skip = (perPage * (currentPage - 1)) - 1
        filteredData = certificationsData.filter((r, index) => index > skip && index < perPage * currentPage)
    }
</script>
<table class="sft-table relative">
  <thead>
  <tr>
    <th class="w-1/12"></th>
    <th>Total amount</th>
    <th>Certified on</th>
    <th>Certified by</th>
  </tr>
  </thead>
  <tbody>
  {#if certificationsData.length}
    {#each filteredData as cert}
      <tr>
        <td class="w-1/12">
          <a href={`${$activeNetwork?.blockExplorer}/tx/${cert.transaction.id}`} target="_blank">
            <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
          </a>
        </td>
        <td>{ethers.utils.formatUnits(cert.totalShares, 18)}</td>
        <td>{toIsoDate(cert.timestamp)}</td>
        <td>{formatAddress(cert.emitter.address)}</td>
      </tr>
    {/each}
  {/if}
  {#if !certificationsData.length}
    <tr>
      <td colspan="4">
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
  {#if certificationsData.length}
    <Pagination dataLength={certificationsData.length} {perPage} on:pageChange={handlePageChange}/>
  {/if}
</table>

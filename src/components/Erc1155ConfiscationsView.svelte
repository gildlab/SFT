<script>
    import {ethers} from 'ethers';
    import {toIsoDate, formatAddress, navigate} from '../scripts/helpers.js';
    import {icons} from '../scripts/assets.js';
    import {activeNetwork} from '../scripts/store.js';
    import SftLoader from './SftLoader.svelte';
    import Pagination from './Pagination.svelte';

    export let confiscations = []
    export let loading = false
    export let perPage = 10
    let currentPage = 1;
    let filteredData = []

    $: confiscations && handlePageChange()

    async function handlePageChange(event) {
        currentPage = event?.detail.currentPage || 1
        let skip = (perPage * (currentPage - 1)) - 1
        filteredData = confiscations.filter((r, index) => index > skip && index < perPage * currentPage)
    }

</script>
<table class="sft-table relative">
  <thead>
  <tr>
    <th class="w-1/12"></th>
    <th>SFT</th>
    <th>Amount</th>
    <th>Receipt ID</th>
    <th>Confiscated from</th>
    <th>Date</th>
  </tr>
  </thead>
  <tbody>
  {#if confiscations.length}
    {#each filteredData as confiscation}
      <tr>
        <td class="w-1/12">
          <a href={`${$activeNetwork?.blockExplorer}/tx/${confiscation.transaction.id}`} target="_blank">
            <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
          </a>
        </td>
        <td>{confiscation.offchainAssetReceiptVault.name}</td>
        <td>{ethers.utils.formatUnits(confiscation.confiscated, 18)}</td>
        <td>
          {#if (confiscation.receipt.receiptInformations.length)}
           <span class="brown underline cursor-pointer"
                 on:click={()=>{ navigate(`#asset-information/${confiscation.receipt.receiptId}/${confiscation.receipt.receiptInformations[0].id}`)}}>
           {confiscation.receipt.receiptId}
          </span>
          {/if}
        </td>
        <td>{formatAddress(confiscation.confiscatee.address)}</td>
        <td>{toIsoDate(confiscation.timestamp)}</td>
      </tr>
    {/each}
  {/if}
  {#if !confiscations.length}
    <tr>
      <td colspan="6">
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
  {#if confiscations.length}
    <Pagination dataLength={confiscations.length} {perPage} on:pageChange={handlePageChange}/>
  {/if}
</table>

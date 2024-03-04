<script>
    import {ethers} from 'ethers';
    import {formatHash, navigate, toIsoDate} from '../scripts/helpers.js';
    import {icons} from '../scripts/assets.js';
    import {activeNetwork} from '../scripts/store.js';
    import Pagination from './Pagination.svelte';
    import SftLoader from './SftLoader.svelte';

    export let mintRedeemData = []
    export let perPage = 10
    export let loading = false
    let currentPage = 1;
    let filteredData = []

    $: mintRedeemData && handlePageChange()

    async function handlePageChange(event) {
        currentPage = event?.detail.currentPage || 1
        let skip = (perPage * (currentPage - 1)) - 1
        filteredData = mintRedeemData.filter((r, index) => index > skip && index < perPage * currentPage)
    }
</script>
<div class="sft-table-container">
  <table class="sft-table relative">
    <thead>
    <tr>
      <th class="w-1/12"></th>
      <th>Revision type</th>
      <th>Vault</th>
      <th>Amount</th>
      <th>Receipt ID</th>
      <th>Revision ID</th>
      <th>Date</th>
    </tr>
    </thead>
    <tbody>
    {#if mintRedeemData.length}
      {#each filteredData as mr, i}
        <tr>
          <td class="w-1/12">
            <a href={`${$activeNetwork?.blockExplorer}/tx/${mr.transaction}`} target="_blank">
              <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
            </a>
          </td>
          <td>{mr.type}</td>
          <td>{mr.vault}</td>
          <td>{mr.amount ? ethers.utils.formatUnits(mr.amount, 18) : 0}</td>
          <td>
          <span class="brown underline cursor-pointer"
                on:click={()=>{ navigate(`#asset-information/${mr.receiptId}/${mr.revisionId}`)}}>
            {mr.receiptId}
          </span>
          </td>
          <td>
          <span class="brown underline cursor-pointer" on:click={()=>{ navigate(`#asset-information/${mr.receiptId}/${mr.revisionId}`)}}>
                    {formatHash(mr.transaction)}
        </span>
          </td>
          <td>{toIsoDate(mr.date)}</td>
        </tr>
      {/each}
    {/if}
    {#if !mintRedeemData.length}
      <tr>
        <td colspan="7">
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

  </table>
  {#if mintRedeemData.length}

    <Pagination dataLength={mintRedeemData.length} {perPage} on:pageChange={handlePageChange}/>
  {/if}

</div>


<script>
    import RouteSchema from "../components/RouteWithTitle.svelte";
    import {beforeUpdate} from "svelte";
    import {activeNetwork, auditHistory, vault} from "../scripts/store.js";
    import {getSubgraphData, timeStampToDate} from "../scripts/helpers.js";
    import {AUDIT_HISTORY_DATA_QUERY} from "../scripts/queries.js";
    import {ethers} from "ethers";

    let receipts = []

    beforeUpdate(async () => {
        if (!$auditHistory.id) {
            let vaultAddress = localStorage.getItem("vaultAddress")
            let data = await getSubgraphData($activeNetwork, {id: vaultAddress.toLowerCase()}, AUDIT_HISTORY_DATA_QUERY, 'offchainAssetReceiptVault')
            if (data) {
                let temp = data.data.offchainAssetReceiptVault
                auditHistory.set(temp)
            } else return {}
        }
        receipts = $auditHistory?.deposits
    })
</script>
<RouteSchema>
  <div slot="header">
    Asset Register
  </div>
  <div class="table-container" slot="content">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">Receipt ID</th>
        <th scope="col">Options</th>
        <th scope="col">Last Updated</th>
      </tr>
      </thead>
      <tbody>
      {#each receipts as receipt}
        <!--            <tr class="tb-row" on:click={()=>{goToReceiptAudit(receipt)}}>-->
        <tr class="tb-row">
          <td class="receipt">{receipt.receipt.receiptId}</td>
          <td>{ethers.utils.formatUnits(receipt.amount, 18)}</td>
          <td>{timeStampToDate(receipt.timestamp)}</td>
        </tr>
      {/each}
      </tbody>
    </table>
  </div>
</RouteSchema>


<style>

    .table-container {
        width: 100%;
    }

    tr td, tr th {
        padding-top: 0;
        padding-bottom: 0;
        line-height: 27px;
        width: 33.3%;
    }

    tr:nth-child(even) {
        background-color: #F0EFF1;
    }

    tr:nth-child(odd) {
        background-color: #FFFFFF;
    }

    thead tr th {
        background: #9196C5;
        color: #FFFFFF;
    }

    .tb-row:hover .receipt {
        text-decoration: underline;
    }
</style>
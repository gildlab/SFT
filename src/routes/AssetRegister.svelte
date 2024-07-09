<script>
    import {
        vault,
        auditHistory,
        activeNetwork,
        selectedReceipt, sftInfo, pageTitle, schemas
    } from "../scripts/store";
    import {
        cborDecode,
        getSubgraphData, navigate,
        timeStampToDate
    } from "../scripts/helpers.js";
    import {AUDIT_HISTORY_DATA_QUERY} from "../scripts/queries.js";
    import {ethers} from "ethers";
    import {
        MAGIC_NUMBERS,
    } from "../scripts/consts.js";
    import SftLoader from "../components/SftLoader.svelte";
    import Pagination from '../components/Pagination.svelte';
    import {mock} from '../test/mock.js';

    let receipts = []
    let loading = false;
    let tempReceipts = [];
    let filteredReceipts = [];
    let perPage = 20;
    let currentPage = 1;

    $:$activeNetwork && getAuditHistory();

    async function setAssetClasses() {
        receipts = await Promise.all(tempReceipts.map(async (r) => {
            let information = r.receipt.receiptInformations[0]?.information ?
                cborDecode(r.receipt.receiptInformations[0]?.information.slice(18)) :
                null
            let schemaHash = information[0].get(MAGIC_NUMBERS.OA_SCHEMA)
            let assetClass = !!window.Cypress ?
                mock.schemas.find(s => s.hash === schemaHash.toString()) :
                $schemas.find(s => s.hash === schemaHash.toString())

            return {...r, information, schema: assetClass}
        }))
        let skip = (perPage * (currentPage - 1)) - 1
        filteredReceipts = receipts.filter((r, index) => index > skip && index < perPage * currentPage)
    }

    function goToAssetInformation(receipt) {
        selectedReceipt.set(receipt)
        console.log("asdf", $selectedReceipt)
        localStorage.setItem("selectedReceiptSchema", $selectedReceipt?.schema?.hash)
        navigate(`#asset-information/${$selectedReceipt.receipt.receiptId}/${receipt.receipt.receiptInformations[0].id}`)
    }

    async function getAuditHistory() {
        //set pageTitle
        pageTitle.set("Asset register")

        if ($vault.address) {
            loading = true
            try {
                let data = await getSubgraphData($activeNetwork, {id: $vault.address.toLowerCase()}, AUDIT_HISTORY_DATA_QUERY, 'offchainAssetReceiptVault')

                if (data) {
                    let temp = data.data.offchainAssetReceiptVault
                    auditHistory.set(temp)
                } else {
                    auditHistory.set({})
                }
            } catch (e) {
                console.log(e)
            }

            loading = false
        }
        tempReceipts = $auditHistory?.deposits || []
        await setAssetClasses()
    }

    async function handlePageChange(event) {
        currentPage = event.detail.currentPage
        let skip = (perPage * (currentPage - 1)) - 1
        filteredReceipts = receipts.filter((r, index) => index > skip && index < perPage * currentPage)
    }

</script>
<div class="{$sftInfo ? 'w-full' : 'left-margin'} receipts">
  {#if loading}
    <SftLoader/>
  {/if}
  {#if !loading }
    <div class="sft-table-container">
      <table class="sft-table">
        <thead>
        <tr>
          <th>Receipt ID</th>
          <th>Asset class</th>
          <th>Amount</th>
          <th>Last updated</th>
        </tr>
        </thead>
        <tbody>
        {#if receipts.length}
          {#each filteredReceipts as receipt}
            <tr class="tb-row">
              <td class="brown hover-underline cursor-pointer receipt-{receipt.receipt.receiptId}"
                  on:click={()=>{goToAssetInformation(receipt)}}
                  id="receipt-{receipt.receipt.receiptId}">{receipt.receipt.receiptId}</td>
              <td class="asset-class-cell">{receipt.schema?.displayName || ""}</td>
              <td>{ethers.utils.formatUnits(receipt.amount, 18)}</td>
              <td>{timeStampToDate(receipt.timestamp)}</td>
            </tr>
          {/each}
        {/if}
        </tbody>
      </table>
      <Pagination dataLength={receipts.length} {perPage} on:pageChange={handlePageChange}/>
    </div>
  {/if}
</div>

<style>
    .left-margin {
        margin-left: 223px;
    }

    .receipts {
        /*width: 100%;*/
        margin-right: 20px;
    }

</style>

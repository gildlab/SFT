<script>
    import {
        vault,
        activeNetwork,
        sftInfo, pageTitle, selectedReceiptInformations, selectedReceipt, breadCrumbs
    } from "../scripts/store";
    import {
        formatAddress, formatHash,
        getSubgraphData,
        timeStampToDate
    } from "../scripts/helpers.js";
    import {RECEIPT_INFORMATIONS_QUERY} from "../scripts/queries.js";
    import {ethers} from "ethers";
    import SftLoader from "../components/SftLoader.svelte";
    import Pagination from '../components/Pagination.svelte';
    import {navigate} from '../scripts/helpers.js';
    import {ROUTE_LABEL_MAP} from '../scripts/consts.js';
    import {navigateTo} from 'yrv';

    let receiptInformations = []
    let receipt;
    let loading = false;
    let filteredReceiptInformations = [];
    let perPage = 20;
    let currentPage = 1;
    let selected = [];

    let selectedReceiptId = window.location.hash.split("/")[1]

    $:$activeNetwork && getAuditHistory();

    async function getAuditHistory() {
        //set pageTitle
        pageTitle.set("Asset history")

        let variables
        if (!receipt) {
            let receiptId = $vault.address + "-" + window.location.hash.split("/")[1]
            variables = {id: receiptId}
        } else {
            variables = {id: receipt.id}
        }
        loading = true;
        try {
            let resp = await getSubgraphData($activeNetwork, variables, RECEIPT_INFORMATIONS_QUERY, 'receipt')
            receiptInformations = resp.data?.receipt.receiptInformations || []
            receipt = resp.data
            let skip = (perPage * (currentPage - 1)) - 1
            filteredReceiptInformations = receiptInformations.filter((r, index) => index > skip && index < perPage *
                currentPage)

        } catch (e) {
            console.log(e)
        }
        loading = false;


    }

    async function handlePageChange(event) {
        currentPage = event.detail.currentPage
        let skip = (perPage * (currentPage - 1)) - 1
        filteredReceiptInformations = receiptInformations.filter((r, index) => index > skip && index < perPage *
            currentPage)
    }

    function viewInExplorer(hash) {
        window.open(`${$activeNetwork.blockExplorer}/tx/${hash}`);
    }

    function compareHistory() {
        if (selected.length) {
            localStorage.setItem("information_before", selected[1])
            localStorage.setItem("information_after", selected[0])
            selectedReceiptInformations.set(selected)
            navigate("#change-comparison")
        }
    }

    function goToAssetInformation(information) {
        selectedReceipt.set(receipt)
        let temp = receipt.receipt.receiptInformations.find(r => r.id === information.id)
        breadCrumbs.update(() =>
            [...$breadCrumbs,
                {
                    path: `#asset-information/${selectedReceiptId}/${temp.id}`,
                    label: ROUTE_LABEL_MAP.get('#asset-information'),
                    id: '#asset-information-1'
                }])
        navigateTo(`#asset-information/${selectedReceiptId}/${temp.id}`)
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
          <th></th>
          <th>Date/Time</th>
          <th>Transaction lInk</th>
          <th>Author</th>
          <th>Amount change</th>
        </tr>
        </thead>
        <tbody>
        {#if receiptInformations.length}
          {#each filteredReceiptInformations as information}
            <tr>
              <td class="receipt-id">
                <label class="check-container">
                  <input type="checkbox" class="check-box" bind:group={selected}
                         value={information.id}
                         disabled={selected.length === 2 && !selected.includes(information.id)}/>
                  <span class="checkmark"></span>
                </label>
              </td>
              <td class="date underline cursor-pointer">
                <span
                  on:click={()=>{goToAssetInformation(information)}}>{timeStampToDate(information.timestamp, "yy-mm-dd/tt:tt")}
                </span>
              </td>
              <td class="underline cursor-pointer brown"
                  on:click={()=>{viewInExplorer(information.transaction.id)}}>{formatHash(information.transaction.id) ||
              ""}</td>

              <td>
               <span class="brown underline cursor-pointer"
                                    on:click={()=>{navigate(`#address-overview/${information.emitter.address}`)}}>
                {formatAddress(information.emitter.address) || ""}
               </span>
              </td>
              <td>{ethers.utils.formatUnits(information.receipt.deposits[0].amount, 18)}</td>
            </tr>
          {/each}
        {/if}
        </tbody>
        <Pagination dataLength={receiptInformations.length} {perPage} on:pageChange={handlePageChange}>
          <div slot="actions">
            <div class="certify-btn-container">
              <button class="default-btn ml-3" on:click={() => compareHistory()}>Compare History</button>
            </div>
          </div>
        </Pagination>
      </table>
    </div>
  {/if}
</div>

<style>

    .date {
        color: #9D7334
    }

    .left-margin {
        margin-left: 223px;
    }

    .receipt-id {
        justify-content: center;
        display: flex;
    }

    .check-container {
        top: 8px;
        left: 18px;
    }
</style>

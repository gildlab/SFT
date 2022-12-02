<script>
    import {createEventDispatcher, onMount} from "svelte";
    import {activeNetwork, vault} from "../scripts/store.js";
    import {
        getReceiptBalance,
        formatReceiptData,
        isUrl,
    } from "../scripts/helpers.js";
    import {icons} from "../scripts/assets.js";
    import {ethers} from "ethers";

    export let receipt = {}
    let receiptBalance = null
    let receiptInformations = {}
    let displayInformation = []

    let loading = false

    onMount(async () => {
        receiptBalance = await getReceiptBalance($activeNetwork, $vault, receipt.receipt.receiptId);
        loading = true
        if (receipt.receipt.receiptInformations.length) {
            displayInformation = await formatReceiptData(receipt.receipt.receiptInformations[0].information)
        }
        loading = false
    })


    const dispatch = createEventDispatcher();

    function backButtonClicked() {
        dispatch('back', {
            showReceiptInfo: false
        });
    }

</script>
<div class="receipt-info-container">
  <div class="header-buttons">
    <button class="default-btn back-to-receipts" on:click={()=>{backButtonClicked()}}> back</button>
  </div>
  <div class="basic-frame-parent">
    <div class="basic-frame receipt-info">
      <div class="receipt-row-header">
        <span class="f-weight-700">Receipt ID (NFT): {receipt.receipt.receiptId}</span>
        <div class="date"></div>
      </div>
      <div class="receipt-row">
        <span class="f-weight-700">Sft amount </span>
        <div class="date f-weight-700">{receiptBalance ? ethers.utils.formatUnits(receiptBalance) : ''}</div>
      </div>
      {#each displayInformation as info}
        <div class="receipt-row">
          {#if isUrl(info.value)}
            <span>{info.label}
              <a href={info.value} target="_blank">
                    <img src="{icons.show}" alt="view file" class="btn-hover">
              </a>
            </span>
          {/if}

          {#if !isUrl(info.value)} <span>{info.label}</span>
            <div>{info.value}</div>
          {/if}

        </div>
      {/each}

    </div>
  </div>
</div>

<style>
    .receipt-info-container {
        padding-top: 10px;
    }

    .header-buttons {
        display: flex;
        width: 100%;
        justify-content: right;
        padding: 0 12px 0 12px;
    }

    .back-to-receipts {

    }

    .receipt-info {
        min-height: 250px;
        padding: 10px 20px;
    }

    .receipt-row-header {
        display: flex;
        justify-content: space-between;
    }

    .receipt-row {
        padding: 2px 20px;
        display: flex;
        justify-content: space-between;
    }
</style>
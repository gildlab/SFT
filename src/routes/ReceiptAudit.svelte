<script>

    import DefaultFrame from "../components/DefaultFrame.svelte";
    import {navigateTo} from "yrv";
    import Spinner from "../components/Spinner.svelte";
    import {activeNetwork, selectedReceipt, vault} from "../scripts/store.js";
    import {ethers} from "ethers";
    import {formatReceiptData, getReceiptBalance, isUrl, timeStampToDate} from "../scripts/helpers.js";
    import {onMount} from "svelte";
    import {icons} from "../scripts/assets.js";

    let receipt = $selectedReceipt.receipt;
    let loading = false
    let checkedReceipts = []
    let receiptInformation = []
    let receiptBalance = ""
    let transactions = []

    function getHash(id) {
        return id.split('-')[1]
    }

    onMount(async () => {
        await setReceiptData(receipt.id)
        await mergeDepositsAndWithdraws()
        receiptBalance = await getReceiptBalance($activeNetwork, $vault, receipt.receiptId);
    })

    async function setReceiptData() {
        loading = true
        if (receipt.receiptInformations.length) {
            receiptInformation = await formatReceiptData(receipt.receiptInformations[0].information)
        }
        loading = false
    }

    async function mergeDepositsAndWithdraws() {
        let deposits = receipt.deposits;
        let withdraws = receipt.withdraws.map(w => {
            return {...w, withdraw: true}
        });

        transactions = [...deposits,...withdraws]

    }
</script>
<DefaultFrame header={`Audit History > ${receipt.receiptId}`}>
  <div slot="header-buttons" class="display-flex">
    <button class="header-btn btn-hover" on:click={()=>{navigateTo("#admin")}}>Admins</button>
  </div>
  <div slot="content">
    <div class="history">
      <div class="receipts">
        {#if (receiptInformation.length)}
          {#each receiptInformation as info}
            <div class="receipt-info">
              {#if isUrl(info.value)}
                  <span>{info.label}
                    <a href={info.value} target="_blank">
                          <img src="{icons.show}" alt="view file" class="btn-hover">
                    </a>
                  </span>
              {/if}

              {#if !isUrl(info.value)}
                <span>{info.label}</span>
                <div>{info.value}</div>
              {/if}
            </div>

          {/each}

        {/if}
        <div class="receipt-info">
          <span class="f-weight-700">Total token amount</span>
          <div class="date f-weight-700">{receiptBalance ? ethers.utils.formatUnits(receiptBalance) : ''}</div>
        </div>
      </div>
      <div class="receipts-table-container">
        {#if loading}
          <Spinner></Spinner>
        {/if}
        <div class="transactions">
          <span class="f-weight-700">Transaction History</span>
          <button class="default-btn">Compare Changes</button>
        </div>
        {#if !loading}
          <table class="receipts-table">
            <tr>
              <td class="f-weight-700"></td>
              <td class="f-weight-700">Options</td>
              <td class="f-weight-700">Date</td>
              <td class="f-weight-700">Transaction Hash</td>
            </tr>
            {#each transactions as transaction}
              <tr>
                <td>
                  <label class="check-container">
                    <input type="checkbox" class="check-box" bind:group={checkedReceipts}
                           value={transaction.id}/>
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td class="receipt-id">

                  <div class="check-box-label btn-hover">{ethers.utils.formatUnits(transaction.amount, 18)}</div>
                </td>
                <td class="value">{timeStampToDate(transaction.timestamp)} </td>
                <td class="value">
                  <a href="{`${$activeNetwork.blockExplorer}tx/${getHash(transaction.id)}`}" target="_blank">
                    {getHash(transaction.id).replace(/(.{6}).*(.{6})/, "$1…$2") || ""}
                  </a>
                </td>
              </tr>
            {/each}

          </table>
        {/if}
      </div>

      <div class="error">
      </div>
    </div>
  </div>
</DefaultFrame>

<style>

    .history {
        text-align: left;
        display: flex;
        flex-direction: column;
        width: 678px;
        min-height: 530px;
        position: relative;

    }

    table {
        width: 100%;
    }

    thead, tbody {
        text-align: center;
    }

    th, td {
        text-align: left;
    }

    td {
        padding-left: 10px;
    }

    .receipts {
        max-height: 300px;
        min-height: 100px;
        border-bottom: 1px solid #D2D2D2;
        overflow: auto;
        text-align: center;
        padding: 0 25% 20px 25%;
    }

    .receipts table th {
        width: 33%;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        background: transparent;
        bottom: 0;
        color: transparent;
        cursor: pointer;
        height: auto;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: auto;
    }

    td {
        text-align: center;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    a:hover {
        text-decoration: underline;
    }

    .receipt-info {
        padding: 2px 20px;
        display: flex;
        justify-content: space-between;
    }

    .transactions {
        margin-top: 25px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
    }

    .checkmark {
        top: -6px
    }
</style>
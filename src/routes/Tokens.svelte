<script>
    import {activeNetwork, auditHistory, ethersData, tokenName, tokens, vault} from "../scripts/store.js";
    import {getContract, getSubgraphData} from "../scripts/helpers.js";
    import contractAbi from "../contract/OffchainAssetVaultAbi.json";
    import {AUDIT_HISTORY_DATA_QUERY} from "../scripts/queries.js";
    import DefaultFrame from "../components/DefaultFrame.svelte";
    import SftLoader from "../components/SftLoader.svelte";
    import {navigate} from "svelte-routing";


    async function handleTokenSelect(token) {
        let contract = await getContract($activeNetwork, token.address, contractAbi, $ethersData.signerOrProvider)
        if (contract) {
            vault.set(contract)
            localStorage.setItem("vaultAddress", token.address)
            let auditHistoryData = await getAuditHistoryData(token.address)
            auditHistory.set(auditHistoryData)
            let temp = $tokens.find(t=>t.address === token.address)
            tokenName.set(temp?.name)
            navigate("/roles")
        }
    }

    async function getAuditHistoryData(token) {
        let data = await getSubgraphData($activeNetwork, {id: token.toLowerCase()}, AUDIT_HISTORY_DATA_QUERY, 'offchainAssetReceiptVault')
        if (data) {
            return data.data.offchainAssetReceiptVault
        } else return {}
    }


</script>
<DefaultFrame header="SFT Lists">
  <div slot="content">
    <div class="tokens">
      <table class="w-100">
        <tr class="f-weight-700">
          <th>Name</th>
          <th>Symbol</th>
          <th>URL</th>
        </tr>
        {#if ($tokens.length)}
          {#each $tokens as token }
            <tr class="token tb-row" on:click={()=>{handleTokenSelect(token)}}>
              <td>{token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.uri || ''}</td>
            </tr>
          {/each}
        {/if}

      </table>
      {#if !$tokens.length}
        <SftLoader width="50"></SftLoader>
      {/if}
    </div>
  </div>
</DefaultFrame>

<style>
    .tokens {
        overflow: auto;
        height: calc(100vh - 340px);
        text-align: left;
        width: 100%;
        min-width: 435px;
        justify-content: space-between;
        line-height: 27px;
    }

    table tr:first-child {
        background: #625e91;
        color: #ffffff;
    }

    table td, table th {
        padding: 5px 15px;
    }

    table th {
        top: 0;
        position: sticky;
        z-index: 20;
        background: #625e91;
    }

</style>
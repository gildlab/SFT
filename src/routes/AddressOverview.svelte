<script>
    import {activeNetwork, sftInfo} from '../scripts/store.js';
    import {router} from 'yrv';
    import {getSubgraphData, getSubgraphDataNoInterval, downloadIpfsHashes, getAccountPins} from '../scripts/helpers.js';
    import {
        ADDRESS_OVERVIEW_QUERY, REVISIONS_DATA_QUERY,
        VAULTS_BY_DEPLOYER_QUERY
    } from '../scripts/queries.js';
    import MintRedeemView from '../components/MintRedeemView.svelte';
    import CertificationsView from '../components/CertificationsView.svelte';
    import AccountSftsView from '../components/AccountSftsView.svelte';
    import Erc20ConfiscationsView from '../components/Erc20ConfiscationsView.svelte';
    import Erc1155ConfiscationsView from '../components/Erc1155ConfiscationsView.svelte';
    import {icons} from '../scripts/assets.js';

    let loading = false;
    let mint_redeems = []
    let certifications = []
    let shareConfiscations = []
    let receiptConfiscations = []
    let sfts = []

    let address = $router.params.address

    let active = localStorage.getItem('activeView') || 'mint'

    $:$activeNetwork && getData()

    async function getData() {
        loading = true
        await getAccountData()
        await getAccountSFTs()
        await getRevisionsData()
        loading = false

    }

    async function getAccountData() {
        let resp = await getSubgraphData($activeNetwork, {address}, ADDRESS_OVERVIEW_QUERY, 'offchainAssetReceiptVaults')
        if (resp && resp.data && resp.data.offchainAssetReceiptVaults) {
            //set Certifications
            //filter data if there is no certifications
            certifications = resp.data.offchainAssetReceiptVaults.filter(cert => cert.certifications.length)
            certifications = certifications.map(c => c.certifications)
            certifications = certifications.flat()

            //set ShareConfiscations
            //filter data if there is no ShareConfiscations
            shareConfiscations = resp.data.offchainAssetReceiptVaults.filter(sc => sc.shareConfiscations.length)
            shareConfiscations = shareConfiscations.map(c => c.shareConfiscations)
            shareConfiscations = shareConfiscations.flat()

            //set ReceiptConfiscations
            //filter data if there is no ReceiptConfiscations
            receiptConfiscations = resp.data.offchainAssetReceiptVaults.filter(rc => rc.receiptConfiscations.length)
            receiptConfiscations = receiptConfiscations.map(c => c.receiptConfiscations)
            receiptConfiscations = receiptConfiscations.flat()

        }
    }

    async function getAccountSFTs() {
        let resp = await getSubgraphData($activeNetwork, {address}, VAULTS_BY_DEPLOYER_QUERY, 'offchainAssetReceiptVaults')
        if (resp && resp.data && resp.data.offchainAssetReceiptVaults) {
            //set Sfts
            //filter data if there is no certifications
            sfts = resp.data.offchainAssetReceiptVaults
        }
    }

    function filterRevisions(deposits, withdraws, revisions) {
        //get array of all deposit receiptInformations for filtering
        deposits.length ?
            deposits = deposits.map(d => d.receipt.receiptInformations.length ?
                d.receipt.receiptInformations[0].id : null).flat() : []

        //get array of all withdraw receiptInformations for filtering
        withdraws.length ? withdraws = withdraws.map(w => w.receipt.receiptInformations.length ?
            w.receipt.receiptInformations[0].id : null).flat() : []

        //if deposits or withdraws include receiptinformation from all the receiptinformations, filter them
        return revisions.filter(r => !deposits.includes(r.id) && !withdraws.includes(r.id));
    }

    async function getRevisionsData() {
        let revisionsData = await getSubgraphDataNoInterval($activeNetwork, {address}, REVISIONS_DATA_QUERY)
        if (revisionsData && revisionsData.data) {
            let deposits = revisionsData.data.depositWithReceipts
            let withdraws = revisionsData.data.withdrawWithReceipts
            let receiptInformationsAll = revisionsData.data.receiptInformations
            //Need to filter receiptInformations to exclude duplicate receiptInformations of deposits and withdraws
            let receiptInformations = filterRevisions(deposits, withdraws, receiptInformationsAll)
            if (receiptInformations !== undefined && deposits !== undefined && withdraws !== undefined) {
                mint_redeems = [...receiptInformations, ...deposits, ...withdraws]
                mint_redeems = mint_redeems.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
            }
            //Construct revision
            mint_redeems = mint_redeems.map(mr => {
                return {
                    type: mr.id.split('-')[0] === 'DepositWithReceipt' ?
                        'Mint' :
                        mr.id.split('-')[0] === 'WithdrawWithReceipt' ? 'Redeem' : 'Revision',
                    vault: mr.offchainAssetReceiptVault.name,
                    amount: mr.amount || 0,
                    receiptId: mr.receipt.receiptId,
                    revisionId: mr.receipt.receiptInformations && mr.receipt.receiptInformations[0] ?
                        mr.receipt.receiptInformations[0].id :
                        mr.id,
                    date: mr.timestamp,
                    transaction: mr.transaction.id
                }
            })
        }

    }

    function setActive(page) {
        active = page
        localStorage.setItem('activeView', page)
    }


    async function downloadPins() {
        let pins = await getAccountPins($activeNetwork, address)
        downloadIpfsHashes(pins.map(p => p.hash))
    }

</script>

<div class="{$sftInfo ? 'w-full' : 'left-margin'} address-overview">
  <div class="address-overview-container">
    <div class="card-header justify-between">
      <div class=""><b>Address</b> {address}</div>
      <a href={`${$activeNetwork?.blockExplorer}/address/${address}`} target="_blank">
        <img class="link-icon" src={icons[$activeNetwork.blockExplorerIcon]} alt={$activeNetwork.blockExplorerIcon} width="24" height="24">
      </a>
    </div>


    <div class="address-overview-table-container">
      <div class="buttons">
        <div class="left">
          <button class="default-btn {active === 'mint'? 'active': ''}" on:click={()=>setActive('mint')}>Revisions
          </button>
          <button class="default-btn {active === 'certifications'? 'active': ''}"
                  on:click={()=>setActive('certifications')}>Certifications
          </button>
          <button class="default-btn {active === 'sfts'? 'active': ''}" on:click={()=>setActive('sfts')}>SFTs</button>
          <button class="default-btn {active === 'erc20'? 'active': ''}" on:click={()=>setActive('erc20')}>ERC20
            confiscations
          </button>
          <button class="default-btn {active === 'erc1155'? 'active': ''}" on:click={()=>setActive('erc1155')}>
            ECRC1155 confiscations
          </button>
        </div>
        <div class="right">
          <button class="default-btn" on:click={()=>{downloadPins()}}>Download pins</button>
        </div>
      </div>
      {#if (active === 'mint')}
        <MintRedeemView mintRedeemData={mint_redeems} {loading}/>
      {/if}
      {#if (active === 'certifications')}
        <CertificationsView certificationsData={certifications} {loading}/>
      {/if}
      {#if (active === 'sfts')}
        <AccountSftsView sftsData={sfts} {loading}/>
      {/if}
      {#if (active === 'erc20')}
        <Erc20ConfiscationsView confiscations={shareConfiscations} {loading}/>
      {/if}
      {#if (active === 'erc1155')}
        <Erc1155ConfiscationsView confiscations={receiptConfiscations} {loading}/>
      {/if}
    </div>
  </div>
</div>
<style>
    .left-margin {
        margin-left: 223px;
    }

    .address-overview {
        margin-right: 20px;
    }

    .address-overview-container {
        background: #FFFFFF;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        display: flex;
        flex-direction: column;
        text-align: left;
        width: 100%;
    }

    .card-header {
        padding: 0 20px;
    }

    .address-overview-table-container {
        box-sizing: border-box;
        border-radius: 10px;
        padding: 15px 20px 50px 20px;
        display: flex;
        flex-direction: column;
        gap: 35px;
    }

    .buttons {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
    }

    .left {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        white-space: nowrap;
    }

    .right {
        white-space: nowrap;
    }

    .default-btn.active {
        background: #CAE6FF;
    }
</style>

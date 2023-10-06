<script>
    import {
        data,
        vault,
        activeNetwork, tokenName, pageTitle
    } from "../scripts/store.js";
    import {
        bytesToMeta,
        cborDecode,
        getSubgraphData,
        toSentenceCase, toIsoDate
    } from '../scripts/helpers.js';
    import {ethers} from 'ethers';
    import {CERTIFICATION_QUERY} from '../scripts/queries.js';
    import axios from 'axios';
    import {IPFS_GETWAY, MAGIC_NUMBERS} from '../scripts/consts.js';
    import {icons} from '../scripts/assets.js';
    import {router} from 'yrv';
    import {onMount} from 'svelte';

    let schemaName = ''

    let structure;
    let displayInformation = [];
    let fileUploadProperties = [];

    let variables;
    let certification;

    onMount(async () => {
        pageTitle.set("Audit report")
    })

    $:$activeNetwork && getInformation()

    async function getInformation() {
        let certificationId = $router.params.id

        variables = {id: $vault.address, certifyId: certificationId}
        let resp = await getSubgraphData($activeNetwork, variables, CERTIFICATION_QUERY, 'offchainAssetReceiptVault')
        if (resp && resp.data && resp.data.offchainAssetReceiptVault) {
            certification = resp.data.offchainAssetReceiptVault.certifications[0]

            let information = certification.information;
            let decoded = cborDecode(information.slice(18))
            let schemaHash = decoded ? decoded[0].get(MAGIC_NUMBERS.OA_SCHEMA) : null
            structure = bytesToMeta(decoded[0].get(0), "json")
            displayInformation = Object.keys(structure).map(prop => {
                return {
                    label: toSentenceCase(prop),
                    value: structure[prop]
                }
            })
            if (schemaHash) {
                let res = await axios.get(`${IPFS_GETWAY}${schemaHash}`)
                if (res) {
                    schemaName = res.data.displayName
                    let props = Object.keys(res.data.schema.properties)
                    fileUploadProperties = props.filter(p => {
                        let value = res.data.schema.properties[p]
                        if (value.editor === "upload") {
                            return p
                        }
                    })
                    fileUploadProperties = fileUploadProperties.map(p => toSentenceCase(p))
                }
            }
        }
    }

</script>
<div class="asset-information">
  <div class="card-header justify-start">
    Audit report
  </div>

  <div class="card-content">
    <div class="display-flex justify-between font-bold mb-8 text-left">
      <span>{$tokenName}</span>
      <span>
       Audit date:
        {certification ? toIsoDate(certification.timestamp) : 0}
      </span>
    </div>
    <div class="flex items-start flex-col mb-8">
      <div class="flex justify-between font-bold text-left w-full">
        <span class="f-weight-700 whitespace-nowrap">Audit type </span>
        <span class="dots"></span>
        <span class="f-weight-700 text-right">{schemaName}</span>
      </div>
    </div>

    <div class="">
      {#each displayInformation as info}
        <div class="receipt-row flex justify-between w-full">

          {#if fileUploadProperties.includes(info.label)}
            <span class="underline btn-hover">
              <a href={`${IPFS_GETWAY}${info.value}`} target="_blank" class="display-flex">
                    {info.label} <img src="{icons.show}" alt="view file" class="ml-2">
              </a>
            </span>
          {/if}

          {#if !fileUploadProperties.includes(info.label)}
            <span class="whitespace-nowrap">{info.label}  </span>
            <span class="dots f-weight-700"></span>
            <span class="text-right w-1/5">{ethers.utils.isAddress(info.value) ? formatAddress(info.value) : info.value}</span>
          {/if}

        </div>
      {/each}
    </div>


    <div class="display-flex justify-between font-bold mt-20 text-left">
      <span>Total token amount:</span>
      <span>{$data.offchainAssetReceiptVault ?
          ethers.utils.formatUnits($data.offchainAssetReceiptVault.totalShares, 18) :
          0}</span>
    </div>
  </div>
</div>


<style>

    .asset-information {
        border-radius: 10px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .receipt-row {
        padding: 2px 0;
        display: flex;
    }

    .card-header{
        padding-left: 60px;
        color: #000;
        font-family: Mukta, sans-serif;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
    }
</style>
<script>
    import {
        selectedReceiptInformations,
        activeNetwork,
        sftInfo, pageTitle, schemas,
    } from "../scripts/store";
    import {
        bytesToMeta,
        cborDecode, getIpfsGetWay,
        getSubgraphData, timeStampToDate, toSentenceCase,
    } from "../scripts/helpers.js";
    import {RECEIPT_INFORMATION_QUERY} from "../scripts/queries.js";
    import SftLoader from "../components/SftLoader.svelte";
    import {IPFS_GETWAY, MAGIC_NUMBERS} from '../scripts/consts.js';
    import axios from 'axios';
    import {icons} from '../scripts/assets.js';

    let receiptInformation_before;
    let receiptInformation_after;
    let loading = false;

    let schema;

    let comparisonTableData = [];

    let fileProps = [];

    $:$activeNetwork && getInformations();

    async function getInformations() {
        //set pageTitle
        pageTitle.set("Change comparison")

        let information_before_id;
        let information_after_id;

        if (!selectedReceiptInformations.length) {
            information_before_id = localStorage.getItem("information_before")
            information_after_id = localStorage.getItem("information_after")
        } else {
            information_before_id = $selectedReceiptInformations[1]
            information_after_id = $selectedReceiptInformations[0]
        }
        loading = true;
        try {
            let resp1 = await getSubgraphData($activeNetwork, {id: information_before_id}, RECEIPT_INFORMATION_QUERY, 'receiptInformation')
            receiptInformation_before = resp1.data?.receiptInformation || {}
            let resp2 = await getSubgraphData($activeNetwork, {id: information_after_id}, RECEIPT_INFORMATION_QUERY, 'receiptInformation')
            receiptInformation_after = resp2.data?.receiptInformation || {}
            let decodedReceiptInformation_before = await decodeInformation(receiptInformation_before.information)
            let decodedReceiptInformation_after = await decodeInformation(receiptInformation_after.information)
            let fieldsArray = [...Object.keys(decodedReceiptInformation_before),
                ...Object.keys(decodedReceiptInformation_after)]
            //remove duplicate fields
            const uniqueSet = new Set(fieldsArray);
            fieldsArray = Array.from(uniqueSet);

            comparisonTableData = fieldsArray.map(field => {
                if (fileProps.indexOf(field) !== -1) {
                    return {
                        field: toSentenceCase(field),
                        information_1: decodedReceiptInformation_before[field] ?
                            `<div class="flex w-full items-center justify-center"><a href="${IPFS_GETWAY}${decodedReceiptInformation_before[field]}/" target="_blank" class="display-flex"><img class="action-icon ml-2" src="${icons.show}" alt="show"/></a></div>` :
                            "",
                        information_2: decodedReceiptInformation_after[field] ?
                            `<div class="flex w-full items-center justify-center"><a href="${IPFS_GETWAY}${decodedReceiptInformation_after[field]}/" target="_blank" class="display-flex"><img class="action-icon ml-2" src="${icons.show}" alt="show"/></a></div>` :
                            "",
                    }
                } else {
                    let deference = highlight(decodedReceiptInformation_after[field], decodedReceiptInformation_before[field])

                    return {
                        field: toSentenceCase(field),
                        information_1: deference[0],
                        information_2: deference[1],
                    }
                }

            })
        } catch (e) {
            console.log(e)
        }
        loading = false;

    }

    async function decodeInformation(information) {
        let cborDecodedInformation = cborDecode(information.slice(18))
        fileProps = await getFileProperties(cborDecodedInformation[0].get(MAGIC_NUMBERS.OA_SCHEMA))
        return bytesToMeta(cborDecodedInformation[0].get(0), "json")
    }

    async function getFileProperties(schemaHash) {
        if (!schema && schemaHash && !schemaHash.includes(',')) {
            let url = await getIpfsGetWay(schemaHash)
            try {
                if (url) {
                    let res = await axios.get(url)
                    if (res) {
                        schema = res.data.schema
                        //get schema properties that are file upload
                        Object.keys(schema.properties).forEach(k => {
                            if (schema.properties[k].editor === 'upload') {
                                fileProps = [...fileProps, k]
                            }
                        })
                    }
                }
            } catch (err) {
                // console.log(err)
            }
        }
        return fileProps
    }

    function highlight(newText, oldText) {
        let oldTextArray = oldText ? oldText.split(' ') : []
        let text = '';
        if (newText) {
            newText.split(' ').forEach(function (val, i) {
                if (val !== oldTextArray[i]) {
                    if (oldTextArray[i])
                        oldTextArray[i] = "<span class='error'>" + " " + oldTextArray[i] + "</span>"
                    text += "<span class='success'>" + " " + val + "</span>";
                } else
                    text += " " + val;
            });
        }
        return [oldTextArray.join(' '), text];
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
          <th>Field</th>
          <th>Before {receiptInformation_before ?
              timeStampToDate(receiptInformation_before.timestamp, 'yy-mm-dd/tt:tt') :
              "" }</th>
          <th>After {receiptInformation_after ?
              timeStampToDate(receiptInformation_after.timestamp, 'yy-mm-dd/tt:tt') :
              ""}</th>
        </tr>
        </thead>
        <tbody>
        {#if comparisonTableData.length}
          {#each comparisonTableData as comparable}
            <tr>
              <td class="w-1/5">{comparable.field}</td>
              <td class="w-2/5">{@html comparable.information_1}</td>
              <td class="w-2/5">{@html comparable.information_2}</td>
            </tr>
          {/each}
        {/if}
        </tbody>
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

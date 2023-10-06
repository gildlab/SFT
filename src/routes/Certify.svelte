<script>
    import {
        account,
        activeNetwork, currentCertification,
        ethersData,
        pageTitle,
        schemas,
        titleIcon,
        tokenName, transactionError, transactionInProgress, transactionInProgressShow, transactionSuccess,
        vault
    } from '../scripts/store.js';
    import {icons} from '../scripts/assets.js';
    import {onMount} from 'svelte';
    import Select from '../components/Select.svelte';
    import Schema from '../components/Schema.svelte';
    import {
        cborEncode,
        encodeCBORStructure,
        formatDate, getFormData,
        getSubgraphData,
        hasRole,
        navigate, setFormInputs, showPrompt,
        showPromptSFTCreate
    } from '../scripts/helpers.js';
    import {AUDIT_HISTORY_DATA_QUERY} from '../scripts/queries.js';
    import Calendar from '../components/Calendar.svelte';
    import {IPFS_APIS, MAGIC_NUMBERS} from '../scripts/consts.js';
    import axios from 'axios';
    import {arrayify} from 'ethers/lib/utils.js';
    import {mock} from "../test/mock.js"

    let certifyUntil = formatDate(new Date())
    let fileHashes = [];
    let selectedDate = new Date();
    let structure;

    let username = ''
    let password = ''
    let force = false
    let certifiedUntil = new Date()

    let error = ''


    onMount(async () => {
        pageTitle.set(`Certify`)
        titleIcon.set(`${icons.certify}`)
        if (!!window.Cypress) {
            schemas.set(mock.schemas)
        }
    })

    let selectedSchema = {}

    async function handleSchemaSelect(event) {
        selectedSchema = event.detail.selected
        const form = document.querySelector('.svelte-schema-form'); // select the form element
        if (form) {
            form.reset();
        }
    }

    function handleFileUpload(event) {
        fileHashes = event.detail.fileHashes
    }

    async function certify() {

        certifyUntil = formatDate(selectedDate)

        //Set date to the nearest Midnight in the future
        let untilToTime = new Date(certifyUntil).setHours(23, 59, 59, 0)
        untilToTime = new Date(untilToTime).getTime()

        const hasRoleCertifier = await hasRole($vault, $account, "CERTIFIER")
        const _referenceBlockNumber = await $ethersData.provider.getBlockNumber();
        if (!hasRoleCertifier.error) {
            try {

                structure = await getFormData(fileHashes)

                if (structure) {

                    let fileHashesList = fileHashes.map(f => f.hash)
                    let encodedStructure = encodeCBORStructure(structure, selectedSchema.hash)

                    let structureIpfs = await upload()
                    let encodedHashList = cborEncode([...fileHashesList,
                        structureIpfs?.Hash].toString(), MAGIC_NUMBERS.OA_HASH_LIST)
                    const meta = "0x" + MAGIC_NUMBERS.RAIN_META_DOCUMENT.toString(16).toLowerCase() +
                        encodedStructure + encodedHashList

                    let certifyTx = await $vault.certify(untilToTime /
                        1000, _referenceBlockNumber, force, arrayify(meta))
                    await showPromptSFTCreate(certifyTx)

                    let wait = await certifyTx.wait()
                    if (wait.status === 1) {
                        let interval = setInterval(async () => {
                            let preData = await getSubgraphData($activeNetwork, {id: $vault.address.toLowerCase()}, AUDIT_HISTORY_DATA_QUERY, 'offchainAssetReceiptVault')
                            preData = preData?.data?.offchainAssetReceiptVault.certifications
                            if (preData && preData.length) {
                                if (wait.blockNumber.toString() === preData[0].transaction.blockNumber) {
                                    currentCertification.set(preData[0])
                                    transactionSuccess.set(true)
                                    transactionInProgress.set(false)
                                    clearInterval(interval)
                                    setFormInputs()
                                    navigate(`#audit-report/${preData[0]?.id}`)
                                }
                            }
                        }, 2000)
                    } else {
                        transactionError.set(true)
                    }

                }

            } catch (e) {
                console.log(e)
            }


        } else {
            error = hasRoleCertifier.error
        }
    }

    function handleDateChange(event) {
        selectedDate = event.detail;
    }

    const upload = async () => {
        error = ""
        let savedUsername = localStorage.getItem('ipfsUsername');
        let savedPassword = localStorage.getItem('ipfsPassword');
        if (!savedPassword || !savedUsername) {
            navigate("#ipfs")
        } else {
            username = savedUsername;
            password = savedPassword

            let formData = new FormData();

            formData.append('file', structure)

            const requestArr = IPFS_APIS.map((url) => {
                return axios.request({
                    url,
                    auth: {
                        username,
                        password
                    },
                    method: 'post',
                    headers: {
                        "Content-Type": `multipart/form-data;`,
                    },
                    data: formData,
                    onUploadProgress: (async (p) => {
                        await showPrompt(null, {topText: "Uploading to IPFS, please wait", noBottomText: true})
                        console.log(`Uploading...  ${p.loaded} / ${p.total}`);
                    }),
                    withCredentials: true,
                })
            });

            let respAll = await Promise.allSettled(requestArr)

            respAll.map(response => {
                if (response.status === "rejected") {
                    reportError(response.reason)
                } else return response
            })

            let resolvedPromise = respAll.find(r => r.status === "fulfilled")
            if (!resolvedPromise) {
                error = "Something went wrong"
            }
            username = ""
            password = ""
            transactionInProgressShow.set(false)
            transactionInProgress.set(false)

            return resolvedPromise?.value.data
        }
    };

</script>

<div class="certify-container ">
  <div class="card-header justify-between pl-6 pr-10">
    <div class="flex gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.34875 11.499L11.3488 13.499L15.5 9.3478M11.7253 3.07754L5.72528 4.79182C5.29598 4.91448 5 5.30687 5 5.75335L5 10.8529C5 14.0824 6.55966 17.1131 9.18762 18.9902L11.4188 20.5839C11.7665 20.8322 12.2335 20.8322 12.5812 20.5839L14.8124 18.9902C17.4403 17.1131 19 14.0824 19 10.8529V5.75335C19 5.30687 18.704 4.91448 18.2747 4.79182L12.2747 3.07754C12.0952 3.02624 11.9048 3.02624 11.7253 3.07754Z"
          stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Certify
    </div>
    <button class="default-btn" on:click={()=>{navigate('#new-asset-class')}}>New schema</button>
  </div>
  <div class="flex items-center pt-10 pb-10 gap-5 ">Choose a schema for the audit report

    {#if $schemas.length}
      <div class="schema">
        <div class="schema-dropdown flex justify-between">
          <Select options={$schemas}
                  on:select={handleSchemaSelect}
                  width="170"
                  label={'Choose'} className={"inputSelect"} expandIcon={icons.expand_black}></Select>

        </div>
      </div>
    {/if}
  </div>

  <div class="schema-container card-content">
    <div class="flex w-full justify-center f-weight-700 mb-3">{$tokenName}</div>
    {#if selectedSchema.displayName}
      <div class="flex justify-between w-full mb-6 items-end">
        <span class="f-weight-700">Audit type</span>
        <div class="asset-class"> {selectedSchema.displayName}</div>
      </div>
    {/if}

    <Schema schema={selectedSchema} on:fileUpload={handleFileUpload} title="Audit Info."></Schema>
  </div>
  <div class="force flex w-100 px-5 py-2 gap-5">
    <label class="check-container">
      <input type="checkbox" class="check-box" bind:checked={force}/>
      <span class="checkmark"></span>
    </label>
    <div class="ml-3 mt-1">Force the date to override the expiry</div>

  </div>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <div class="card-footer justify-between pl-6 pr-10">
    <Calendar value={selectedDate} on:change={handleDateChange}/>
    <button class="default-btn pl-14 pr-14" on:click={()=>{certify()}}>Certify</button>
  </div>

</div>
<style>
    .certify-container {
        border-radius: 10px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .card-footer {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        border-top-width: 1px;;
        padding: 13px 40px;
        gap: 20px;
    }

    .schema-container {
        border-radius: 10px;
        border: 1px solid var(--divider, #D2D2D2);
        padding: 15px 42px;
        margin: 0 20px;
        width: 630px;
        min-height: 300px;
        text-align: left;
    }

    .error {
        height: 40px;
        display: flex;
        align-items: center;
    }

    .asset-class {
        border: 2px solid #ECECEC;
        border-radius: 5px;
        color: #000000;
        background: #ECECEC;
        width: 360px;
        height: 27px;
        margin-top: 8px;
        padding: 0 5px;
        text-align: left;
    }

    .check-container {
        left: 10px;
    }

    .checkmark {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 50%;
    }

    .checkmark:after {
        left: 3px;
        top: -3px;
    }
</style>
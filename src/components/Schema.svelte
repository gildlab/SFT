<script>
    import {fileDropped, schemaError, uploadBtnLoading} from '../scripts/store.js';
    import SftLoader from './SftLoader.svelte';
    import SchemaForm from './SchemaForm.svelte';
    import {createEventDispatcher} from 'svelte';
    import {IPFS_APIS} from '../scripts/consts.js';
    import axios from 'axios';
    import {navigate} from '../scripts/helpers.js';

    export let schema = {}
    export let title = 'Asset info.'
    const dispatch = createEventDispatcher();
    let username = '';
    let password = '';

    let fileHashes = []

    let error;

    $: ($fileDropped.file && $fileDropped.file.size) && handleFileDrop($fileDropped);
    $: schema && clearFileHashes();

    function clearFileHashes() {
        fileHashes = []
    }

    const upload = async (data) => {
        error = ""
        uploadBtnLoading.set(true)

        let savedUsername = localStorage.getItem('ipfsUsername');
        let savedPassword = localStorage.getItem('ipfsPassword');
        if (!savedPassword || !savedUsername) {
            navigate("#ipfs")
        } else {
            username = savedUsername;
            password = savedPassword


            let formData = new FormData();

            formData.append('file', data.file)

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
                    onUploadProgress: ((p) => {
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
            if (resolvedPromise) {

                localStorage.setItem('ipfsUsername', username);
                localStorage.setItem('ipfsPassword', password);
                if (data.file.size) {
                    fileHashes = [...fileHashes, {prop: data.prop, hash: resolvedPromise.value.data.Hash}]//.set(resolvedPromise.value.data.Hash)
                }
            } else {
                error = "Something went wrong"
            }
            uploadBtnLoading.set(false)
            username = ""
            password = ""
            return resolvedPromise?.value.data
        }
    };

    async function handleFileDrop(file) {
        await upload(file)
        dispatch('fileUpload', {
            fileHashes,
        });
    }

</script>
{#if schema?.displayName}
  <span class="title f-weight-700">{title}</span>

  <SchemaForm schema={schema.schema}></SchemaForm>
  <div class="error">{$schemaError}</div>
  {#if $uploadBtnLoading}
    <div class="sf-upload-spinner">
      <SftLoader width="50"></SftLoader>
    </div>
  {/if}
{/if}


<script>
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import {pageTitle, titleIcon, tokenName} from '../scripts/store.js';
    import {icons} from '../scripts/assets.js';
    import {IPFS_APIS} from '../scripts/consts.js';
    import axios from 'axios';
    import {router} from 'yrv';

    let username = localStorage.getItem('ipfsUsername') || "";
    let password = localStorage.getItem('ipfsPassword') || "";
    let loggedIn = username && password
    let message = ""
    let error = ""
    let passwordInput;
    let type = ""
    let show = true;
    let success = true;
    export let loggedInUser = localStorage.getItem('ipfsUsername')
    $:type && (show = !show)

    const dispatch = createEventDispatcher();

    onMount(async () => {
        pageTitle.set("IPFS login")

        titleIcon.set(`${icons.ipfs_white}`)
    })


    function toggleShowPassword() {
        type = passwordInput.getAttribute("type")
        if (type === "password") {
            passwordInput.setAttribute("type", "text")
        } else {
            passwordInput.setAttribute("type", "password")
        }
    }

    async function updateCredentials() {
        message = "";
        error = "";
        let formData = new FormData();
        formData.append('file', 'credentials')

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
            dispatch('success');
        } else {
            error = "Double check your login details. If the problem persists, contact us."
            localStorage.removeItem('ipfsUsername');
            localStorage.removeItem('ipfsPassword');
        }

    }

</script>
<div class="ipfs-container {$router.path === '#ipfs' ? '' : 'border'}">
  <div class="card-header justify-start pl-6 {$router.path === '#ipfs' ? '' : 'no-border-b'}">
    <div class="title flex gap-3"><img src="{icons.ipfs}" alt="ipfs"/>IPFS login</div>

  </div>
  <div class="credentials">
    {#if loggedIn}
      <div class="logged-in-text">{`You are currently logged in as: ${loggedInUser}`}</div>
    {/if}
    <div class="flex flex-col gap-2 w-full">
      <div class="w-full space-between items-center">
        <label class="mr-2">Username:</label>
        <input class="default-input ipfs-username" type="text" bind:value={username} autofocus/>
      </div>
      <div class="w-full space-between password items-center">
        <label class="mr-3">Password:</label>
        <input class="default-input ipfs-password" type="password" bind:value={password} bind:this={passwordInput}/>
        {#if password}
          <div class="view" on:click={()=>{toggleShowPassword()}}>{show ? 'show' : 'hide'}</div>
        {/if}
      </div>
    </div>


  </div>
  <div class="card-footer justify-start pt-4 {$router.path === '#ipfs' ? '' : 'no-border-t'}">
    <div class="message">{message}</div>
    <div class="error text-left mr-3">{error}</div>
    <button class="default-btn ok-button" disabled={!password || !username} on:click={updateCredentials}>OK
    </button>
  </div>
</div>


<style>
    .ipfs-container {
        border-radius: 10px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 650px
    }

    .credentials {
        display: flex;
        flex-direction: column;
        padding: 20px 60px 35px 60px;
        font-weight: 500;
        font-size: 16px;
        line-height: 27px;
        background: #ffffff;
        align-items: flex-start;
        width: 100%;
    }

    .password {
        position: relative;
    }

    .view {
        position: absolute;
        right: 15px;
        font-weight: 400;
        font-size: 14px;
        cursor: pointer;
    }

    .message {
        color: #26BE00;
        text-align: left;
        height: 25px;
        font-weight: 500;
    }

    .logged-in-text {
        height: 25px;
        color: #9D9D9D;
        text-align: left;
        margin-bottom: 25px;
        font-family: 'Mukta', sans-serif;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: normal;
    }

    .ok-button {
        font-weight: 400;
        padding: 0 40px;
    }

    .card-footer {
        align-items: center;
        display: flex;
        border-top: 1px solid #D2D2D2;
        padding: 16px 60px;
        width: 100%;
        justify-content: space-between;
    }

    .default-input {
        height: 36px;
        margin-bottom: 0;
        width: 100%;
    }

    .border {
        border: 1px solid #D2D2D2;
        margin-left: 1.5rem;
        margin-right: 1.5rem;
    }

    .no-border-b {
        border-bottom: none;
    }

    .no-border-t {
        border-top: none;
    }
</style>
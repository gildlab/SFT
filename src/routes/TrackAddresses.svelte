<script>
    import {sftInfo} from "../scripts/store";
    import {timeStampToDate} from "../scripts/helpers.js";
    import SftLoader from '../components/SftLoader.svelte';
    import {icons} from '../scripts/assets.js';
    import { encodeAddresses, initWasm } from "../wasm_utils.js";
    import {arrayify} from 'ethers/lib/utils.js';

    let convertedAddress = "";

    async function convert(addresses) {
        await initWasm();
        convertedAddress = await encodeAddresses(addresses);
        console.log(convertedAddress)
    }

    let error = ''
    let addresses = [
        {address: "0x8058ad7c22fdc8788fe4cb1dac15d6e976127324", timestamp: "1710922144"},
        {address: "0xc0D477556c25C9d67E1f57245C7453DA776B51cf", timestamp: "1710922144"},
        {address: "0x6E37d34e35a5fF2f896eD9e76EC43e728adA1d18", timestamp: "1710922144"},
        {address: "0x2cb21fb0a2cebb57434b1a2b89c81e5f49cd484a", timestamp: "1710922144"},
        {address: "0xaa1decefc2b32ca6390c9773e4ecffe69a644ff7", timestamp: "1710922144"},
        {address: "0x627a12ce1f6d42c9305e03e83fe044e8c3c1a32c", timestamp: "1710922144"},
        {address: "0xbe14c8f33239db9699422b37f09aa86d93bb8ff6", timestamp: "1710922144"},
        {address: "0xbaa3e3dd6eeebf87af39fc35eeccdf12537db515", timestamp: "1710922144"},
    ]
    let loading = false;
    let address = '';

    async function addAddress() {
        console.log(111, arrayify("0xff0a89c674ee7874"))
        await convert(["0xff0a89c674ee7874",...addresses.map(a=>a.address)])
        console.log(222, convertedAddress)
        console.log([...arrayify("0xff0a89c674ee7874"),...convertedAddress])

    }

    function copyAddress(address) {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(address.toLowerCase());
        }
        return Promise.reject("The Clipboard API is not available.");
    }

    function removeAddress(address) {
        console.log(address)
    }
</script>

<div class="{$sftInfo ? 'w-full' : 'left-margin'} mr-5">
  {#if loading}
    <SftLoader/>
  {/if}
  {#if !loading }
    <div class="bg-white rounded-xl gap-4 flex flex-col p-8">
      <div class="flex flex-col items-start gap-2 w-full font-normal">
        <span>Add an address to track IPFS pins from</span>
        <div class="flex gap-5 w-full">
          <input class="default-input w-1/2" bind:value={address}/>
          <button class="default-btn" on:click={()=>{addAddress()}}> Add address</button>
        </div>
      </div>
      <span class="self-start">Current Addresses to track IPFS pins from</span>
      <table class="sft-table shadow-none">
        <thead>
        <tr>
          <th></th>
          <th>Current addresses</th>
          <th class="rounded-tr-[10px]">Date added</th>
          <th class="!bg-white"></th>
        </tr>
        </thead>
        <tbody>
        {#if addresses.length}

          {#each addresses as ad}
            <tr class="tb-row">
              <td class="cursor-pointer hover:opacity-50" on:click={()=>{copyAddress(ad.address)}}>
                <img class="ml-5" src="{icons.copy_brown}" alt="copy">
              </td>
              <td class="address flex">{ad.address.toLowerCase()}</td>
              <td>{timeStampToDate(ad?.timestamp, "yy-mm-dd/tt:tt")}</td>
              <td class="bg-white border-0" on:click={()=>{removeAddress(ad.address)}}>
                <img class="ml-2 cursor-pointer hover:opacity-50" src="{icons.bin}" alt="copy">
              </td>

            </tr>
          {/each}
        {/if}

        </tbody>


      </table>
    </div>
  {/if}
</div>

<style>
    .left-margin {
        margin-left: 223px;
    }

    .address {
        color: #9D7334;
    }


</style>
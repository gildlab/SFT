<script>
    import { activeNetwork, ethersData, sftInfo} from "../scripts/store";
    import {
        cborDecode,
        getContract,
    } from "../scripts/helpers.js";
    import SftLoader from '../components/SftLoader.svelte';
    import {icons} from '../scripts/assets.js';
    import {encodeAddresses, hexToBytes, initWasm} from "../wasm_utils.js";
    import {
        MAGIC_NUMBERS,
        RAIN_METADATA_CONTRACT_ADDRESS_SEPOLIA
    } from '../scripts/consts.js';
    import {arrayify} from 'ethers/lib/utils.js';
    import metadataContractAbi from "../contract/rainMetadata/rainMetadataAbi.json"
    import {onMount} from 'svelte';
    import networks from '../scripts/networksConfig.js';

    let {signer} = $ethersData;


    let metadataContract = "";
    let addresses = [];

    onMount(async () => {
        metadataContract = await getContract($activeNetwork, RAIN_METADATA_CONTRACT_ADDRESS_SEPOLIA.trim(), metadataContractAbi, $ethersData.signerOrProvider)
        await getAddresses();
    })

    async function cborEncodeAddress(addresses) {
        await initWasm();
        return await encodeAddresses(addresses);
    }

    async function getAddresses() {
        const managerAddress = import.meta.env.VITE_MANAGER_ADDRESS;
        const addresses_subgraph_url = import.meta.env.VITE_ADDRESSES_SUBGRAPH_URL;

        let query = `
          query($sender: String!) {
            metaV1S(where: { sender: $sender }) {
              meta
              sender
            }
          }
         `;

        let data = {};
        let variables = {sender: managerAddress.toLowerCase()}
        try {
            let req = await fetch(addresses_subgraph_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            })

            data = await req.json()

            if (data) {
                let tempData = data.data;

                if (tempData.metaV1S?.length > 0) {
                    let tempAddresses = tempData.metaV1S.map(item => {
                            let decoded = cborDecode(item.meta.slice(18));
                            let myArray = decoded[0].get(0);
                            //Remove added first byte
                            let newArray = myArray.subarray(1);
                            // Convert Uint8Array to hex string
                            let hexString = Array.from(newArray)
                                .map(byte => byte.toString(16).padStart(2, '0'))
                                .join('');

                            let ethAddress = '0x' + hexString;
                            return {address:ethAddress, sender: item.sender};
                        }
                    );

                    addresses = tempAddresses.filter((item, index, self) =>
                        index === self.findIndex((t) => t.address === item.address)
                    );
                }
            }
        } catch (e) {
            console.log(e.message)
        }
    }

    let error = ''
    let loading = false;
    let address = '';

    async function addAddress() {
        let byteAddress = await hexToBytes(address)

        // Create a new Uint8Array with a length of 21 bytes
        let newArray = new Uint8Array(21);

        // Set the first byte of the new array to 1
        newArray[0] = 1;

        // Copy the contents of the original array to the new array starting from index 1
        newArray.set(byteAddress, 1);

        //Cbor Encode the address
        let cborEncoded = await cborEncodeAddress(newArray)

        let rainMagic = arrayify(MAGIC_NUMBERS.RAIN_META_DOCUMENT_HEX_STRING)

        let constructedMeta = new Uint8Array(rainMagic.length + cborEncoded.length);

        constructedMeta.set(rainMagic, 0);
        constructedMeta.set(cborEncoded, rainMagic.length);

        const textDecoder = new TextDecoder();
        const str = textDecoder.decode(constructedMeta);

        const tx = await metadataContract.connect(signer)["emitMeta(uint256,bytes)"](1, constructedMeta);
        //
        // let hexString = Array.prototype.map.call(constructedMeta, x => ('00' + x.toString(16)).slice(-2)).join('');
        //
        // console.log(hexString); // Output: "68656c6c6f"
    }

    function copyAddress(address) {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(address.toLowerCase());
        }
        return Promise.reject("The Clipboard API is not available.");
    }

    async function removeAddress(address) {
        console.log(address)
        let byteAddress = await hexToBytes(address)
        // Create a new Uint8Array with a length of 21 bytes
        let newArray = new Uint8Array(21);

        // Set the first byte of the new array to 0
        newArray[0] = 0;

        // Copy the contents of the original array to the new array starting from index 1
        newArray.set(byteAddress, 1);

        //Cbor Encode the address
        let cborEncoded = await cborEncodeAddress(newArray)

        let rainMagic = arrayify(MAGIC_NUMBERS.RAIN_META_DOCUMENT_HEX_STRING)

        let constructedMeta = new Uint8Array(rainMagic.length + cborEncoded.length);

        constructedMeta.set(rainMagic, 0);
        constructedMeta.set(cborEncoded, rainMagic.length);
        const tx = await metadataContract.connect(signer)["emitMeta(uint256,bytes)"](1, constructedMeta);

        console.log("concatenatedBytes", constructedMeta)
        let hexString = Array.prototype.map.call(constructedMeta, x => ('00' + x.toString(16)).slice(-2)).join('');
        console.log(hexString);

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
          <th class="rounded-tr-[10px]">Sender</th>
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
              <td>{ad?.sender}</td>
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
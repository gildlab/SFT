<script>
    import {sftInfo} from "../scripts/store";
    import {timeStampToDate} from "../scripts/helpers.js";
    import SftLoader from '../components/SftLoader.svelte';
    import {icons} from '../scripts/assets.js';

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

</script>

<div class="{$sftInfo ? 'w-full' : 'left-margin'} receipts">
  {#if loading}
    <SftLoader/>
  {/if}
  {#if !loading }
    <div class="sft-table-container p-8">
      <table class="sft-table">
        <thead>
        <tr>
          <th></th>
          <th>Current addresses</th>
          <th>Date added</th>
        </tr>
        </thead>
        <tbody>
        {#if addresses.length}

          {#each addresses as ad}
            <tr class="tb-row">
              <td><img class="ml-5" src="{icons.copy_brown}" alt="copy"></td>
              <td class="address flex">{ad.address.toLowerCase()}</td>
              <td>{timeStampToDate(ad?.timestamp, "yy-mm-dd/tt:tt")}</td>

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

    .receipts {
        /*width: 100%;*/
        margin-right: 20px;
        /*margin-top: 117px;*/
    }

    .address {
        color: #9D7334;
    }


</style>
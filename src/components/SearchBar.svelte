<script>
    import {icons} from '../scripts/assets.js';
    import {createEventDispatcher} from 'svelte';
    let searchText = "";
    const dispatch = createEventDispatcher();

    function search(){
        dispatch('search', searchText);
    }

</script>
<div class="search-bar">
  <div class="search-input-cont">
    <input class="search-input" bind:value={searchText} placeholder="Search by Address/ Token name" on:input={()=>search()}/>
    <img src={icons.search_icon} alt="search" class="search-icon">
  </div>

</div>

<style>
    .search-bar {
        width: 100%;
        text-align: right;
        display: flex;
        justify-content: flex-end;
    }

    .search-input-cont {
        position: relative;
        width: calc(50% - 10px);
    }

    .search-icon {
        position: absolute;
        left: 12px;
        top: 6px;
    }

    .search-input {
        border-radius: 10px;
        border: none;
        color: #000000;
        width: 100%;
        padding: 6px 46px;
    }

    .search-input, .search-input::placeholder {
        font-family: 'Mukta', sans-serif;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        height: 35px;
    }

</style>
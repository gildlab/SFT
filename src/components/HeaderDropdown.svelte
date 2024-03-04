<script>
    import {icons} from '../scripts/assets.js';
    import {createEventDispatcher} from 'svelte';

    export let triggerIcon;
    export let triggerLabel;
    export let items;
    export let id;

    let dropdown;
    let dropdownHidden = true;

    const dispatch = createEventDispatcher();

    function handleNavItemClick(option) {
        dropdownHidden = true
        dispatch('select', {
            selected: option
        });
    }

    function toggleDropdown() {
        dropdownHidden = !dropdownHidden
    }

    function handleClickOutside() {
        dropdownHidden = true
    }

    function clickOutside(node) {

        const handleClick = event => {
            if (node && !node.contains(event.target) && !event.defaultPrevented) {
                node.dispatchEvent(
                    new CustomEvent('click_outside', node)
                )
            }
        }

        document.addEventListener('click', handleClick, true);

        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        }
    }

</script>
<div class="dropdown-container" on:click_outside={handleClickOutside} use:clickOutside>
  <button id="{id}" data-dropdown-toggle="networks" on:click={()=>toggleDropdown()}
          class="focus:outline-none items-center text-white display-flex mr-10 relative" type="button">
    {#if triggerIcon}
      <img src={triggerIcon}
           alt={triggerLabel} width="28" height="28"/>
    {/if}
    <span class="network-name">{triggerLabel}</span>
    <img src={ icons.expand} alt="expand"/>
  </button>
  <!-- Dropdown menu -->
  <div id="networks" class="absolute top-10 drop-menu" class:hidden={dropdownHidden} bind:this={dropdown}>
    <ul class="dropdown-items" aria-labelledby="dropdownDefaultButton">
      {#each items as item}
        <li on:click={()=>handleNavItemClick(item)} class="list-item cursor-pointer display-flex" id="{item.name}">
          {#if item.icon}
            <img src={icons[item.icon]} alt={item?.displayName} width="28" height="28"/>
          {/if}
          <span class={`${item.class} network-name`}>{item?.displayName} </span>
          {#if item.rightIcon}
            <img src={icons[item.rightIcon]} alt={item?.displayName}/>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
    .network-name {
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        line-height: 39px;
        margin-left: 20px;
        margin-right: 20px;
    }

    .dropdown-items .network-name {
        margin-left: 8px;
        margin-right: 8px;
    }

    .list-item {
        color: #FFFFFF;
        padding: 0 15px 0 13px !important;
        display: flex;
        align-items: center;
    }

    .list-item:hover {
        background-color: #9F9F9F;
    }

    .drop-menu {
        z-index: 3;
    }

</style>

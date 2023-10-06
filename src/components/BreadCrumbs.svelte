<script>
    import {breadCrumbs} from '../scripts/store.js';
    import {navigateTo} from 'yrv';

    function isLast(elem) {
        let lastElement = $breadCrumbs[$breadCrumbs.length - 1];
        return elem.id === lastElement.id
    }

    function cleanOutBreadCrumbs(path) {
        let pathIndex = $breadCrumbs.findIndex(b => b.path === path)
        let bc = $breadCrumbs.slice(0, pathIndex + 1)
        breadCrumbs.set(bc)
        navigateTo(path)
    }

</script>
<div class="breadcrumbs-container">
  <div class="breadcrumbs flex items-center fixed w-100">
    {#each $breadCrumbs as breadCrumb}
      <span class="cursor-pointer" on:click={()=>{cleanOutBreadCrumbs(breadCrumb.path)}}>{breadCrumb.label}</span>
      {#if !isLast(breadCrumb)}
        <div class="mx-6">
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M0.292787 10.2064C0.105316 10.0189 0 9.7646 0 9.49943C0 9.23427 0.105316 8.97996 0.292787 8.79243L3.58579 5.49943L0.292787 2.20643C0.110629 2.01783 0.00983372 1.76523 0.0121121 1.50303C0.0143906 1.24083 0.11956 0.99002 0.304968 0.804612C0.490376 0.619204 0.741189 0.514035 1.00339 0.511757C1.26558 0.509478 1.51818 0.610273 1.70679 0.792431L5.70679 4.79243C5.89426 4.97996 5.99957 5.23427 5.99957 5.49943C5.99957 5.7646 5.89426 6.0189 5.70679 6.20643L1.70679 10.2064C1.51926 10.3939 1.26495 10.4992 0.999786 10.4992C0.734622 10.4992 0.480314 10.3939 0.292787 10.2064Z"
                  fill="#9CA3AF"/>
          </svg>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>

    .breadcrumbs-container {
        width: 100%;
        height: 47px;
        margin-top: 3.5rem;
    }

    .breadcrumbs {
        z-index: 1;
        top: 3.5rem;
        margin-left: 203px;
        color: #9D7334;
        background: #DCDBDD;
        font-weight: 400;
        padding: 0.7rem 0 0.7rem 1.5rem
    }
</style>
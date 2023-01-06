<div class="route-schema">
  <div class="page-header-label">
    <slot name="header">
    </slot>
  </div>
  <slot name="content">
  </slot>
</div>

<style>
    .page-header-label {
        font-weight: 700;
        font-size: 16px;
        line-height: 27px;
        color: #575757;
        height: 77px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .route-schema {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 18px;
    }
</style>
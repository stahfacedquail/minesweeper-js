<script lang="ts">
    import { createEventDispatcher } from "svelte";

  export let value: string | number;
  export let open = false;
  
  const dispatch = createEventDispatcher();

  function onClick() {
    if (open) return;

    dispatch("clicked");
  }
</script>

<button
  style:color={ open ? "initial" : "transparent" }
  style:background-color={ open ? "yellow" : "initial" }
  on:click={onClick}
>{ value }</button>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
  }
</style>
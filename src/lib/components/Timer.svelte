<script lang="ts">
  export let start = false;
  
  let time: ReturnType<typeof setInterval>;
  let numSeconds = 0;

  $: if (start && time === undefined) {
    time = setInterval(() => {
      numSeconds++;
    }, 1000);
  } else if (!start && time !== undefined) {
    clearInterval(time);
  }
</script>

<h1>{ numSeconds }</h1>


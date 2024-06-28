<script lang="ts">
  export let start = false;
  export let stop = false;
  
  let time: ReturnType<typeof setInterval> | undefined;
  let numSeconds = 0;

  $: if (start && time === undefined) {
    time = setInterval(() => {
      numSeconds++;
    }, 1000);
  } else if (stop && time !== undefined) {
    clearInterval(time);
    time = undefined;
    numSeconds = 0;
  }
</script>

<h1>{ numSeconds }</h1>


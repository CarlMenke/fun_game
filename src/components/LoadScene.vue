<template>
    <div>
      <canvas ref="bjsCanvas" width="500" height="500" />
    </div>
</template>
  
  <script>
  import { createScene } from "../scenes/SceneLogic";
  
  export default {
    name: "LoadScene",
  
    mounted() {
      const bjsCanvas = this.$refs.bjsCanvas;

      if (bjsCanvas) {
        createScene(bjsCanvas);
      }
    }
  };
  </script>
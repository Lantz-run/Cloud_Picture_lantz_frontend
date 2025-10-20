<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/Lantz-run" target="_blank">
          <GithubOutlined />
          LANTZ CLOUD
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { GithubOutlined } from '@ant-design/icons-vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

#basicLayout .content {
  background: linear-gradient(to right, rgba(182, 122, 221, 0.81), rgba(83, 111, 216, 0.92));
  margin-bottom: 16px;
  padding: 20px;
}

#basicLayout .header {
  padding-inline: 10px;
  margin-bottom: 6px;
  background: linear-gradient(to right, rgba(156, 140, 234, 0.85), rgba(194, 118, 241, 0.88));
}
</style>

<template>
  <Waline :serverURL="serverURL" :path="path"/>
</template>
<script setup>
import {Waline} from '@waline/client/component';
import {computed} from 'vue';
import {useRoute} from 'vue-router';

import '@waline/client/dist/waline.css';

const serverURL = 'https://jf-comment.whitefea5.top';
const path = computed(() => useRoute().path);
</script>

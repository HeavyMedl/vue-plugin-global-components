/* eslint-disable import/no-relative-packages */
import { createApp } from 'vue';
import './style.css';
// Ignoring this for CI/CD
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from './App.vue';

import GlobalComponentPlugin from '../../../src/main';

const app = createApp(App);
app.use(GlobalComponentPlugin, import.meta.glob('./components/**/*.vue'));
app.mount('#app');

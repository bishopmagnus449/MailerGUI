import {CkeditorPlugin} from "@ckeditor/ckeditor5-vue";
import {type NuxtApp, defineNuxtPlugin} from "nuxt/app";
import 'ckeditor5/ckeditor5.css';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
    nuxtApp.vueApp.use(CkeditorPlugin);

});
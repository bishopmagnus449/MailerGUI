import 'buefy/dist/buefy.css';
import Buefy from "buefy";
import {type NuxtApp} from "nuxt/app";

// @ts-ignore
export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
    // @ts-ignore
    nuxtApp.vueApp.use(Buefy);
});
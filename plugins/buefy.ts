import 'buefy/dist/buefy.css';
import Buefy from "buefy";
import {type NuxtApp} from "nuxt/app";

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
    nuxtApp.vueApp.use(Buefy);
});
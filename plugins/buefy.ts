import 'buefy/dist/buefy.css';
import Buefy from "buefy";

export default defineNuxtPlugin((nuxtApp) => {
    // @ts-ignore
    nuxtApp.vueApp.use(Buefy);
});
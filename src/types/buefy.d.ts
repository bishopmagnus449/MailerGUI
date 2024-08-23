import { BuefyNamespace } from 'buefy';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $buefy: BuefyNamespace;
    }
}

export {};
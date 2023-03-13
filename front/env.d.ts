/// <reference types="vite/client" />
declare namespace NodeJS {
    interface ProcessEnv {
        VUE_APP_WEB_HOST: string;
        VYE_APP_BACK_PORT: number;
        VUE_APP_FRONT_PORT: number;
    }
}

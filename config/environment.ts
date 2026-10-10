import { qaConfig } from './environments/qa.config';
import { uatConfig } from './environments/uat.config';

export class EnvManager {
    static getConfig() {
        const env = process.env.ENV || 'qa';

        switch (env.toLowerCase()) {
            case 'qa':
                return qaConfig;
            case 'uat':
                return uatConfig;
            default:
                throw new Error(`Environment '${env}' is not supported!`);
        }
    }
}

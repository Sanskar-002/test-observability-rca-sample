// PROFILE-aware WDIO config. Switch envs by setting PROFILE in the command:
//   PROFILE=prod        npm test   (default — public BrowserStack)
//   PROFILE=preprod     npm test   (hub-preprod.bsstag.com)
//   PROFILE=regression  npm test   (hub-k8s.bsstag.com, regression cluster)
//
// Per-env credentials use env var names that mirror the existing
// BStackAutomation/observability orchestration (configs/{PROFILE}.js):
//   prod:        BROWSERSTACK_USERNAME              / BROWSERSTACK_ACCESS_KEY
//   preprod:     BROWSERSTACK_PREPROD_USERNAME      / BROWSERSTACK_PREPROD_ACCESS_KEY
//   regression:  BROWSERSTACK_REGRESSION_USERNAME   / BROWSERSTACK_REGRESSION_ACCESS_KEY

const PROFILE = (process.env.PROFILE || 'prod').toLowerCase();

const PROFILES = {
    prod: {
        hostname: 'hub-cloud.browserstack.com',
        user: process.env.BROWSERSTACK_USERNAME,
        key: process.env.BROWSERSTACK_ACCESS_KEY
    },
    preprod: {
        hostname: 'hub-preprod.bsstag.com',
        user: process.env.BROWSERSTACK_PREPROD_USERNAME || process.env.BROWSERSTACK_USERNAME,
        key: process.env.BROWSERSTACK_PREPROD_ACCESS_KEY || process.env.BROWSERSTACK_ACCESS_KEY
    },
    regression: {
        hostname: 'hub-k8s.bsstag.com',
        user: process.env.BROWSERSTACK_REGRESSION_USERNAME || process.env.BROWSERSTACK_USERNAME,
        key: process.env.BROWSERSTACK_REGRESSION_ACCESS_KEY || process.env.BROWSERSTACK_ACCESS_KEY
    }
};

if (!PROFILES[PROFILE]) {
    throw new Error(`Unknown PROFILE='${PROFILE}'. Use one of: ${Object.keys(PROFILES).join(', ')}`);
}

const env = PROFILES[PROFILE];

exports.config = {
    runner: 'local',

    user: env.user,
    key: env.key,

    hostname: env.hostname,
    port: 443,
    protocol: 'https',

    specs: ['./specs/**/*.spec.js'],

    maxInstances: 1,

    capabilities: [{
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
            os: 'Windows',
            osVersion: '10',
            projectName: 'Test Observability Samples',
            buildName: process.env.BUILD_NAME
                || `bad-pr-causation-${PROFILE}-${new Date().toISOString().split('T')[0]}`,
            buildTag: PROFILE,
            sessionName: 'Bad PR Causation - RCA training signal',
            debug: true,
            networkLogs: true,
            consoleLogs: 'verbose',
            video: true
        }
    }],

    services: [
        ['browserstack', {
            testObservability: true,
            testObservabilityOptions: {
                projectName: 'Test Observability Samples',
                buildName: process.env.BUILD_NAME
                    || `bad-pr-causation-${PROFILE}-${new Date().toISOString().split('T')[0]}`,
                buildTag: PROFILE
            }
        }]
    ],

    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    reporters: ['spec'],

    before: function () {
        console.log(`[bad-pr-causation] Running on PROFILE=${PROFILE} hub=${env.hostname}`);
    }
};

// Configuration for the PingID Bingo Extension
const CONFIG = {
    // Backend API URL (change for production)
    API_URL: 'http://pegasusbingo.leo.rd.hpicorp.net/',

    // Frontend Bingo App URL (change for production)
    BINGO_APP_URL: 'http://pegasusbingo.leo.rd.hpicorp.net/',

    // Storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_INFO: 'userInfo',
        LAST_ACTION: 'lastAction',
        PAGE_LOAD_HISTORY: 'pageLoadHistory'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

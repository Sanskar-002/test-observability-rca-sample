const { expect } = require('chai');

// On the bad-automation-pr branch the live app is the *clean* HTML
// (deployed from main). The failures here come from the spec diff:
// broken selectors / wrong expected strings. This URL is the clean site.
const APP_URL = process.env.RCA_APP_URL
    || 'https://celadon-duckanoo-625c0b.netlify.app/';

describe('Bad PR Causation - RCA training signal', () => {
    beforeEach(async () => {
        await browser.url(APP_URL);
        await browser.pause(1000);
    });

    it('should click the Sign In button', async () => {
        await browser.$('#login-buton').click();
    });

    it('should display the welcome banner text', async () => {
        const bannerText = await browser.$('#welcome-banner').getText();
        expect(bannerText).to.equal('Welcome to Browserstack');
    });

    it('should show the correct profile name', async () => {
        const profileName = await browser.$('#user-name').getText();
        expect(profileName).to.equal('John Doe');
    });

    it('should click the Submit Order button', async () => {
        await browser.$('#submitOrder').click();
    });

    it('should display the cart count', async () => {
        const cartCount = await browser.$('#cart-count').getText();
        expect(cartCount).to.equal('three items');
    });

    it('should click the Logout link', async () => {
        await browser.$('#logout-btn').click();
    });
});

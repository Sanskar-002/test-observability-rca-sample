const { expect } = require('chai');

const APP_URL = process.env.RCA_APP_URL
    || 'https://tranquil-custard-21c4b2.netlify.app/';

describe('Bad PR Causation - RCA training signal', () => {
    beforeEach(async () => {
        await browser.url(APP_URL);
        await browser.pause(1000);
    });

    it('should click the Sign In button', async () => {
        await browser.$('#login-btn').click();
    });

    it('should display the welcome banner text', async () => {
        const bannerText = await browser.$('#welcome-banner').getText();
        expect(bannerText).to.equal('Welcome to Stackmate');
    });

    it('should show the correct profile name', async () => {
        const profileName = await browser.$('#profile-name').getText();
        expect(profileName).to.equal('John Doe');
    });

    it('should click the Submit Order button', async () => {
        await browser.$('#submit-form-btn').click();
    });

    it('should display the cart count', async () => {
        const cartCount = await browser.$('#cart-count').getText();
        expect(cartCount).to.equal('3 items');
    });

    it('should click the Logout link', async () => {
        await browser.$('#logout-link').click();
    });
});

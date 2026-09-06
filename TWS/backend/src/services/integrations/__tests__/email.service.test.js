const emailService = require('../email.service');

describe('EmailService tenant welcome email', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('links setup to the path-based tenant workspace URL', async () => {
    const sendEmail = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ success: true });

    await emailService.sendTenantWelcomeEmail(
      { fullName: 'Tenant Owner', email: 'owner@example.com' },
      { name: 'Example Co', slug: 'example-co', erpCategory: 'software_house' },
      'https://housesbase.com/example-co'
    );

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [, , html] = sendEmail.mock.calls[0];
    expect(html).toContain('href="https://housesbase.com/example-co/org/onboarding"');
    expect(html).not.toContain('example-co.housesbase.com');
    expect(html).not.toContain('example-co.swh.housesbase.com');
  });

  it('adds a protocol and trims a trailing slash on the workspace URL', async () => {
    const sendEmail = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ success: true });

    await emailService.sendTenantWelcomeEmail(
      { fullName: 'Tenant Owner', email: 'owner@example.com' },
      { name: 'Example Co', slug: 'example-co' },
      'housesbase.com/example-co/'
    );

    const [, , html] = sendEmail.mock.calls[0];
    expect(html).toContain('href="https://housesbase.com/example-co/org/onboarding"');
    expect(html).not.toContain('https://https://');
  });
});

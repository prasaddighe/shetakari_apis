/**
 * SMS Gateway Service
 * Supports Fast2SMS (Popular Indian SMS Gateway) or console fallback in Dev mode.
 */
export class SmsService {
  /**
   * Generates a random 6-digit numeric OTP code.
   */
  public generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Sends real SMS to mobile number if FAST2SMS_API_KEY or SMS_API_KEY is configured.
   */
  public async sendSms(mobileNumber: string, otpCode: string): Promise<boolean> {
    const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
    const cleanNumber = mobileNumber.trim().replace(/^\+91/, '');

    if (!apiKey) {
      console.log(`\n📱 [SMS DEV MOCK] Real SMS API key not configured.`);
      console.log(`📲 Target Mobile: +91 ${cleanNumber}`);
      console.log(`🔑 Generated OTP Code: ${otpCode}\n`);
      return true;
    }

    try {
      // Integration with Fast2SMS Quick SMS API (India)
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanNumber,
        }),
      });

      const data = await response.json() as any;
      if (data.return) {
        console.log(`✅ [SMS Gateway Success] Real SMS sent to +91 ${cleanNumber}`);
        return true;
      } else {
        console.error(`❌ [SMS Gateway Error]:`, data.message || data);
        return false;
      }
    } catch (error) {
      console.error(`❌ [SMS Gateway Exception]:`, error);
      return false;
    }
  }
}

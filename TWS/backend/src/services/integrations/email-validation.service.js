const dns = require('dns').promises;
const https = require('https');
const http = require('http');

/**
 * Email Validation Service
 * Uses open source methods and free APIs to validate email addresses
 */
class EmailValidationService {
  constructor() {
    // List of common disposable email domains (can be expanded)
    this.disposableEmailDomains = new Set([
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
      'throwaway.email', 'getnada.com', 'mohmal.com', 'temp-mail.org',
      'yopmail.com', 'sharklasers.com', 'getairmail.com', 'mintemail.com'
    ]);

    // Free email validation API endpoints (optional, can be used if available)
    this.freeAPIs = {
      // AbstractAPI (free tier: 100 requests/month)
      abstractAPI: process.env.ABSTRACT_API_KEY ? 
        `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=` : null,
      
      // EmailListVerify (free tier available)
      emailListVerify: process.env.EMAILLISTVERIFY_API_KEY ?
        `https://apps.emaillistverify.com/api/verifyEmail?secret=${process.env.EMAILLISTVERIFY_API_KEY}&email=` : null
    };
  }

  /**
   * Comprehensive email validation
   * @param {string} email - Email address to validate
   * @returns {Object} Validation result
   */
  async validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Email is required'
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1: Basic format validation
    const formatCheck = this.validateFormat(normalizedEmail);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Step 2: Extract domain
    const domain = normalizedEmail.split('@')[1];
    if (!domain) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Invalid email format'
      };
    }

    // Step 3: Check disposable email domains
    const disposableCheck = this.checkDisposableEmail(domain);
    if (!disposableCheck.valid) {
      return disposableCheck;
    }

    // Step 4: Check MX records (DNS validation) - Non-blocking
    // If MX check fails or times out, we still allow the email (don't block signup)
    let mxCheck;
    try {
      mxCheck = await Promise.race([
        this.checkMXRecords(domain),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MX check timeout')), 3000))
      ]);
      
      // Don't block signup if MX check fails - only log a warning
      if (!mxCheck.valid) {
        console.warn(`⚠️ MX record check failed for ${domain}, but allowing signup`);
        mxCheck = { valid: true, hasMXRecords: false, message: 'MX check failed but allowed' };
      }
    } catch (mxError) {
      console.warn(`⚠️ MX record check error for ${domain}, allowing signup:`, mxError.message);
      mxCheck = { valid: true, hasMXRecords: false, message: 'MX check skipped due to error' };
    }

    // Step 5: Optional - Use free API if configured
    if (this.freeAPIs.abstractAPI) {
      try {
        const apiCheck = await this.validateWithAbstractAPI(normalizedEmail);
        if (!apiCheck.valid) {
          return apiCheck;
        }
      } catch (error) {
        console.warn('AbstractAPI validation failed, continuing with DNS check:', error.message);
        // Continue with DNS validation if API fails
      }
    }

    return {
      valid: true,
      message: 'Email is valid',
      domain: domain,
      checks: {
        format: true,
        disposable: false,
        mxRecords: mxCheck.hasMXRecords
      }
    };
  }

  /**
   * Validate email format using regex
   */
  validateFormat(email) {
    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Invalid email format'
      };
    }

    // Check length
    if (email.length > 254) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Email address is too long'
      };
    }

    // Check local part length (before @)
    const localPart = email.split('@')[0];
    if (localPart.length > 64) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Email local part is too long'
      };
    }

    return {
      valid: true,
      message: 'Email format is valid'
    };
  }

  /**
   * Check if email domain is disposable/temporary
   */
  checkDisposableEmail(domain) {
    // Check against known disposable domains
    if (this.disposableEmailDomains.has(domain)) {
      return {
        valid: false,
        reason: 'disposable_email',
        message: 'Disposable email addresses are not allowed'
      };
    }

    // Check common patterns
    const disposablePatterns = [
      /^temp/i,
      /^tmp/i,
      /^test/i,
      /^fake/i,
      /^throwaway/i,
      /^trash/i,
      /^spam/i
    ];

    for (const pattern of disposablePatterns) {
      if (pattern.test(domain)) {
        return {
          valid: false,
          reason: 'disposable_email',
          message: 'Disposable email addresses are not allowed'
        };
      }
    }

    return {
      valid: true,
      message: 'Email domain is not disposable'
    };
  }

  /**
   * Check MX records for domain (DNS validation)
   * This validates that the domain can receive emails
   */
  async checkMXRecords(domain) {
    try {
      // First check if domain exists (A record)
      try {
        await dns.resolve4(domain);
      } catch (error) {
        // If no A record, check for MX records
        try {
          const mxRecords = await dns.resolveMx(domain);
          if (mxRecords && mxRecords.length > 0) {
            return {
              valid: true,
              hasMXRecords: true,
              mxRecords: mxRecords.map(r => r.exchange),
              message: 'Domain has valid MX records'
            };
          }
        } catch (mxError) {
          return {
            valid: false,
            reason: 'no_mx_records',
            message: 'Domain does not have valid MX records and cannot receive emails'
          };
        }
      }

      // Check MX records
      try {
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
          return {
            valid: true,
            hasMXRecords: true,
            mxRecords: mxRecords.map(r => r.exchange),
            message: 'Domain has valid MX records'
          };
        } else {
          return {
            valid: false,
            reason: 'no_mx_records',
            message: 'Domain does not have MX records configured'
          };
        }
      } catch (error) {
        // If MX resolution fails, domain might not exist or be misconfigured
        return {
          valid: false,
          reason: 'no_mx_records',
          message: 'Unable to verify domain MX records'
        };
      }
    } catch (error) {
      // DNS resolution failed - might be network issue or invalid domain
      console.warn(`DNS check failed for ${domain}:`, error.message);
      return {
        valid: false,
        reason: 'dns_error',
        message: 'Unable to verify domain. Please check if the domain is correct.'
      };
    }
  }

  /**
   * Validate email using AbstractAPI (free tier available)
   * Requires ABSTRACT_API_KEY in environment variables
   */
  async validateWithAbstractAPI(email) {
    if (!this.freeAPIs.abstractAPI) {
      return { valid: true, message: 'API not configured' };
    }

    return new Promise((resolve, reject) => {
      const url = `${this.freeAPIs.abstractAPI}${encodeURIComponent(email)}`;
      
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            
            // AbstractAPI response format
            if (result.deliverability === 'DELIVERABLE' || result.quality_score > 0.7) {
              resolve({
                valid: true,
                message: 'Email is valid and deliverable',
                qualityScore: result.quality_score,
                source: 'abstractapi'
              });
            } else {
              resolve({
                valid: false,
                reason: 'undeliverable',
                message: result.deliverability === 'UNDELIVERABLE' 
                  ? 'Email address is not deliverable'
                  : 'Email validation failed',
                source: 'abstractapi'
              });
            }
          } catch (error) {
            reject(new Error('Failed to parse API response'));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Quick validation (format + disposable check only, no DNS)
   * Use this for real-time validation in forms
   */
  quickValidate(email) {
    if (!email || typeof email !== 'string') {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Email is required'
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const formatCheck = this.validateFormat(normalizedEmail);
    
    if (!formatCheck.valid) {
      return formatCheck;
    }

    const domain = normalizedEmail.split('@')[1];
    if (!domain) {
      return {
        valid: false,
        reason: 'invalid_format',
        message: 'Invalid email format'
      };
    }

    const disposableCheck = this.checkDisposableEmail(domain);
    return disposableCheck;
  }

  /**
   * Batch validate multiple emails
   */
  async validateBatch(emails) {
    const results = await Promise.all(
      emails.map(async (email) => {
        const result = await this.validateEmail(email);
        return { email, ...result };
      })
    );

    return results;
  }
}

module.exports = new EmailValidationService();

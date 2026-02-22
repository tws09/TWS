const moment = require('moment-timezone');

class TimezoneService {
  constructor() {
    this.commonTimezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Hong_Kong',
      'Asia/Singapore',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'America/Sao_Paulo',
      'America/Mexico_City',
      'America/Toronto',
      'America/Vancouver',
      'Europe/Moscow',
      'Asia/Seoul',
      'Asia/Bangkok',
      'Asia/Jakarta',
      'Asia/Manila',
      'Africa/Cairo',
      'Africa/Johannesburg'
    ];
  }

  // Get all available timezones
  getAllTimezones() {
    return moment.tz.names().map(tz => ({
      value: tz,
      label: tz.replace(/_/g, ' '),
      offset: this.getTimezoneOffset(tz),
      isCommon: this.commonTimezones.includes(tz)
    })).sort((a, b) => {
      // Sort common timezones first, then by offset
      if (a.isCommon && !b.isCommon) return -1;
      if (!a.isCommon && b.isCommon) return 1;
      return a.offset - b.offset;
    });
  }

  // Get common timezones
  getCommonTimezones() {
    return this.commonTimezones.map(tz => ({
      value: tz,
      label: tz.replace(/_/g, ' '),
      offset: this.getTimezoneOffset(tz)
    }));
  }

  // Get timezone offset in minutes
  getTimezoneOffset(timezone) {
    return moment.tz(timezone).utcOffset();
  }

  // Convert time between timezones
  convertTime(time, fromTimezone, toTimezone) {
    return moment.tz(time, fromTimezone).tz(toTimezone);
  }

  // Get current time in a specific timezone
  getCurrentTime(timezone) {
    return moment.tz(timezone);
  }

  // Format time for a specific timezone
  formatTime(time, timezone, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment.tz(time, timezone).format(format);
  }

  // Get timezone info for a specific timezone
  getTimezoneInfo(timezone) {
    const now = moment.tz(timezone);
    return {
      timezone,
      currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
      offset: now.utcOffset(),
      offsetString: now.format('Z'),
      isDST: now.isDST(),
      abbreviation: now.format('z')
    };
  }

  // Find best meeting time across multiple timezones
  findBestMeetingTime(timezones, duration = 60, preferredStartHour = 9, preferredEndHour = 17) {
    const now = moment();
    const candidates = [];
    
    // Generate time candidates for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = now.clone().add(day, 'days');
      
      // Skip weekends if preferred
      if (date.day() === 0 || date.day() === 6) continue;
      
      for (let hour = preferredStartHour; hour <= preferredEndHour - Math.ceil(duration / 60); hour++) {
        const candidate = date.clone().hour(hour).minute(0).second(0);
        
        // Check if this time works for all timezones
        const timezoneTimes = timezones.map(tz => ({
          timezone: tz,
          localTime: candidate.clone().tz(tz),
          isBusinessHours: this.isBusinessHours(candidate.clone().tz(tz))
        }));
        
        const businessHoursCount = timezoneTimes.filter(t => t.isBusinessHours).length;
        const totalCount = timezoneTimes.length;
        
        candidates.push({
          utcTime: candidate.utc(),
          timezoneTimes,
          businessHoursScore: businessHoursCount / totalCount,
          day: date.format('dddd'),
          hour: hour
        });
      }
    }
    
    // Sort by business hours score (descending)
    candidates.sort((a, b) => b.businessHoursScore - a.businessHoursScore);
    
    return candidates.slice(0, 10); // Return top 10 candidates
  }

  // Check if a time is within business hours
  isBusinessHours(time) {
    const hour = time.hour();
    const day = time.day();
    
    // Monday to Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  }

  // Get business hours for a timezone
  getBusinessHours(timezone) {
    return {
      timezone,
      start: '09:00',
      end: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      offset: this.getTimezoneOffset(timezone)
    };
  }

  // Calculate meeting duration across timezones
  calculateMeetingDuration(startTime, endTime, timezone) {
    const start = moment.tz(startTime, timezone);
    const end = moment.tz(endTime, timezone);
    
    return {
      duration: end.diff(start, 'minutes'),
      startTime: start.format('YYYY-MM-DD HH:mm:ss'),
      endTime: end.format('YYYY-MM-DD HH:mm:ss'),
      timezone
    };
  }

  // Get timezone suggestions based on user location
  getTimezoneSuggestions(userTimezone, limit = 5) {
    const userOffset = this.getTimezoneOffset(userTimezone);
    
    return this.commonTimezones
      .map(tz => ({
        timezone: tz,
        offset: this.getTimezoneOffset(tz),
        offsetDiff: Math.abs(this.getTimezoneOffset(tz) - userOffset)
      }))
      .sort((a, b) => a.offsetDiff - b.offsetDiff)
      .slice(0, limit)
      .map(tz => ({
        value: tz.timezone,
        label: tz.timezone.replace(/_/g, ' '),
        offset: tz.offset,
        offsetDiff: tz.offsetDiff
      }));
  }

  // Validate timezone
  isValidTimezone(timezone) {
    return moment.tz.zone(timezone) !== null;
  }

  // Get timezone by country
  getTimezonesByCountry(countryCode) {
    const countryTimezones = {
      'US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
      'GB': ['Europe/London'],
      'DE': ['Europe/Berlin'],
      'FR': ['Europe/Paris'],
      'IT': ['Europe/Rome'],
      'ES': ['Europe/Madrid'],
      'JP': ['Asia/Tokyo'],
      'CN': ['Asia/Shanghai'],
      'HK': ['Asia/Hong_Kong'],
      'SG': ['Asia/Singapore'],
      'IN': ['Asia/Kolkata'],
      'AE': ['Asia/Dubai'],
      'AU': ['Australia/Sydney', 'Australia/Melbourne'],
      'NZ': ['Pacific/Auckland'],
      'BR': ['America/Sao_Paulo'],
      'MX': ['America/Mexico_City'],
      'CA': ['America/Toronto', 'America/Vancouver'],
      'RU': ['Europe/Moscow'],
      'KR': ['Asia/Seoul'],
      'TH': ['Asia/Bangkok'],
      'ID': ['Asia/Jakarta'],
      'PH': ['Asia/Manila'],
      'EG': ['Africa/Cairo'],
      'ZA': ['Africa/Johannesburg']
    };

    return countryTimezones[countryCode] || [];
  }

  // Get timezone by coordinates (approximate)
  getTimezoneByCoordinates(lat, lng) {
    // This is a simplified implementation
    // In a real application, you would use a more sophisticated geolocation service
    
    if (lat >= 24 && lat <= 71 && lng >= -125 && lng <= -66) {
      // North America
      if (lng >= -125 && lng <= -114) return 'America/Los_Angeles';
      if (lng >= -114 && lng <= -102) return 'America/Denver';
      if (lng >= -102 && lng <= -87) return 'America/Chicago';
      return 'America/New_York';
    } else if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
      // Europe
      if (lng >= -10 && lng <= 2) return 'Europe/London';
      if (lng >= 2 && lng <= 16) return 'Europe/Paris';
      if (lng >= 16 && lng <= 30) return 'Europe/Berlin';
      return 'Europe/Moscow';
    } else if (lat >= 20 && lat <= 50 && lng >= 120 && lng <= 150) {
      // East Asia
      if (lng >= 120 && lng <= 130) return 'Asia/Tokyo';
      if (lng >= 130 && lng <= 140) return 'Asia/Seoul';
      return 'Asia/Shanghai';
    }
    
    return 'UTC'; // Default fallback
  }

  // Format timezone for display
  formatTimezoneForDisplay(timezone) {
    const info = this.getTimezoneInfo(timezone);
    return `${timezone.replace(/_/g, ' ')} (${info.offsetString})`;
  }

  // Get timezone abbreviations
  getTimezoneAbbreviations() {
    const abbreviations = {};
    
    this.commonTimezones.forEach(tz => {
      const info = this.getTimezoneInfo(tz);
      abbreviations[tz] = info.abbreviation;
    });
    
    return abbreviations;
  }

  // Check if two times are in the same day across timezones
  isSameDay(time1, timezone1, time2, timezone2) {
    const t1 = moment.tz(time1, timezone1);
    const t2 = moment.tz(time2, timezone2);
    
    return t1.format('YYYY-MM-DD') === t2.format('YYYY-MM-DD');
  }

  // Get next business day in a timezone
  getNextBusinessDay(timezone, date = null) {
    const startDate = date ? moment.tz(date, timezone) : moment.tz(timezone);
    let nextDay = startDate.clone().add(1, 'day');
    
    while (nextDay.day() === 0 || nextDay.day() === 6) {
      nextDay.add(1, 'day');
    }
    
    return nextDay;
  }

  // Get previous business day in a timezone
  getPreviousBusinessDay(timezone, date = null) {
    const startDate = date ? moment.tz(date, timezone) : moment.tz(timezone);
    let prevDay = startDate.clone().subtract(1, 'day');
    
    while (prevDay.day() === 0 || prevDay.day() === 6) {
      prevDay.subtract(1, 'day');
    }
    
    return prevDay;
  }
}

module.exports = new TimezoneService();

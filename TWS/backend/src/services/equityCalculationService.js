/**
 * Equity Calculation Service
 * Handles all equity calculations including ownership %, dilution, vesting, etc.
 * Based on worked examples with digit-by-digit arithmetic
 */

class EquityCalculationService {
  /**
   * Calculate ownership percentage
   * Formula: (holder shares) ÷ (total post shares) × 100
   * 
   * @param {Number} holderShares - Number of shares held
   * @param {Number} totalShares - Total outstanding shares
   * @param {Number} precision - Decimal places (default: 2)
   * @returns {Number} Ownership percentage
   */
  calculateOwnershipPercentage(holderShares, totalShares, precision = 2) {
    if (!totalShares || totalShares === 0) {
      return 0;
    }
    const percentage = (holderShares / totalShares) * 100;
    return this.roundToPrecision(percentage, precision);
  }

  /**
   * Calculate total shares (pre-money)
   * Sum of all issued shares including reserved pools
   * 
   * @param {Array} shareHoldings - Array of {shares: Number, type: String}
   * @returns {Number} Total pre-money shares
   */
  calculatePreMoneyShares(shareHoldings) {
    return shareHoldings.reduce((total, holding) => {
      return total + (holding.shares || 0);
    }, 0);
  }

  /**
   * Calculate post-money shares after new issuance
   * Post-money = Pre-money + New shares issued
   * 
   * @param {Number} preMoneyShares - Total shares before investment
   * @param {Number} newShares - New shares being issued
   * @returns {Number} Total post-money shares
   */
  calculatePostMoneyShares(preMoneyShares, newShares) {
    return preMoneyShares + newShares;
  }

  /**
   * Calculate new shares needed for target ownership percentage
   * Solves: InvestorShares = (Desired% × PostTotal)
   * Rearranged: NewShares = (Desired% × PreMoney) / (1 - Desired%)
   * 
   * @param {Number} preMoneyShares - Total shares before investment
   * @param {Number} targetOwnershipPercent - Target ownership % (e.g., 20 for 20%)
   * @returns {Number} Number of new shares needed
   */
  calculateSharesForOwnershipPercentage(preMoneyShares, targetOwnershipPercent) {
    if (targetOwnershipPercent >= 100 || targetOwnershipPercent <= 0) {
      throw new Error('Target ownership must be between 0 and 100');
    }
    const targetDecimal = targetOwnershipPercent / 100;
    const newShares = (targetDecimal * preMoneyShares) / (1 - targetDecimal);
    return Math.ceil(newShares); // Round up to avoid fractional shares
  }

  /**
   * Calculate ownership percentage after dilution
   * 
   * @param {Number} currentShares - Current shares held
   * @param {Number} preMoneyTotal - Total shares before new issuance
   * @param {Number} newSharesIssued - New shares being issued
   * @returns {Object} {preMoneyPercent, postMoneyPercent, dilution}
   */
  calculateDilutionImpact(currentShares, preMoneyTotal, newSharesIssued) {
    const postMoneyTotal = preMoneyTotal + newSharesIssued;
    const preMoneyPercent = this.calculateOwnershipPercentage(currentShares, preMoneyTotal);
    const postMoneyPercent = this.calculateOwnershipPercentage(currentShares, postMoneyTotal);
    const dilution = preMoneyPercent - postMoneyPercent;

    return {
      preMoneyPercent: this.roundToPrecision(preMoneyPercent, 2),
      postMoneyPercent: this.roundToPrecision(postMoneyPercent, 2),
      dilution: this.roundToPrecision(dilution, 2),
      currentShares,
      preMoneyTotal,
      postMoneyTotal,
      newSharesIssued
    };
  }

  /**
   * Calculate cap table with ownership percentages
   * Based on worked example:
   * - Founder A: 6,000,000 shares → 46.15%
   * - Founder B: 2,500,000 shares → 19.23%
   * - Founder C: 1,500,000 shares → 11.54%
   * - Options Pool: 1,000,000 shares → 7.69%
   * - Investor: 2,000,000 shares → 15.38%
   * Total: 13,000,000 shares
   * 
   * @param {Array} holdings - Array of {holderName, shares, type}
   * @returns {Array} Cap table with ownership percentages
   */
  calculateCapTable(holdings) {
    const totalShares = holdings.reduce((sum, holding) => sum + (holding.shares || 0), 0);
    
    if (totalShares === 0) {
      return holdings.map(holding => ({
        ...holding,
        ownershipPercent: 0,
        ownershipDecimal: 0
      }));
    }

    return holdings.map(holding => {
      const shares = holding.shares || 0;
      const ownershipPercent = this.calculateOwnershipPercentage(shares, totalShares, 2);
      const ownershipDecimal = shares / totalShares;

      return {
        ...holding,
        shares,
        ownershipPercent: this.roundToPrecision(ownershipPercent, 2),
        ownershipDecimal: this.roundToPrecision(ownershipDecimal, 6),
        totalShares
      };
    });
  }

  /**
   * Calculate fully diluted ownership (including options, warrants, etc.)
   * 
   * @param {Array} issuedHoldings - Current issued shares
   * @param {Array} optionGrants - Options that could be exercised
   * @param {Array} convertibleInstruments - Convertible instruments
   * @returns {Object} Fully diluted cap table
   */
  calculateFullyDilutedCapTable(issuedHoldings, optionGrants = [], convertibleInstruments = []) {
    // Calculate current outstanding
    const currentOutstanding = issuedHoldings.reduce((sum, h) => sum + (h.shares || 0), 0);
    
    // Calculate potential shares from options (assuming all exercised)
    const potentialOptionShares = optionGrants.reduce((sum, grant) => {
      return sum + (grant.vestedOptions || grant.numberOfOptions || 0);
    }, 0);

    // Calculate potential shares from convertible instruments
    const potentialConvertibleShares = convertibleInstruments.reduce((sum, instrument) => {
      if (instrument.status === 'converted') {
        return sum + (instrument.convertedShares || 0);
      }
      // Estimate conversion based on valuation cap
      // This is simplified - real calculation depends on conversion terms
      return sum + (instrument.estimatedShares || 0);
    }, 0);

    // Fully diluted total
    const fullyDilutedTotal = currentOutstanding + potentialOptionShares + potentialConvertibleShares;

    // Calculate ownership for each holder
    const capTable = issuedHoldings.map(holding => {
      const shares = holding.shares || 0;
      const ownershipPercent = this.calculateOwnershipPercentage(shares, fullyDilutedTotal, 2);
      const fullyDilutedPercent = this.calculateOwnershipPercentage(shares, fullyDilutedTotal, 2);

      return {
        ...holding,
        shares,
        ownershipPercent: this.roundToPrecision(ownershipPercent, 2),
        fullyDilutedPercent: this.roundToPrecision(fullyDilutedPercent, 2),
        fullyDilutedTotal
      };
    });

    return {
      capTable,
      currentOutstanding,
      potentialOptionShares,
      potentialConvertibleShares,
      fullyDilutedTotal,
      summary: {
        currentOutstanding,
        optionsPool: potentialOptionShares,
        convertibles: potentialConvertibleShares,
        fullyDiluted: fullyDilutedTotal
      }
    };
  }

  /**
   * Calculate vested shares based on vesting schedule
   * 
   * @param {Object} vestingSchedule - Vesting schedule object
   * @param {Date} asOfDate - Date to calculate vesting as of (default: today)
   * @returns {Object} Vested shares information
   */
  calculateVestedShares(vestingSchedule, asOfDate = new Date()) {
    const {
      grantDate,
      cliffMonths,
      vestingMonths,
      totalShares,
      vestingType = 'monthly',
      vestedShares = 0,
      customVestingDates = []
    } = vestingSchedule;

    const grant = new Date(grantDate);
    const today = new Date(asOfDate);
    const monthsSinceGrant = this.monthsBetween(grant, today);

    // Check if cliff has been reached
    if (monthsSinceGrant < cliffMonths) {
      return {
        vestedShares: 0,
        unvestedShares: totalShares,
        vestedPercent: 0,
        cliffReached: false,
        monthsUntilCliff: cliffMonths - monthsSinceGrant
      };
    }

    // Cliff reached - calculate vested shares
    let vested = 0;

    if (vestingType === 'custom' && customVestingDates.length > 0) {
      // Custom vesting schedule
      vested = customVestingDates
        .filter(v => new Date(v.date) <= today)
        .reduce((sum, v) => sum + (v.shares || 0), 0);
    } else {
      // Linear vesting after cliff
      const vestingMonthsElapsed = Math.min(
        monthsSinceGrant - cliffMonths,
        vestingMonths
      );
      const vestingRate = totalShares / vestingMonths;
      vested = Math.min(vestingRate * vestingMonthsElapsed, totalShares);
    }

    // Don't allow vested to exceed total or be less than already vested
    vested = Math.max(vested, vestedShares);
    vested = Math.min(vested, totalShares);

    const unvested = totalShares - vested;
    const vestedPercent = (vested / totalShares) * 100;

    return {
      vestedShares: Math.floor(vested),
      unvestedShares: Math.ceil(unvested),
      vestedPercent: this.roundToPrecision(vestedPercent, 2),
      cliffReached: true,
      monthsSinceGrant,
      nextVestDate: this.calculateNextVestDate(vestingSchedule, asOfDate)
    };
  }

  /**
   * Simulate new investment round (what-if scenario)
   * 
   * @param {Array} currentHoldings - Current cap table
   * @param {Object} newInvestment - {amount: Number, newShares: Number OR targetPercent: Number}
   * @param {Object} options - {includeOptionPool: Boolean, optionPoolSize: Number}
   * @returns {Object} Post-money cap table with dilution analysis
   */
  simulateInvestmentRound(currentHoldings, newInvestment, options = {}) {
    const { includeOptionPool = false, optionPoolSize = 0 } = options;
    
    // Calculate pre-money shares
    let preMoneyShares = currentHoldings.reduce((sum, h) => sum + (h.shares || 0), 0);
    
    // Add option pool if creating it pre-money
    if (includeOptionPool && optionPoolSize > 0) {
      preMoneyShares += optionPoolSize;
    }

    // Determine new shares to issue
    let newShares = 0;
    if (newInvestment.newShares) {
      newShares = newInvestment.newShares;
    } else if (newInvestment.targetPercent) {
      newShares = this.calculateSharesForOwnershipPercentage(preMoneyShares, newInvestment.targetPercent);
    } else {
      throw new Error('Must provide either newShares or targetPercent');
    }

    // Calculate post-money
    const postMoneyShares = preMoneyShares + newShares;

    // Calculate dilution for each holder
    const postMoneyCapTable = currentHoldings.map(holding => {
      const impact = this.calculateDilutionImpact(
        holding.shares,
        preMoneyShares,
        newShares
      );
      
      return {
        ...holding,
        ...impact,
        postMoneyShares: holding.shares, // Shares don't change, only percentage
        postMoneyPercent: impact.postMoneyPercent
      };
    });

    // Add new investor
    const investorPercent = this.calculateOwnershipPercentage(newShares, postMoneyShares);
    postMoneyCapTable.push({
      holderName: newInvestment.investorName || 'New Investor',
      shares: newShares,
      type: 'investor',
      preMoneyPercent: 0,
      postMoneyPercent: investorPercent,
      dilution: 0,
      isNew: true
    });

    // Add option pool if included
    if (includeOptionPool && optionPoolSize > 0) {
      const poolPercent = this.calculateOwnershipPercentage(optionPoolSize, postMoneyShares);
      postMoneyCapTable.push({
        holderName: 'Option Pool',
        shares: optionPoolSize,
        type: 'option_pool',
        preMoneyPercent: this.calculateOwnershipPercentage(optionPoolSize, preMoneyShares),
        postMoneyPercent: poolPercent,
        dilution: 0
      });
    }

    return {
      preMoney: {
        totalShares: preMoneyShares,
        valuation: newInvestment.preMoneyValuation || null
      },
      newInvestment: {
        shares: newShares,
        amount: newInvestment.amount || null,
        pricePerShare: newInvestment.amount ? newInvestment.amount / newShares : null,
        ownershipPercent: investorPercent
      },
      postMoney: {
        totalShares: postMoneyShares,
        valuation: newInvestment.postMoneyValuation || (newInvestment.preMoneyValuation ? newInvestment.preMoneyValuation + (newInvestment.amount || 0) : null)
      },
      capTable: postMoneyCapTable,
      dilutionSummary: this.calculateDilutionSummary(currentHoldings, postMoneyCapTable)
    };
  }

  /**
   * Calculate dilution summary
   */
  calculateDilutionSummary(preMoneyHoldings, postMoneyCapTable) {
    const summary = {
      totalDilution: 0,
      byType: {},
      byHolder: {}
    };

    preMoneyHoldings.forEach(holding => {
      const postMoney = postMoneyCapTable.find(h => 
        h.holderName === holding.holderName || h.holderId?.toString() === holding.holderId?.toString()
      );
      
      if (postMoney) {
        const dilution = (holding.ownershipPercent || 0) - (postMoney.postMoneyPercent || 0);
        summary.byHolder[holding.holderName || 'Unknown'] = {
          preMoneyPercent: holding.ownershipPercent || 0,
          postMoneyPercent: postMoney.postMoneyPercent || 0,
          dilution: this.roundToPrecision(dilution, 2)
        };
      }
    });

    return summary;
  }

  /**
   * Calculate convertible instrument conversion
   * 
   * @param {Object} instrument - Convertible instrument
   * @param {Number} companyValuation - Company valuation for conversion
   * @returns {Object} Conversion details
   */
  calculateConvertibleConversion(instrument, companyValuation) {
    const { principalAmount, valuationCap, discountRate, interestRate, issueDate } = instrument;
    
    // Calculate accrued interest
    const yearsSinceIssue = (new Date() - new Date(issueDate)) / (365 * 24 * 60 * 60 * 1000);
    const accruedInterest = principalAmount * (interestRate / 100) * yearsSinceIssue;
    const totalPrincipal = principalAmount + accruedInterest;

    // Apply discount if applicable
    let conversionPrice = companyValuation;
    if (discountRate && discountRate > 0) {
      conversionPrice = companyValuation * (1 - discountRate / 100);
    }

    // Apply valuation cap
    if (valuationCap && conversionPrice > valuationCap) {
      conversionPrice = valuationCap;
    }

    // Calculate shares (simplified - assumes share price based on valuation)
    // In reality, this depends on the number of shares outstanding
    const shares = totalPrincipal / (conversionPrice / 1000000); // Assuming 1M shares = valuation

    return {
      principalAmount,
      accruedInterest: this.roundToPrecision(accruedInterest, 2),
      totalPrincipal: this.roundToPrecision(totalPrincipal, 2),
      conversionPrice: this.roundToPrecision(conversionPrice, 2),
      shares: Math.floor(shares),
      discountApplied: discountRate > 0,
      capApplied: valuationCap && conversionPrice >= valuationCap
    };
  }

  /**
   * Calculate liquidation waterfall
   * 
   * @param {Array} shareClasses - Share classes with liquidation preferences
   * @param {Number} exitProceeds - Total exit proceeds
   * @returns {Object} Liquidation distribution
   */
  calculateLiquidationWaterfall(shareClasses, exitProceeds) {
    // Sort by liquidation preference (highest first)
    const sorted = [...shareClasses].sort((a, b) => 
      (b.liquidationPreference || 1) - (a.liquidationPreference || 1)
    );

    let remaining = exitProceeds;
    const distribution = [];

    // Distribute based on liquidation preference
    sorted.forEach(shareClass => {
      const preference = shareClass.liquidationPreference || 1;
      const shares = shareClass.shares || 0;
      const preferredAmount = shares * preference; // Simplified

      if (remaining > 0) {
        const payout = Math.min(preferredAmount, remaining);
        remaining -= payout;
        
        distribution.push({
          shareClass: shareClass.name,
          shares,
          liquidationPreference: preference,
          payout: this.roundToPrecision(payout, 2),
          percent: this.roundToPrecision((payout / exitProceeds) * 100, 2)
        });
      }
    });

    return {
      exitProceeds,
      distribution,
      remaining: this.roundToPrecision(remaining, 2),
      totalDistributed: this.roundToPrecision(exitProceeds - remaining, 2)
    };
  }

  // Helper methods

  roundToPrecision(value, precision = 2) {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  monthsBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const years = d2.getFullYear() - d1.getFullYear();
    const months = d2.getMonth() - d1.getMonth();
    return years * 12 + months;
  }

  calculateNextVestDate(vestingSchedule, asOfDate = new Date()) {
    const { grantDate, vestingType, vestingMonths, customVestingDates } = vestingSchedule;
    const grant = new Date(grantDate);
    const today = new Date(asOfDate);

    if (vestingType === 'custom' && customVestingDates.length > 0) {
      const next = customVestingDates.find(v => new Date(v.date) > today);
      return next ? new Date(next.date) : null;
    }

    // For linear vesting, next vest is next month
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  }

  /**
   * Validate cap table calculations (sanity check)
   * Ensures all ownership percentages sum to ~100%
   * 
   * @param {Array} capTable - Cap table with ownership percentages
   * @returns {Object} Validation result
   */
  validateCapTable(capTable) {
    const totalPercent = capTable.reduce((sum, holder) => 
      sum + (holder.ownershipPercent || 0), 0
    );
    
    const totalShares = capTable.reduce((sum, holder) => 
      sum + (holder.shares || 0), 0
    );

    const isValid = Math.abs(totalPercent - 100) < 0.01; // Allow 0.01% rounding error

    return {
      isValid,
      totalPercent: this.roundToPrecision(totalPercent, 2),
      totalShares,
      error: isValid ? null : `Ownership percentages sum to ${totalPercent}%, expected 100%`,
      holders: capTable.length
    };
  }
}

module.exports = new EquityCalculationService();


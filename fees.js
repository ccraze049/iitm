// IIT Madras Fee Structure Data
const feesData = {
  // Undergraduate Fees (B.Tech)
  btech: {
    courseName: "B.Tech",
    duration: "4 years",
    fees: {
      tuitionFee: {
        general: 200000, // per year
        obc: 200000,
        scSt: 0,
        economicallyWeaker: 0
      },
      otherFees: {
        admission: 25000,
        caution: 5000,
        medical: 300,
        students_activity: 2000,
        games: 2000,
        institute_deposit: 5000
      },
      totalFirstYear: {
        general: 239300,
        obc: 239300,
        scSt: 39300,
        economicallyWeaker: 39300
      }
    }
  },

  // Postgraduate Fees (M.Tech)
  mtech: {
    courseName: "M.Tech",
    duration: "2 years",
    fees: {
      tuitionFee: {
        general: 62500, // per semester
        obc: 62500,
        scSt: 0,
        economicallyWeaker: 0
      },
      otherFees: {
        admission: 25000,
        caution: 10000,
        medical: 300,
        students_activity: 1000,
        games: 1000,
        institute_deposit: 5000
      },
      totalFirstSemester: {
        general: 104800,
        obc: 104800,
        scSt: 42300,
        economicallyWeaker: 42300
      }
    }
  },

  // MBA Fees
  mba: {
    courseName: "MBA",
    duration: "2 years",
    fees: {
      tuitionFee: {
        general: 550000, // total program fee
        obc: 550000,
        scSt: 275000,
        economicallyWeaker: 275000
      },
      otherFees: {
        admission: 50000,
        caution: 20000,
        medical: 500,
        students_activity: 3000
      }
    }
  },

  // PhD Fees
  phd: {
    courseName: "PhD",
    duration: "Variable (3-7 years)",
    fees: {
      tuitionFee: {
        general: 25000, // per semester
        obc: 25000,
        scSt: 0,
        economicallyWeaker: 0
      },
      fellowship: {
        junior: 31000, // per month for first 2 years
        senior: 35000  // per month after 2 years
      }
    }
  },

  // Online BS Degree (Programming and Data Science)
  onlineBs: {
    courseName: "Online BS in Programming and Data Science",
    duration: "4 years (8 semesters)",
    fees: {
      tuitionFee: {
        general: 25000, // per semester
        obc: 25000,
        scSt: 12500, // 50% concession
        economicallyWeaker: 12500,
        belowPovertyLine: 0
      },
      additionalFees: {
        registration: 1000, // one time
        examFee: 2000, // per semester
        certificateFee: 1000 // at completion
      },
      totalPerSemester: {
        general: 28000,
        obc: 28000,
        scSt: 15500,
        economicallyWeaker: 15500,
        belowPovertyLine: 3000
      },
      totalProgram: {
        general: 224000, // 8 semesters
        obc: 224000,
        scSt: 124000,
        economicallyWeaker: 124000,
        belowPovertyLine: 24000
      }
    },
    scholarships: [
      "Merit-based fee waiver for top performers",
      "Income-based concessions available",
      "Special provisions for SC/ST/PwD candidates"
    ]
  },

  // Hostel and Mess Fees
  hostelMess: {
    hostel: {
      single: 18000, // per semester
      double: 12000  // per semester
    },
    mess: {
      vegetarian: 45000, // per year
      nonVegetarian: 50000 // per year
    },
    electricity: 2000, // per semester (approx)
    water: 500 // per semester
  },

  // International Student Fees (USD)
  international: {
    btech: {
      tuitionFee: 8000, // per year in USD
      otherFees: 2000
    },
    mtech: {
      tuitionFee: 5000, // per year in USD
      otherFees: 1500
    }
  },

  // Additional Information
  feeStructureInfo: {
    paymentModes: ["Online", "Demand Draft", "Bank Transfer"],
    installments: "Fees can be paid in 2 installments per year",
    scholarships: [
      "Merit-cum-Need Scholarship",
      "MCM Scholarship", 
      "Inspire Scholarship",
      "NSP Scholarships",
      "Institute Freeship"
    ],
    lastUpdated: "2024"
  }
};

module.exports = feesData;
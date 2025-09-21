const feesData = {

  // B.Tech / B.S. Fees (GEN/OBC/SC/ST/Int'l)
  btech: {
    courseName: "B.Tech / B.S.",
    duration: "4 years",
    fees: {
      tuitionFee: { general: 200000, obc: 200000, sc: 0, st: 0 },
      admissionFee: 3500,
      cautionDeposit: 2000,
      medicalExam: 300,
      instituteFee: 1500,
      studentWellness: 500,
      extracurricular: 2500,
      medicalInsurance: 2402,
      totalFirstYear: {
        general: 213702,
        obc: 213702,
        sc: 13602,
        st: 13602
      }
    }
  },

  // Dual Degree (GEN/OBC/SC/ST/Int'l)
  dualDegree: {
    courseName: "Dual Degree / IDDD",
    duration: "5 years",
    fees: {
      tuitionFee: { general: 200000, obc: 200000, sc: 0, st: 0 },
      admissionFee: 3500,
      cautionDeposit: 2000,
      medicalExam: 300,
      instituteFee: 1500,
      studentWellness: 500,
      extracurricular: 2500,
      medicalInsurance: 2402,
      totalFirstYear: {
        general: 213602,
        obc: 213602,
        sc: 13602,
        st: 13602
      }
    }
  },

  // M.Tech Fees (GEN/OBC/SC/ST/Int'l)
  mtech: {
    courseName: "M.Tech",
    duration: "2 years",
    fees: {
      tuitionFee: { general: 25000, obc: 25000, sc: 0, st: 0 },
      admissionFee: 1500,
      cautionDeposit: 2000,
      medicalExam: 300,
      instituteFee: 1500,
      studentWellness: 500,
      extracurricular: 1500,
      medicalInsurance: 2402,
      totalFirstSemester: {
        general: 34402,
        obc: 34402,
        sc: 9402,
        st: 9402
      }
    }
  },

  // M.A. Fees (GEN/OBC/SC/ST/Int'l)
  ma: {
    courseName: "M.A.",
    duration: "2 years",
    fees: {
      tuitionFee: { general: 25000, obc: 25000, sc: 0, st: 0 },
      admissionFee: 1500,
      cautionDeposit: 2000,
      medicalExam: 300,
      instituteFee: 1500,
      studentWellness: 500,
      extracurricular: 1500,
      medicalInsurance: 2402,
      totalFirstSemester: {
        general: 34402,
        obc: 34402,
        sc: 9402,
        st: 9402
      }
    }
  },

  // MBA (GEN/OBC/SC/ST/Int'l)
  mba: {
    courseName: "MBA",
    duration: "2 years",
    fees: {
      tuitionFee: {
        "2023": { general: 350000, obc: 350000, sc: 0, st: 0 },
        "2024": { general: 400000, obc: 400000, sc: 0, st: 0 }
      },
      admissionFee: 10000,
      cautionDeposit: 10000,
      medicalExam: 300,
      instituteFee: 1000,
      studentWellness: 500,
      extracurricular: 1500,
      medicalInsurance: 2402,
      totalFirstSemester: {
        "2023": { general: 375702, obc: 375702, sc: 16602, st: 16602 },
        "2024": { general: 425702, obc: 425702, sc: 16602, st: 16602 }
      }
    }
  },

  // Executive MBA
  emba: {
    courseName: "Executive MBA",
    duration: "2 years",
    fees: {
      tuitionFee: 1350000,
      developmentAcademics: 25000,
      totalProgram: 1375000
    }
  },

  // PhD Fees
  phd: {
    courseName: "Ph.D.",
    duration: "3-7 years",
    fees: {
      tuitionFee: { general: 5000, obc: 5000, sc: 0, st: 0 },
      admissionFee: 1500,
      cautionDeposit: 2000,
      medicalExam: 300,
      instituteFee: 1500,
      studentWellness: 500,
      extracurricular: 1500,
      medicalInsurance: 2402,
      totalFirstSemester: {
        general: 12602,
        obc: 12602,
        sc: 7602,
        st: 7602
      }
    }
  },

  // BS Degree with Application Fee (GEN/OBC/SC/ST/EWS/PwD)
  bsDegree: {
    courseName: "BS in Data Science and Programming",
    duration: "4 years",
    fees: {
      tuitionFee: {
        general: 25000,
        obc: 25000,
        sc: 12500,
        st: 12500,
        ews: 12500,
        bpl: 0
      },
      additionalFees: {
        registration: 1000,    // one time
        examFee: 2000,         // per semester
        certificateFee: 1000   // once at completion
      },
      totalPerSemester: {
        general: 28000,
        obc: 28000,
        sc: 15500,
        st: 15500,
        ews: 15500,
        bpl: 3000
      },
      totalProgram: {
        general: 224000,
        obc: 224000,
        sc: 124000,
        st: 124000,
        ews: 124000,
        bpl: 24000
      },
      applicationFee: {
        general: 3000,
        obc: 3000,
        sc: 1500,
        st: 1500,
        pwd: 1500,
        scpwd: 750,
        stpwd: 750
      }
    },
    scholarships: [
      "Merit-based fee waiver for top performers",
      "Income-based concessions available",
      "Special provisions for SC/ST/PwD candidates"
    ]
  },

  // Hostel/Mess Fees
  hostelMess: {
    hostel: { single: 18000, double: 12000 },
    mess: { veg: 25000, nonVeg: 28000 },
    electricity: 1400,
    water: 500
  },

  // International Students
  international: {
    btech: { tuitionFee: 8000, otherFees: 2000 },
    mtech: { tuitionFee: 5000, otherFees: 1500 }
  },

  // General notes
  feeStructureInfo: {
    paymentModes: ["Online", "Demand Draft", "Bank Transfer"],
    installments: "Semester-wise payments",
    scholarships: [
      "Merit-cum-Need Scholarship",
      "MCM Scholarship",
      "Institute Freeship",
      "SC/ST/OBC/EWS waivers"
    ],
    lastUpdated: "July–Nov 2025",
    remarks: [
      "Tuition Fee waiver for SC/ST/EWS/BPL.",
      "Hostel/Mess fees separate as per hostel circular."
    ]
  }
};

module.exports = feesData;

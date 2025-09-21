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
    session: "2024-25",
    fees: {
      instituteFees: {
        oneTime: {
          admissionFee: 3000,
          studentWelfareFund: 1500,
          careerPathwayCharges: 5000,
          alumniServicesFee: 6000,
          total: 16000
        },
        semester: {
          tuitionFee: 25000,
          enrolmentFee: 1500,
          medicalFee: 1500,
          seatRent: 7500,
          utilityCharges: 1500, // Hostellers only
          total: 40500
        },
        deposits: {
          instituteDeposit: 2500,
          libraryDeposit: 2500,
          total: 5000
        },
        // Total Payable (A+B+C)
        totalPayable: {
          hosteller: {
            gen_obc_ews: 61500,
            sc_st_pwd: 36500
          },
          dayScholar: {
            gen_obc_ews: 56500,
            sc_st_pwd: 31500
          }
        }
      }
    },
    hostelMess: {
      perSemester: {
        itemized: {
          hostelAdmissionFee: 500,
          advanceDiningCharges: 17766,
          foodWasteDisposal: 2500,
          establishmentA: 7500,
          establishmentB: 1500,
          roWater: 500,
          extraCurricular: 300,
          studentWellness: 500,
          medicalInsurance: 2301,
          hostelRefundableDeposit: 1500 // one-time
        },
        hostellerTotal: 37817,
        dayScholarTotal: 4801
      }
    },
    notes: [
      "Hosteller & day scholar totals: (One Time Fees + Semester Fees + Deposits).",
      "Hostel/Mess breakup: admission, mess advance, establishment/water/medical/wellness/insurance etc.",
      "Optional festival/club fees (~Rs.7500) extra for Saarang/Shastra/E-Summit.",
      "SC/ST/PwD students को tuition waiver, except Rs.50,000/yr if sponsored.",
      "Advance dining/medical insurance subject to change every year."
    ]
 },

  
  // IIT Madras MA Fees Structure (for Indian Students) - 2024-25
ma: {
    courseName: "M.A.",
    duration: "2 years",
    session: "2024-25",
    fees: {
      // A. One Time Fees
      oneTime: {
        admissionFee: 3000,
        studentWelfareFund: 1500,
        careerPathwayCharges: 5000,
        alumniServicesFee: 6000,
        total: 16000
      },
      // B. Semester Fees
      semester: {
        tuitionFee: 20000,
        enrolmentFee: 1500,
        medicalFee: 1500,
        seatRent: 7500,
        utilityCharges: 1500, // Hostellers only
        total: 35500
      },
      // C. Deposits (one-time, refundable)
      deposits: {
        instituteDeposit: 2500,
        libraryDeposit: 2500,
        total: 5000
      },
      // D. Total Payable (category wise), including A+B+C, semester 1
      totalPayable: {
        hosteller: {
          gen_obc_ews: 56500,
          sc_st_pwd: 36500
        },
        dayScholar: {
          gen_obc_ews: 51500,
          sc_st_pwd: 31500
        }
      }
    },
    hostelMess: {
      perSemester: {
        hosteller: 37817,
        dayScholar: 4801
      }
    },
    notes: [
      "Semester/hostel totals are for Sem 1; utility and seat rent for hostellers only.",
      "Hostel/mess structure: admission (500), mess advance (17766), food disposal (2500), establishment/water/medical/wellness (etc).",
      "Optional festival fees ~7500 extra (Saarang/Shastra/E-Summit)."
    ]
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

  // BS Degree (Official 2025) + Category-wise Application Fee + Milestone-wise Credits/Fee
  bsDegree: {
    courseName: "BS in Data Science and Applications",
    duration: "Approx. 4 years (progression as per credits)",
    structure: [
      { level: "Foundation Only", credits: 32, feesINR: 32000 },
      { level: "Foundation + One Diploma", credits: 59, feesINR: 94500 },
      { level: "Foundation + 2 Diploma", credits: 86, feesINR: 157000 },
      { level: "BSc", credits: 114, feesINR: 227000 },
      { level: "BS", credits: 142, feesINR: 367000 }
    ],
    applicationFee: {
      general: 3000,
      obc: 3000,
      sc: 1500,
      st: 1500,
      pwd: 1500,
      scpwd: 750,
      stpwd: 750
    },
    notes: [
      "Fees and milestones as per IITM BS Degree official notification dated 26-05-2025.",
      "Credits correspond to each exit/award point: Foundation, Diploma, BSc, BS.",
      "Application fee is paid once, as per relevant category."
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

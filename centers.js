// IIT Madras Centers and Locations Data
const centersData = {
  // Main Campus
  mainCampus: {
    name: "IIT Madras Main Campus",
    location: "Chennai, Tamil Nadu",
    address: "Indian Institute of Technology Madras, Chennai - 600036, Tamil Nadu, India",
    area: "617 acres",
    establishedYear: 1959,
    departments: [
      "Aerospace Engineering",
      "Applied Mechanics",
      "Biotechnology", 
      "Chemical Engineering",
      "Chemistry",
      "Civil Engineering",
      "Computer Science and Engineering",
      "Electrical Engineering",
      "Engineering Design",
      "Humanities and Social Sciences",
      "Management Studies",
      "Mathematics",
      "Mechanical Engineering",
      "Metallurgical and Materials Engineering",
      "Naval Architecture and Ocean Engineering",
      "Physics"
    ],
    facilities: [
      "Central Library",
      "Computer Center", 
      "Student Activity Center",
      "Sports Complex",
      "Health Center",
      "Guest House",
      "Shopping Complex"
    ]
  },

  // Research Parks
  researchParks: {
    iitmrp: {
      name: "IIT Madras Research Park",
      location: "Chennai, Tamil Nadu",
      address: "32, Kanagam Road, Tharamani, Chennai - 600113",
      area: "1.2 million sq ft",
      establishedYear: 2006,
      focus: [
        "Technology Incubation",
        "R&D Collaboration", 
        "Industry Partnership",
        "Startups"
      ],
      companies: "200+ companies",
      sectors: [
        "Information Technology",
        "Biotechnology",
        "Automotive",
        "Aerospace",
        "Clean Technology"
      ]
    }
  },

  // Extension Centers
  extensionCenters: {
    hyderabad: {
      name: "IIT Madras Hyderabad Center",
      location: "Hyderabad, Telangana", 
      establishedYear: 2015,
      programs: [
        "Executive Education",
        "Research Collaboration",
        "Industrial Consulting"
      ]
    },
    bangalore: {
      name: "IIT Madras Bangalore Extension",
      location: "Bangalore, Karnataka",
      focus: [
        "Industry Relations",
        "Alumni Network",
        "Corporate Training"
      ]
    }
  },

  // International Campus
  international: {
    srilanka: {
      name: "IIT Madras Pravartak Technologies Foundation",
      location: "Kandy, Sri Lanka",
      establishedYear: 2019,
      programs: [
        "B.S. in Data Science and Applications",
        "Research Collaboration"
      ],
      partnership: "Government of Sri Lanka"
    }
  },

  // Satellite Centers
  satelliteCenters: {
    discovery: {
      name: "IIT Madras Discovery",
      location: "Chennai",
      purpose: "Innovation and Incubation Hub",
      focus: [
        "Student Innovation",
        "Faculty Research",
        "Industry Collaboration"
      ]
    },
    ceesat: {
      name: "Centre of Excellence in Environmental Science and Technology",
      location: "IIT Madras Campus",
      focus: [
        "Environmental Research",
        "Water Treatment",
        "Waste Management",
        "Renewable Energy"
      ]
    }
  },

  // Department Locations within Campus
  departmentLocations: {
    cse: {
      department: "Computer Science and Engineering", 
      building: "CSE Building",
      block: "V Block"
    },
    mechanical: {
      department: "Mechanical Engineering",
      building: "IC&SR Building",
      block: "IC&SR"
    },
    electrical: {
      department: "Electrical Engineering", 
      building: "EE Building",
      block: "EE Block"
    },
    civil: {
      department: "Civil Engineering",
      building: "Civil Engineering Building",
      block: "CE Block"
    },
    chemistry: {
      department: "Chemistry",
      building: "Chemistry Building", 
      block: "CY Block"
    }
  },

  // Hostels
  hostels: {
    undergraduate: [
      "Ganga Hostel",
      "Jamuna Hostel", 
      "Saraswathi Hostel",
      "Narmada Hostel",
      "Godavari Hostel",
      "Krishna Hostel",
      "Cauvery Hostel",
      "Tapti Hostel",
      "Mandakini Hostel",
      "Brahmaputra Hostel"
    ],
    postgraduate: [
      "Sharavathi Hostel",
      "Tunga Hostel",
      "Alaknanda Hostel",
      "Sabarmati Hostel"
    ],
    faculty: [
      "Himalaya Apartments",
      "Vindhya Apartments",
      "Nilgiri Apartments"
    ]
  },

  // Transportation
  transportation: {
    busRoutes: [
      "Adyar - IIT Madras",
      "T.Nagar - IIT Madras", 
      "Central Station - IIT Madras",
      "Airport - IIT Madras"
    ],
    nearestMetro: "Guindy Metro Station (6 km)",
    nearestRailway: "Guindy Railway Station (6 km)",
    nearestAirport: "Chennai International Airport (12 km)"
  },

  // Contact Information
  contactInfo: {
    mainOffice: {
      phone: "+91-44-2257-4000",
      email: "office@iitm.ac.in",
      website: "https://www.iitm.ac.in"
    },
    admissions: {
      phone: "+91-44-2257-4137",
      email: "admission@iitm.ac.in"
    },
    researchPark: {
      phone: "+91-44-6693-3000",
      email: "info@iitmrp.res.in",
      website: "https://www.iitmrp.res.in"
    }
  }
};

module.exports = centersData;
export const INITIAL_ISSUES = [
  {
    id: "issue-1",
    title: "Massive pothole causing traffic bottlenecks",
    description: "A huge pothole has opened up right in the middle of the Inner Ring Road. Cars and motorbikes are forced to swerve dangerously to avoid it, causing major traffic jams during peak hours.",
    category: "Infrastructure",
    severity: "High",
    status: "escalated",
    location: {
      lat: 28.5730,
      lng: 77.2070,
      address: "Inner Ring Road, near Safdarjung Flyover, New Delhi"
    },
    reportedBy: "Aarav Mehta",
    reportedAt: "2026-06-25T08:30:00Z",
    upvotes: 18,
    verifications: 14,
    verifiedBy: ["user-2", "user-3", "user-4"],
    comments: [
      {
        id: "c1",
        user: "Neha Sharma",
        text: "I almost lost balance on my scooter here yesterday! Very dangerous.",
        timestamp: "2026-06-25T09:15:00Z"
      },
      {
        id: "c2",
        user: "Municipal Corporation Support",
        text: "Issue registered. Assigned Ticket ID #MC-INF-482.",
        timestamp: "2026-06-26T11:00:00Z",
        isSystem: true
      }
    ],
    mediaUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    escalationInfo: {
      agency: "Public Works Department (PWD)",
      escalatedAt: "2026-06-26T11:00:00Z",
      ticketId: "CH-INF-001"
    }
  },
  {
    id: "issue-2",
    title: "Sewage overflow and flooding on main road",
    description: "The main sewer line has ruptured, leading to highly unsanitary conditions. Dirty water has filled the entire lane, making it impossible for pedestrians to walk and posing a severe health hazard.",
    category: "Sanitation",
    severity: "Critical",
    status: "in-progress",
    location: {
      lat: 28.6150,
      lng: 77.2200,
      address: "Lane 3, near Mandi House Metro Gate 2, New Delhi"
    },
    reportedBy: "Priya Das",
    reportedAt: "2026-06-27T07:15:00Z",
    upvotes: 32,
    verifications: 28,
    verifiedBy: ["user-1", "user-3", "user-5"],
    comments: [
      {
        id: "c3",
        user: "Rohan Gupta",
        text: "The smell is unbearable. Shops around this street have closed.",
        timestamp: "2026-06-27T08:00:00Z"
      },
      {
        id: "c4",
        user: "Delhi Jal Board Support",
        text: "Maintenance crew dispatched. Pump operations underway.",
        timestamp: "2026-06-27T14:30:00Z",
        isSystem: true
      }
    ],
    mediaUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    escalationInfo: {
      agency: "Delhi Jal Board (DJB)",
      escalatedAt: "2026-06-27T10:00:00Z",
      ticketId: "CH-SAN-002"
    }
  },
  {
    id: "issue-3",
    title: "Broken streetlights making lane unsafe at night",
    description: "Over 5 streetlights in a row are completely dead. The lane is pitch black after 7 PM, creating safety concerns for women and elderly residents walking back from the market.",
    category: "Safety",
    severity: "Medium",
    status: "verified",
    location: {
      lat: 28.5650,
      lng: 77.1750,
      address: "Sector 4 Outer Lane, RK Puram, New Delhi"
    },
    reportedBy: "Vikram Malhotra",
    reportedAt: "2026-06-26T18:40:00Z",
    upvotes: 9,
    verifications: 7,
    verifiedBy: ["user-2", "user-6"],
    comments: [
      {
        id: "c5",
        user: "Kiran Goel",
        text: "We need this fixed immediately. Dark spots have led to chain-snatching incidents nearby in the past.",
        timestamp: "2026-06-26T20:10:00Z"
      }
    ],
    mediaUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    escalationInfo: null
  },
  {
    id: "issue-4",
    title: "Major traffic signal failure at main junction",
    description: "The traffic signals at Connaught Place Outer Circle / Barakhamba intersection are flashing amber on all sides. Heavy traffic congestion and minor collisions are occurring due to lack of coordination.",
    category: "Traffic",
    severity: "High",
    status: "reported",
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: "Barakhamba Road Crossing, Connaught Place, New Delhi"
    },
    reportedBy: "Kabir Singh",
    reportedAt: "2026-06-28T09:00:00Z",
    upvotes: 4,
    verifications: 2,
    verifiedBy: ["user-4"],
    comments: [
      {
        id: "c6",
        user: "Amit Verma",
        text: "Traffic police is currently trying to manage it manually, but it's pure chaos.",
        timestamp: "2026-06-28T09:30:00Z"
      }
    ],
    mediaUrl: null,
    mediaType: null,
    escalationInfo: null
  },
  {
    id: "issue-5",
    title: "Exposed high-voltage electrical wires near park entry",
    description: "An electrical junction box is lying open with live wires hanging outside, right next to the children's park entrance. During the monsoon season, this is an extremely hazardous situation.",
    category: "Hazard",
    severity: "Critical",
    status: "reported",
    location: {
      lat: 28.5900,
      lng: 77.2400,
      address: "Nizamuddin East Public Park Gate, New Delhi"
    },
    reportedBy: "Ananya Sen",
    reportedAt: "2026-06-28T10:15:00Z",
    upvotes: 12,
    verifications: 9,
    verifiedBy: ["user-1", "user-2"],
    comments: [],
    mediaUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    escalationInfo: null
  }
];

export const INITIAL_USER = {
  name: "Kartik Sharma",
  email: "kartik.sharma@communityhero.in",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
  level: 3,
  points: 340,
  reportedCount: 4,
  verifiedCount: 16,
  badges: [
    {
      id: "b1",
      name: "First Responder",
      description: "Reported your first community issue",
      icon: "ShieldAlert",
      color: "#06b6d4"
    },
    {
      id: "b2",
      name: "Community Pillar",
      description: "Earned 15+ verifications from other users",
      icon: "Award",
      color: "#8b5cf6"
    },
    {
      id: "b3",
      name: "Sanitation Sentinel",
      description: "Reported and helped resolve a sanitation issue",
      icon: "Droplets",
      color: "#3b82f6"
    }
  ],
  allBadges: [
    {
      id: "b1",
      name: "First Responder",
      description: "Reported your first community issue",
      icon: "ShieldAlert",
      color: "#06b6d4",
      earned: true
    },
    {
      id: "b2",
      name: "Community Pillar",
      description: "Earned 15+ verifications from other users",
      icon: "Award",
      color: "#8b5cf6",
      earned: true
    },
    {
      id: "b3",
      name: "Sanitation Sentinel",
      description: "Reported and helped resolve a sanitation issue",
      icon: "Droplets",
      color: "#3b82f6",
      earned: true
    },
    {
      id: "b4",
      name: "Civic Mentor",
      description: "Contributed 10+ constructive comments on issue details",
      icon: "MessageSquareCode",
      color: "#10b981",
      earned: false
    },
    {
      id: "b5",
      name: "Infrastructure Inspector",
      description: "Reported 5+ verified infrastructure issues",
      icon: "Wrench",
      color: "#f59e0b",
      earned: false
    }
  ],
  history: [
    { id: "h1", type: "report", text: "Reported 'Exposed high-voltage electrical wires'", date: "2026-06-28T10:15:00Z", points: 50 },
    { id: "h2", type: "verify", text: "Verified 'Sewage overflow and flooding on main road'", date: "2026-06-27T08:30:00Z", points: 10 },
    { id: "h3", type: "comment", text: "Commented on 'Broken streetlights making lane unsafe'", date: "2026-06-26T20:15:00Z", points: 5 },
    { id: "h4", type: "resolve", text: "Helped resolve 'Illegal garbage dumping site'", date: "2026-06-24T15:00:00Z", points: 100 }
  ]
};

// LocalStorage helpers
export const getStoredIssues = () => {
  const data = localStorage.getItem("community_hero_issues");
  if (!data) {
    localStorage.setItem("community_hero_issues", JSON.stringify(INITIAL_ISSUES));
    return INITIAL_ISSUES;
  }
  return JSON.parse(data);
};

export const saveStoredIssues = (issues) => {
  localStorage.setItem("community_hero_issues", JSON.stringify(issues));
};

export const getStoredUser = () => {
  const data = localStorage.getItem("community_hero_user");
  if (!data) {
    localStorage.setItem("community_hero_user", JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  }
  return JSON.parse(data);
};

export const saveStoredUser = (user) => {
  localStorage.setItem("community_hero_user", JSON.stringify(user));
};

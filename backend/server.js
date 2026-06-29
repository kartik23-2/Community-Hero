import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const API = import.meta.env.VITE_API_URL;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://community-hero-1-w0bq.onrender.com"
  ],
  credentials: true
}));app.use(express.json());

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const reportsDir = path.join(__dirname, 'reports');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database File Helper
const dbPath = path.join(__dirname, 'db.json');

const INITIAL_ISSUES = [
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
  }
];

const readDB = () => {
  if (!fs.existsSync(dbPath)) {
    const defaultData = { users: [], issues: INITIAL_ISSUES };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid' });
    req.user = decoded;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please specify name, email, and password.' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      passwordHash,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 10000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      level: 1,
      points: 0,
      reportedCount: 0,
      verifiedCount: 0,
      badges: [],
      history: []
    };

    db.users.push(newUser);
    writeDB(db);

    // Generate Token
    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Exclude password hash from response
    const { passwordHash: _, ...userWithoutHash } = newUser;
    res.json({ token, user: userWithoutHash });
  } catch (err) {
    console.error('Register route error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please specify email and password.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    const { passwordHash: _, ...userWithoutHash } = user;
    res.json({ token, user: userWithoutHash });
  } catch (err) {
    console.error('Login route error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User profile not found.' });

  const { passwordHash: _, ...userWithoutHash } = user;
  res.json(userWithoutHash);
});


// --- CIVIC ISSUES ROUTES ---

app.get('/api/issues', (req, res) => {
  const db = readDB();
  res.json(db.issues);
});

app.post('/api/issues', authenticateToken, upload.single('media'), (req, res) => {
  const { title, description, category, severity, lat, lng, address } = req.body;

  if (!title || !description || !category || !severity || !lat || !lng || !address) {
    return res.status(400).json({ error: 'Missing reporting details.' });
  }

  const db = readDB();
  const newIssueId = `issue-${Date.now()}`;
  
  // Set real static uploads file url if file is sent
  const mediaUrl = req.file 
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80';

  const newIssue = {
    id: newIssueId,
    title,
    description,
    category,
    severity,
    status: 'reported',
    location: {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address
    },
    reportedBy: req.user.name,
    reportedAt: new Date().toISOString(),
    upvotes: 0,
    verifications: 0,
    verifiedBy: [],
    comments: [],
    mediaUrl,
    mediaType: req.file ? 'image' : 'default',
    escalationInfo: null
  };

  db.issues.unshift(newIssue);

  // Update user points +50 XP
  const dbUser = db.users.find(u => u.id === req.user.id);
  if (dbUser) {
    dbUser.points += 50;
    dbUser.reportedCount += 1;
    
    // Level calculation (points / 500)
    dbUser.level = Math.floor(dbUser.points / 500) + 1;

    // Badges Check: Check if First Responder earned
    const firstResponderBadge = {
      id: "b1",
      name: "First Responder",
      description: "Reported your first community issue",
      icon: "ShieldAlert",
      color: "#06b6d4"
    };

    if (!dbUser.badges.some(b => b.id === 'b1')) {
      dbUser.badges.push(firstResponderBadge);
    }

    dbUser.history.unshift({
      id: `h-${Date.now()}`,
      type: 'report',
      text: `Reported '${title}'`,
      date: new Date().toISOString(),
      points: 50
    });
  }

  writeDB(db);
  res.json({ issue: newIssue, points: 50 });
});

// Verification endpoint
app.post('/api/issues/:id/verify', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const issue = db.issues.find(i => i.id === id);

  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (issue.verifiedBy.includes(req.user.email)) {
    return res.status(400).json({ error: 'You have already verified this issue.' });
  }

  issue.verifiedBy.push(req.user.email);
  issue.verifications += 1;
  issue.upvotes += 1;

  // Auto transition from reported to verified if verifications >= 3
  if (issue.status === 'reported' && issue.verifications >= 3) {
    issue.status = 'verified';
    issue.comments.push({
      id: `c-sys-${Date.now()}`,
      user: 'Community Hero Bot',
      text: 'Community Verified: This issue has received 3 independent user verifications. It is now qualified for official authority escalation.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });
  }

  // Award verify points to voter +10 XP
  const dbUser = db.users.find(u => u.id === req.user.id);
  if (dbUser) {
    dbUser.points += 10;
    dbUser.verifiedCount += 1;
    dbUser.level = Math.floor(dbUser.points / 500) + 1;
    dbUser.history.unshift({
      id: `h-${Date.now()}`,
      type: 'verify',
      text: `Verified issue: '${issue.title}'`,
      date: new Date().toISOString(),
      points: 10
    });
  }

  writeDB(db);
  res.json({ issue, points: 10 });
});

// Escalation endpoint
app.post('/api/issues/:id/escalate', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const issue = db.issues.find(i => i.id === id);

  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  // Map category to official agencies
  let agency = "Municipal Corporation";
  let targetEmail = "grievance@municipalcorp.gov.in";
  if (issue.category === 'Infrastructure') {
    agency = "Public Works Department (PWD)";
    targetEmail = "potholes.infras@pwd.gov.in";
  } else if (issue.category === 'Sanitation') {
    agency = "Municipal Solid Waste Management (MSWM)";
    targetEmail = "wasteops@sanitation.gov.in";
  } else if (issue.category === 'Safety') {
    agency = "Municipal Power Corporation & Police Division";
    targetEmail = "emergencylights@powercorp.gov.in";
  } else if (issue.category === 'Traffic') {
    agency = "City Traffic Command Division";
    targetEmail = "signalfixes@traffic.gov.in";
  } else if (issue.category === 'Hazard') {
    agency = "Fire & Disaster Response Services";
    targetEmail = "alert.disaster@disasterresponse.gov.in";
  }

  const ticketId = `CH-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString();

  // Create real local report files simulating email/API dispatch
  const reportContent = `
=========================================
OFFICIAL MUNICIPAL TICKET: ${ticketId}
Generated on: ${timestamp}
=========================================
ISSUE CATEGORY: ${issue.category}
SEVERITY LEVEL: ${issue.severity}
ISSUE HEADLINE: ${issue.title}

DESCRIPTION:
${issue.description}

LOCATION DATA:
Address: ${issue.location.address}
Latitude: ${issue.location.lat}
Longitude: ${issue.location.lng}

CITIZEN CONTACT:
Reporter Name: ${issue.reportedBy}
Verifying Citizens: ${issue.verifiedBy.join(', ')}

STATUS REPORT:
Escalated via Community Hero Platform.
=========================================
`;

  const reportFileName = `report_${ticketId}.txt`;
  fs.writeFileSync(path.join(reportsDir, reportFileName), reportContent);

  // Append entry to email transmission log file
  const emailLogEntry = `[${timestamp}] Sent dispatch email to ${targetEmail} regarding ticket #${ticketId} (Category: ${issue.category})\n`;
  fs.appendFileSync(path.join(reportsDir, 'sent_emails.log'), emailLogEntry);

  // Update issue details
  issue.status = 'escalated';
  issue.escalationInfo = {
    agency,
    escalatedAt: timestamp,
    ticketId
  };

  issue.comments.push({
    id: `c-sys-${Date.now()}`,
    user: `${agency} Support`,
    text: `Official Ticket Registered: Assigned reference ID #${ticketId}. Simulated municipal team scheduled for site dispatch. Action log generated at reports/${reportFileName}.`,
    timestamp,
    isSystem: true
  });

  // Award escalation points +20 XP to the triggerer
  const dbUser = db.users.find(u => u.id === req.user.id);
  if (dbUser) {
    dbUser.points += 20;
    dbUser.level = Math.floor(dbUser.points / 500) + 1;
    dbUser.history.unshift({
      id: `h-${Date.now()}`,
      type: 'verify',
      text: `Escalated '${issue.title}' to ${agency}`,
      date: timestamp,
      points: 20
    });
  }

  writeDB(db);
  res.json({ issue, points: 20 });
});

// Delete issue endpoint
app.delete('/api/issues/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const issueIndex = db.issues.findIndex(i => i.id === id);

  if (issueIndex === -1) return res.status(404).json({ error: 'Issue not found' });

  const issue = db.issues[issueIndex];
  // Verify that the requesting user is the reporter
  if (issue.reportedBy !== req.user.name) {
    return res.status(403).json({ error: 'Only the reporter can delete this issue' });
  }

  db.issues.splice(issueIndex, 1);
  writeDB(db);
  res.json({ message: 'Issue deleted successfully' });
});

// Resolve issue endpoint
app.post('/api/issues/:id/resolve', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const issue = db.issues.find(i => i.id === id);

  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.status = 'resolved';
  issue.comments.push({
    id: `c-sys-${Date.now()}`,
    user: "Community Hero Support",
    text: "Issue has been officially marked as RESOLVED. Thank you to the authorities and citizens!",
    timestamp: new Date().toISOString(),
    isSystem: true
  });

  // Award resolve points +100 XP
  const dbUser = db.users.find(u => u.id === req.user.id);
  if (dbUser) {
    dbUser.points += 100;
    dbUser.level = Math.floor(dbUser.points / 500) + 1;
    dbUser.history.unshift({
      id: `h-${Date.now()}`,
      type: 'resolve',
      text: `Helped mark '${issue.title}' as Resolved`,
      date: new Date().toISOString(),
      points: 100
    });
  }

  writeDB(db);
  res.json({ issue, points: 100 });
});

// Comment endpoint
app.post('/api/issues/:id/comments', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text missing' });

  const db = readDB();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const newComment = {
    id: `c-${Date.now()}`,
    user: req.user.name,
    text,
    timestamp: new Date().toISOString()
  };

  issue.comments.push(newComment);

  // Award comment points +5 XP
  const dbUser = db.users.find(u => u.id === req.user.id);
  if (dbUser) {
    dbUser.points += 5;
    dbUser.level = Math.floor(dbUser.points / 500) + 1;
    dbUser.history.unshift({
      id: `h-${Date.now()}`,
      type: 'comment',
      text: `Commented on '${issue.title}'`,
      date: new Date().toISOString(),
      points: 5
    });
  }

  writeDB(db);
  res.json({ comment: newComment, points: 5 });
});

// Start-fix endpoint (Authority support simulation)
app.post('/api/issues/:id/start-fix', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const issue = db.issues.find(i => i.id === id);

  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.status = 'in-progress';
  issue.comments.push({
    id: `c-sys-${Date.now()}`,
    user: 'Municipal Support',
    text: 'Repair operations started. Site workers dispatched.',
    timestamp: new Date().toISOString(),
    isSystem: true
  });

  writeDB(db);
  res.json(issue);
});

// Distance calculator helper (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // in meters
};

// GET /api/predictions - Dynamic spatial prediction engine
app.get('/api/predictions', (req, res) => {
  const db = readDB();
  const issues = db.issues.filter(i => i.status !== 'resolved');
  const predictions = [];

  // Spatial clustering logic: cluster unresolved reports within 300m having same category
  const checkedIds = new Set();

  issues.forEach((issue) => {
    if (checkedIds.has(issue.id)) return;

    const cluster = [issue];
    issues.forEach((other) => {
      if (issue.id === other.id || checkedIds.has(other.id)) return;

      if (issue.category === other.category) {
        const dist = getDistance(
          issue.location.lat, issue.location.lng,
          other.location.lat, other.location.lng
        );
        if (dist <= 300) {
          cluster.push(other);
        }
      }
    });

    if (cluster.length >= 2) {
      cluster.forEach(item => checkedIds.add(item.id));
      
      const firstAddress = issue.location.address.split(',')[0];
      let predictionText = '';
      let probability = '85% Probability';
      let timeframe = 'Within 7 days';
      let severity = 'High';

      switch (issue.category) {
        case 'Sanitation':
          predictionText = `Waterlogging & Sewer Backpressure Alert in ${firstAddress} vicinity: ${cluster.length} active sewage complaints in this sector indicate high risk of localized flooding during rainfall due to subterranean drain silting.`;
          severity = 'Critical';
          probability = '90% Probability';
          break;
        case 'Infrastructure':
          predictionText = `Pavement Subsidence & Cavity warning on ${firstAddress} crossing: ${cluster.length} active pothole reports suggest progressive base layer decay. Surface collapse likely under transit vehicle axle load.`;
          severity = 'High';
          break;
        case 'Safety':
          predictionText = `Crime/Dark-Spot vulnerability warning near ${firstAddress} lane: Repeated streetlight failures and dark alley reports indicate high risk of security incidents in the evening hours.`;
          severity = 'Medium';
          timeframe = 'Immediate Alert';
          break;
        case 'Traffic':
          predictionText = `Intersection Gridlock risk at ${firstAddress} junction: Malfunctioning traffic indicators coupled with secondary vehicle backups indicate recurring peak-hour bottlenecks.`;
          severity = 'Medium';
          break;
        case 'Hazard':
          predictionText = `Electrical Fire hazard zone in ${firstAddress}: Multiple open/dangling wire complaints near public areas suggest structural cable failures. High shock risk during monsoon wet spell.`;
          severity = 'Critical';
          probability = '95% Probability';
          break;
        default:
          predictionText = `Civic failure alert in ${firstAddress} sector based on ${cluster.length} nearby complaints of same category.`;
      }

      predictions.push({
        id: `pred-cluster-${issue.id}`,
        hazard: `${issue.category} Wear Warning`,
        location: `${firstAddress} Zone`,
        probability,
        timeframe,
        reason: predictionText,
        severity
      });
    }
  });

  // If no clusters exist, fall back to singular high-priority issue warnings
  if (predictions.length === 0) {
    issues.forEach(issue => {
      if (issue.severity === 'Critical' || issue.severity === 'High') {
        const addressShort = issue.location.address.split(',')[0];
        predictions.push({
          id: `pred-single-${issue.id}`,
          hazard: `Secondary ${issue.category} Decay`,
          location: `${addressShort} Area`,
          probability: '65% Probability',
          timeframe: 'Next 10 days',
          reason: `High risk of surrounding collateral degradation near the active ${issue.category} fault spot on ${addressShort}. Prompt resolution recommended.`,
          severity: issue.severity
        });
      }
    });
  }

  // Double fallback if there are absolutely no active issues at all in the database
  if (predictions.length === 0) {
    predictions.push({
      id: "pred-fallback-1",
      hazard: "Gutter Silt Degradation",
      location: "Sector 3 Main Lines",
      probability: "80% Probability",
      timeframe: "Monsoon Season",
      reason: "High risk of drainage overflow in Sector 3 based on historical summer municipal logs indicating lack of desilting work.",
      severity: "High"
    });
  }

  res.json(predictions.slice(0, 3));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

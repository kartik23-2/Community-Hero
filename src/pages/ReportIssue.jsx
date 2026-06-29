import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ShieldCheck, MapPin,
  Sparkles, AlertTriangle, AlertCircle, RefreshCw, Camera,
  CheckCircle2, Zap, Eye, ScanLine, Brain, Tag, BarChart3
} from 'lucide-react';
import MapSelector from '../components/MapSelector';
import { useAuth } from '../context/AuthContext';
import { API } from '../config';

/* ─── Haversine Distance ─────────────────────────────── */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLam = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ─── AI Vision Profiles ─────────────────────────────── */
const AI_VISION_PROFILES = [
  {
    keywords: /pothole|road|asphalt|pavement|crack|crater|highway|street/,
    detectedObject: 'Road Surface Damage — Pothole / Crater',
    title: 'Severe Pothole Causing Road Hazard',
    description: 'A large, deep pothole has been identified on the road surface that poses a serious risk to vehicles and cyclists. The road pavement has significantly deteriorated, exposing loose aggregate and creating a dangerous crater that may cause tire blowouts, vehicle damage, or accidents. Immediate repair and resurfacing is required by the municipal roads department.',
    category: 'Infrastructure',
    severity: 'High',
    confidence: 94,
    icon: '🕳️',
    color: '#f97316',
  },
  {
    keywords: /garbage|trash|dump|bin|litter|filth|waste|rubbish|plastic/,
    detectedObject: 'Unmanaged Garbage Accumulation',
    title: 'Illegal Garbage Dumping — Waste Overflow Detected',
    description: 'A large accumulation of uncollected municipal solid waste has been detected. The garbage has been illegally dumped and left unmanaged, creating a severe sanitation hazard. The waste pile is attracting pests and rodents, emitting foul odors, and poses a serious public health risk to nearby residents. Immediate waste clearance and sanitation disinfection is required.',
    category: 'Sanitation',
    severity: 'Medium',
    confidence: 91,
    icon: '🗑️',
    color: '#10b981',
  },
  {
    keywords: /sewage|sewer|overflow|leak|drain|water|flood|puddle|pipe/,
    detectedObject: 'Sewage or Stormwater Overflow',
    title: 'Sewage Overflow Causing Water Contamination',
    description: 'A critical sewage or stormwater overflow has been detected on the public road. Raw sewage water is overflowing onto the street, contaminating the surrounding environment and posing an extreme public health emergency. The overflow may contain harmful pathogens. Immediate intervention by the municipal sewage department is urgently required.',
    category: 'Sanitation',
    severity: 'Critical',
    confidence: 96,
    icon: '💧',
    color: '#06b6d4',
  },
  {
    keywords: /light|lamp|bulb|wire|spark|electric|dark|pole|cable/,
    detectedObject: 'Electrical Hazard — Open Cable / Broken Light',
    title: 'Exposed Live Electrical Wires — Life-Threatening Hazard',
    description: 'Exposed, live electrical wires or a severely damaged street light pole has been detected. This constitutes an immediate life-threatening hazard, especially to children and pedestrians. The wires may be carrying high voltage and pose risks of electrocution, fire, and severe burns. Emergency services and the municipal electricity department must be alerted immediately to cordon and repair the site.',
    category: 'Hazard',
    severity: 'Critical',
    confidence: 92,
    icon: '⚡',
    color: '#ef4444',
  },
  {
    keywords: /traffic|signal|jam|congestion|car|junction|crossing|gridlock/,
    detectedObject: 'Traffic Signal Malfunction / Road Congestion',
    title: 'Traffic Signal Failure Causing Major Congestion',
    description: 'A non-functional traffic signal or severe road congestion has been identified at a key intersection. The signal failure or blockage is causing significant traffic disruption, extended vehicle queuing, and risk of road accidents due to uncontrolled traffic flow. Traffic police assistance and signal maintenance is required to restore orderly traffic management.',
    category: 'Traffic',
    severity: 'Medium',
    confidence: 88,
    icon: '🚦',
    color: '#f59e0b',
  },
  {
    keywords: /graffiti|wall|vandal|paint|spray|damage|building/,
    detectedObject: 'Vandalism — Illegal Graffiti / Property Damage',
    title: 'Vandalism and Graffiti Defacement on Public Property',
    description: 'Vandalism in the form of unauthorized graffiti or property damage has been detected on public infrastructure. The defacement negatively impacts the aesthetic environment and may contain offensive content. Cleaning and restoration of the affected public property is required by the civic maintenance department.',
    category: 'Infrastructure',
    severity: 'Low',
    confidence: 85,
    icon: '🎨',
    color: '#8b5cf6',
  },
  {
    keywords: /manhole|open|cover|missing|collapse|pit|underground/,
    detectedObject: 'Open / Missing Manhole Cover — Fall Hazard',
    title: 'Open Manhole Cover Posing Imminent Fall Risk',
    description: 'An open or missing manhole cover has been detected on the public road or pavement. This creates an extreme fall hazard for pedestrians, cyclists, and motorists, especially in low-light conditions. A person or vehicle could fall into the manhole causing serious injury or death. The area must be barricaded and the manhole covered or secured immediately.',
    category: 'Hazard',
    severity: 'Critical',
    confidence: 97,
    icon: '⚠️',
    color: '#ef4444',
  },
];

const DEFAULT_PROFILE = {
  detectedObject: 'Civic Infrastructure Issue',
  title: 'Civic Issue Reported by Citizen',
  description: 'A civic infrastructure problem has been identified in the community area. The issue requires assessment and attention from the concerned municipal department. Based on visual inspection, the problem appears to impact the quality of life and safety of residents in the vicinity. Prompt action is requested from the appropriate authority to inspect and resolve this matter.',
  category: 'Infrastructure',
  severity: 'Medium',
  confidence: 76,
  icon: '🏙️',
  color: '#06b6d4',
};

/* ─── Typewriter Hook ────────────────────────────────── */
function useTypewriter(text, speed, active) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active || !text) { setDisplayed(''); setDone(false); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);
  return { displayed, done };
}

/* ─── Component ──────────────────────────────────────── */
export default function ReportIssue() {
  const navigate = useNavigate();
  const { token, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [existingIssues, setExistingIssues] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [address, setAddress] = useState('');
  const [latLng, setLatLng] = useState(null);

  // Media
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

  // AI state
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [fieldsReady, setFieldsReady] = useState(false);

  // Typewriter for description
  const { displayed: typedDescription, done: typingDone } = useTypewriter(
    aiResult ? aiResult.description : '',
    12,
    fieldsReady
  );

  // Duplicate check
  const [duplicateIssue, setDuplicateIssue] = useState(null);
  const [duplicateDistance, setDuplicateDistance] = useState(0);

  // Load existing issues for dup check
  useEffect(() => {
    fetch(`${API}/api/issues`)
      .then(r => r.ok && r.json())
      .then(d => d && setExistingIssues(d))
      .catch(() => {});
  }, []);

  // Duplicate proximity check
  useEffect(() => {
    if (!latLng || !category) { setDuplicateIssue(null); return; }
    const dup = existingIssues.find(issue => {
      if (issue.status === 'resolved' || issue.category.toLowerCase() !== category.toLowerCase()) return false;
      const dist = getDistance(latLng.lat, latLng.lng, issue.location.lat, issue.location.lng);
      if (dist <= 150) { setDuplicateDistance(Math.round(dist)); return true; }
      return false;
    });
    setDuplicateIssue(dup || null);
  }, [latLng, category, existingIssues]);

  // Reverse geocoding
  useEffect(() => {
    if (!latLng) return;
    const streets = ['Ring Road', 'Mandi House Outer Circle', 'RK Puram Main Crossing', 'Barakhamba Road', 'Safdarjung Lane 2'];
    const sectors = ['Sector 1', 'Sector 3', 'Sector 4', 'Sector 7', 'Safdarjung Enclave'];
    const si = Math.floor(Math.abs(latLng.lat * 100) % streets.length);
    const sc = Math.floor(Math.abs(latLng.lng * 100) % sectors.length);
    setAddress(`${streets[si]}, ${sectors[sc]}, New Delhi — ${latLng.lat.toFixed(4)}°N, ${latLng.lng.toFixed(4)}°E`);
  }, [latLng]);

  // Sync typewriter text into description state
  useEffect(() => {
    if (fieldsReady && typedDescription) setDescription(typedDescription);
  }, [typedDescription, fieldsReady]);

  /* ── AI Vision Scanner ───────────────────────────── */
  const runAiVisionScan = (file) => {
    setIsAiScanning(true);
    setAiResult(null);
    setFieldsReady(false);
    setScanPhase(1);
    setScanProgress(0);
    setTitle(''); setDescription(''); setCategory(''); setSeverity('');

    const fileName = file.name.toLowerCase();
    const profile = AI_VISION_PROFILES.find(p => p.keywords.test(fileName)) || DEFAULT_PROFILE;

    // Phase 1: Loading image (0→30%)
    let prog = 0;
    const p1 = setInterval(() => {
      prog = Math.min(prog + 2, 30);
      setScanProgress(prog);
      if (prog >= 30) clearInterval(p1);
    }, 60);

    setTimeout(() => {
      setScanPhase(2);
      // Phase 2: Detecting objects (30→65%)
      const p2 = setInterval(() => {
        prog = Math.min(prog + 2, 65);
        setScanProgress(prog);
        if (prog >= 65) clearInterval(p2);
      }, 55);

      setTimeout(() => {
        setScanPhase(3);
        // Phase 3: Classifying (65→100%)
        const p3 = setInterval(() => {
          prog = Math.min(prog + 3, 100);
          setScanProgress(prog);
          if (prog >= 100) clearInterval(p3);
        }, 50);

        setTimeout(() => {
          setScanPhase(4);
          setIsAiScanning(false);
          setAiResult(profile);
          // Stagger field fills for dramatic effect
          setTimeout(() => setTitle(profile.title), 100);
          setTimeout(() => setCategory(profile.category), 350);
          setTimeout(() => setSeverity(profile.severity), 600);
          setTimeout(() => setFieldsReady(true), 850); // triggers typewriter
        }, 1200);
      }, 900);
    }, 700);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    runAiVisionScan(file);
  };

  const refetchUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUser(await res.json());
    } catch {}
  };

  const handleMergeAndVerify = async () => {
    if (!duplicateIssue || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/issues/${duplicateIssue.id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { await refetchUser(); navigate(`/issue/${duplicateIssue.id}`); }
      else { const e = await res.json(); alert(e.error || 'Failed to verify.'); }
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !severity || !address || !latLng) {
      alert('Please fill in all details including a map location.');
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('title', title); fd.append('description', description);
    fd.append('category', category); fd.append('severity', severity);
    fd.append('address', address); fd.append('lat', latLng.lat); fd.append('lng', latLng.lng);
    if (mediaFile) fd.append('media', mediaFile);
    try {
      const res = await fetch(`${API}/api/issues`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) { await refetchUser(); navigate('/'); }
      else { const e = await res.json(); alert(e.error || 'Failed to submit.'); }
    } catch { alert('Error uploading to server.'); }
    finally { setSubmitting(false); }
  };

  const nextStep = () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      alert('Please specify a title and description first.'); return;
    }
    if (step === 2 && (!latLng || !address.trim())) {
      alert('Please drop a location pin on the map.'); return;
    }
    setStep(s => s + 1);
  };

  const SCAN_PHASES = ['', 'Loading image…', 'Detecting objects…', 'Classifying severity…', 'Analysis complete'];
  const severityColor = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 60px', maxWidth: '820px', margin: '0 auto' }}>

      {/* Back button */}
      <button onClick={() => navigate('/')} className="btn btn-secondary"
        style={{ marginBottom: '24px', padding: '6px 12px', border: 'none' }}>
        <ArrowLeft size={16} /> Dashboard Feed
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Report a Civic Issue
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Snap a photo — AI instantly identifies and fills the report automatically.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {['Info', 'Location', 'Review'].map((label, i) => (
              <React.Fragment key={label}>
                <span style={{ color: step >= i + 1 ? 'var(--primary)' : 'inherit', fontWeight: step >= i + 1 ? 700 : 400 }}>
                  {label}
                </span>
                {i < 2 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(step / 3) * 100}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.4s ease'
          }} />
        </div>

        <form onSubmit={handleSubmit}>

          {/* ══ STEP 1: Photo + AI Auto-Fill ══ */}
          {step === 1 && (
            <div className="animate-fade-in">

              {/* Photo Upload Zone */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Camera size={16} color="var(--primary)" />
                  <label className="form-label" style={{ margin: 0 }}>Take / Upload a Photo</label>
                  <span style={{
                    fontSize: '0.7rem', background: 'rgba(6,182,212,0.15)', color: 'var(--primary)',
                    padding: '2px 8px', borderRadius: '99px', fontWeight: 600,
                    border: '1px solid rgba(6,182,212,0.3)'
                  }}>
                    AI AUTO-DETECT
                  </span>
                </div>

                <div
                  onClick={() => !isAiScanning && fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: aiResult
                      ? `2px solid ${aiResult.color}55`
                      : isAiScanning
                        ? '2px solid var(--primary)'
                        : '2px dashed var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    minHeight: '220px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '16px',
                    background: isAiScanning
                      ? 'rgba(6,182,212,0.04)'
                      : aiResult ? `${aiResult.color}0a` : 'rgba(255,255,255,0.02)',
                    cursor: isAiScanning ? 'wait' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                    boxShadow: isAiScanning ? '0 0 30px rgba(6,182,212,0.15)' : aiResult ? `0 0 30px ${aiResult.color}22` : 'none'
                  }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={isAiScanning}
                  />

                  {/* Scanning overlay */}
                  {isAiScanning && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(7,10,19,0.88)',
                      backdropFilter: 'blur(4px)', gap: '20px', zIndex: 10
                    }}>
                      {/* Moving scan line */}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: '2px',
                        background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                        boxShadow: '0 0 12px var(--primary)',
                        top: `${scanProgress}%`, transition: 'top 0.1s linear', pointerEvents: 'none'
                      }} />
                      {/* Phase icons & info */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: '50%',
                          border: '2px solid var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 25px rgba(6,182,212,0.4)',
                          animation: 'reportPulse 1s ease-in-out infinite alternate'
                        }}>
                          {scanPhase === 1 && <Eye size={28} color="var(--primary)" />}
                          {scanPhase === 2 && <ScanLine size={28} color="var(--primary)" className="animate-spin" />}
                          {scanPhase === 3 && <Brain size={28} color="var(--primary)" />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                            {SCAN_PHASES[scanPhase]}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            Neural Vision AI · Civic Problem Classifier
                          </div>
                        </div>
                        <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${scanProgress}%`,
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                            transition: 'width 0.12s linear', borderRadius: '3px'
                          }} />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{scanProgress}% complete</div>
                      </div>
                    </div>
                  )}

                  {/* Image preview (not scanning) */}
                  {!isAiScanning && mediaPreviewUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px' }}>
                      <img src={mediaPreviewUrl} alt="Evidence" style={{
                        maxWidth: '260px', maxHeight: '180px',
                        borderRadius: 'var(--radius-sm)', objectFit: 'cover',
                        border: aiResult ? `2px solid ${aiResult.color}` : '2px solid var(--border-glass-hover)'
                      }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to replace photo</span>
                    </div>
                  ) : !isAiScanning ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '20px' }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(6,182,212,0.1)', border: '2px dashed rgba(6,182,212,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Camera size={30} color="var(--primary)" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--primary)' }}>Take a photo</span> or upload from gallery
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          AI will instantly detect the problem and fill this report automatically
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['🕳️ Potholes', '💧 Sewage', '⚡ Wires', '🗑️ Garbage', '⚠️ Manholes'].map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
                            color: 'var(--text-muted)'
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* AI Result Banner */}
              {aiResult && !isAiScanning && (
                <div className="glass-panel animate-fade-in" style={{
                  padding: '16px 20px', marginBottom: '24px',
                  background: `${aiResult.color}10`, borderColor: `${aiResult.color}44`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: `${aiResult.color}20`, border: `1px solid ${aiResult.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>{aiResult.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        <Sparkles size={14} color={aiResult.color} />
                        AI Detected: {aiResult.detectedObject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Confidence: <strong style={{ color: aiResult.color }}>{aiResult.confidence}%</strong> · All fields auto-filled below
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Done
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={10} /> {aiResult.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px', background: `${severityColor[aiResult.severity]}18`, color: severityColor[aiResult.severity], border: `1px solid ${severityColor[aiResult.severity]}44`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BarChart3 size={10} /> {aiResult.severity} Priority
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px', background: 'rgba(6,182,212,0.1)', color: 'var(--primary)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={10} /> Auto-Filled
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Issue Title</label>
                  {aiResult && !isAiScanning && (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Sparkles size={10} /> AI Auto-Filled
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Take a photo above — AI will generate a title automatically"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="form-control"
                  required
                  style={aiResult && !isAiScanning ? { borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' } : {}}
                />
              </div>

              {/* Description with typewriter */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Detailed Description</label>
                  {fieldsReady && !typingDone && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Brain size={10} className="animate-spin" /> AI Writing…
                    </span>
                  )}
                  {typingDone && (
                    <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <CheckCircle2 size={10} /> Ready
                    </span>
                  )}
                </div>
                <textarea
                  rows={5}
                  placeholder="Take a photo above — AI will write a detailed description of the problem automatically."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-control"
                  required
                  style={{
                    resize: 'vertical',
                    ...(fieldsReady && !typingDone
                      ? { borderColor: 'rgba(6,182,212,0.5)', boxShadow: '0 0 0 2px rgba(6,182,212,0.1)' }
                      : typingDone
                        ? { borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' }
                        : {})
                  }}
                />
              </div>

              {/* Category + Severity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Category</label>
                    {aiResult && !isAiScanning && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Sparkles size={10} /> AI Selected
                      </span>
                    )}
                  </div>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="form-control" required
                    style={aiResult && !isAiScanning ? { borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' } : {}}>
                    <option value="" disabled>Select Category</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Safety">Safety</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Hazard">Hazard</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Severity</label>
                    {aiResult && !isAiScanning && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                        <Sparkles size={10} /> AI Assessed
                      </span>
                    )}
                  </div>
                  <select value={severity} onChange={e => setSeverity(e.target.value)} className="form-control" required
                    style={aiResult && !isAiScanning ? { borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' } : {}}>
                    <option value="" disabled>Select Severity</option>
                    <option value="Low">Low (Aesthetic / Minor)</option>
                    <option value="Medium">Medium (Disruptive)</option>
                    <option value="High">High (Dangerous)</option>
                    <option value="Critical">Critical (Life Threatening)</option>
                  </select>
                </div>
              </div>

              {/* Tip hint */}
              {!mediaFile && !isAiScanning && (
                <div style={{
                  marginTop: '24px', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)',
                  fontSize: '0.82rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <Zap size={14} color="var(--primary)" />
                  <span><strong style={{ color: 'var(--primary)' }}>Tip:</strong> Upload a photo above to let AI instantly fill all fields — or fill them manually.</span>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2: Location ══ */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="form-group">
                <label className="form-label">Drop Pin on Exact Location</label>
                <MapSelector position={latLng} setPosition={setLatLng} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <AlertCircle size={12} /> Click on the map to pin exact coordinates.
                </div>
              </div>

              {duplicateIssue && (
                <div className="glass-panel animate-pulse-glow" style={{
                  padding: '16px 20px', background: 'rgba(245,158,11,0.08)',
                  borderColor: 'rgba(245,158,11,0.3)', marginBottom: '20px',
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle color="var(--status-progress)" size={20} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Duplicate Detector Alert</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        A similar <strong>{category}</strong> issue: <em>"{duplicateIssue.title}"</em> is already active <strong>{duplicateDistance}m away</strong>.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
                    <button type="button" onClick={handleMergeAndVerify} className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--status-progress), var(--severity-high))' }}
                      disabled={submitting}>
                      Merge &amp; Verify (+10 XP)
                    </button>
                    <button type="button" onClick={() => setDuplicateIssue(null)} className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', border: 'none' }}>
                      Report Anyway
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Derived Location Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" placeholder="Drop pin to generate address…" value={address}
                    onChange={e => setAddress(e.target.value)} className="form-control"
                    style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Review & Submit ══ */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--primary)" /> Review Your Report
              </h3>

              <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.2)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {mediaPreviewUrl && (
                    <img src={mediaPreviewUrl} alt="Evidence" style={{
                      width: 100, height: 75, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0,
                      border: aiResult ? `2px solid ${aiResult.color}` : '2px solid var(--border-glass)'
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {description}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
                        {category}
                      </span>
                      {severity && (
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '99px', background: `${severityColor[severity]}18`, color: severityColor[severity], border: `1px solid ${severityColor[severity]}44` }}>
                          {severity} Severity
                        </span>
                      )}
                      {aiResult && (
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '99px', background: 'rgba(6,182,212,0.1)', color: 'var(--primary)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Sparkles size={9} /> AI Detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {address && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--primary)" /> {address}
                  </div>
                )}
              </div>

              <div className="glass-panel animate-pulse-glow" style={{ padding: '16px', background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={28} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Citizen Engagement Bonus</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Submitting this report will earn you <strong>+50 XP</strong> and advance your Community Hero Rank.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary" disabled={submitting}>Back</button>
            ) : <div />}

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary" disabled={isAiScanning}>
                {isAiScanning
                  ? <><RefreshCw size={15} className="animate-spin" /> Scanning…</>
                  : <>Next Step <ArrowRight size={16} /></>}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={submitting}
                style={{ background: 'linear-gradient(135deg, var(--status-resolved), var(--primary))', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }}>
                {submitting ? 'Submitting…' : <><ShieldCheck size={16} /> Submit Civic Report</>}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes reportPulse {
          from { box-shadow: 0 0 15px rgba(6,182,212,0.3); }
          to   { box-shadow: 0 0 35px rgba(6,182,212,0.8); }
        }
      `}</style>
    </div>
  );
}

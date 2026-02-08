import { useEffect, useState } from "react";
import axios from "axios";
// Removed 'Zap' from the import list to fix the unused var error
import {
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
  Play,
  Trash2,
} from "lucide-react";
import "./App.css";

// Types
interface Stats {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
}

interface CardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3001/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // --- ACTIONS ---
  const handleAction = async (endpoint: string) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:3001/tasks/${endpoint}`);
      // Fetch stats immediately to update UI
      fetchStats();
    } catch (error) {
      // FIX: We now log the error so 'error' is "used"
      console.error("Action failed:", error);
      alert("Action failed! Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="loading">Connecting to System...</div>;

  return (
    <div className="dashboard-container">
      <h1>🚀 Distributed Task Control Center</h1>

      {/* METRICS GRID */}
      <div className="grid">
        <Card
          title="Waiting"
          value={stats.waiting}
          icon={<Layers />}
          color="blue"
        />
        <Card
          title="Active"
          value={stats.active}
          icon={<Activity />}
          color="orange"
        />
        <Card
          title="Scheduled"
          value={stats.delayed}
          icon={<Clock />}
          color="purple"
        />
        <Card
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle />}
          color="green"
        />
        <Card
          title="Failed"
          value={stats.failed}
          icon={<AlertTriangle />}
          color="red"
        />
      </div>

      {/* CONTROL PANEL */}
      <div className="controls-section">
        <h2>Actions</h2>
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={() => handleAction("add")}
            disabled={loading}
          >
            <Play size={18} /> Add 5 Tasks
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleAction("delayed")}
            disabled={loading}
          >
            <Clock size={18} /> Add Delayed Task (10s)
          </button>

          <button
            className="btn btn-danger"
            onClick={() => handleAction("reset")}
            disabled={loading}
          >
            <Trash2 size={18} /> Reset System
          </button>
        </div>
      </div>
    </div>
  );
}

const Card = ({ title, value, icon, color }: CardProps) => (
  <div className={`card border-${color}`}>
    <div className="icon-wrapper" style={{ color: color }}>
      {icon}
    </div>
    <div className="content">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

export default App;

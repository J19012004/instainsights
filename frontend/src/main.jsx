import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import ReactDOM from "react-dom/client";

import axios from "axios";

import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Download,
  Eye,
  FileText,
  Globe2,
  Filter,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./styles.css";

/* =========================================================
   API
========================================================= */

const api = axios.create({
  baseURL: "https://instainsights.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ii_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================================
   AUTH
========================================================= */

const Auth = createContext(null);

function useAuth() {
  return useContext(Auth);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ii_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem("ii_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "ii_token",
      response.data.access_token
    );

    const me = await api.get("/auth/me");

    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("ii_token");
    setUser(null);
  };

  return (
    <Auth.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </Auth.Provider>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    "demo@instainsights.local"
  );

  const [password, setPassword] = useState(
    "Demo@12345"
  );

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item?.msg || "Invalid input")
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else if (error.response?.status === 422) {
        setError(
          "The login request was rejected by the server. Please check the email and password."
        );
      } else if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(
          "Unable to connect to the InstaInsights server."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="authbox">
        <div className="brand">
          <i>
            <Sparkles size={18} />
          </i>

          <b>InstaInsights</b>
        </div>

        <small>
          SOCIAL ANALYTICS STUDIO
        </small>

        <h1>
          Turn content data into{" "}
          <em>clear decisions.</em>
        </h1>

        <p>
          Monitor growth, understand your audience
          and discover which content performs.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Sign in"}

            {!submitting && (
              <ArrowUpRight size={16} />
            )}
          </button>
        </form>

        <div className="demoLogin">
          Demo account: demo@instainsights.local
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

const navItems = [
  {
    label: "Overview",
    path: "/",
    icon: Home,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Content",
    path: "/content",
    icon: FileText,
  },
  {
    label: "Audience",
    path: "/audience",
    icon: Users,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: Download,
  },
];

function Sidebar({
  mobileOpen,
  setMobileOpen,
}) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`sidebar ${
        mobileOpen ? "sidebar-open" : ""
      }`}
    >
      <div className="sidebarTop">
        <div className="sidebarBrand">
          <div className="brandIcon">
            <Sparkles size={18} />
          </div>

          <div>
            <strong>InstaInsights</strong>
            <span>Analytics Studio</span>
          </div>
        </div>

        <button
          className="mobileClose"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="accountMini">
        <div className="avatar">
          NS
        </div>

        <div>
          <strong>
            {user?.name || "Nova Studio"}
          </strong>

          <span>
            @nova_studio
          </span>
        </div>

        <ChevronDown size={15} />
      </div>

      <nav className="sideNav">
        <div className="navCaption">
          WORKSPACE
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() =>
                setMobileOpen(false)
              }
              className={({ isActive }) =>
                `navItem ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="navCaption settingsCaption">
          ACCOUNT
        </div>

        <NavLink
          to="/profile"
          onClick={() =>
            setMobileOpen(false)
          }
          className={({ isActive }) =>
            `navItem ${
              isActive ? "active" : ""
            }`
          }
        >
          <Users size={17} />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          onClick={() =>
            setMobileOpen(false)
          }
          className={({ isActive }) =>
            `navItem ${
              isActive ? "active" : ""
            }`
          }
        >
          <SettingsIcon size={17} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebarBottom">
        <div className="sidebarHelp">
          <CircleHelp size={18} />

          <div>
            <strong>Need help?</strong>
            <span>View documentation</span>
          </div>
        </div>

        <button
          className="logoutBtn"
          onClick={logout}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   LAYOUT
========================================================= */

function Guard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loadingSpinner" />
        <span>Loading InstaInsights...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

function NotificationMenu({ onClose }) {
  return (
    <div className="notificationMenu">
      <div className="notificationHeader">
        <strong>Notifications</strong>

        <button
          className="notificationClose"
          onClick={onClose}
        >
          <X size={15} />
        </button>
      </div>

      <div className="notificationItem">
        <div className="notificationDot" />

        <div>
          <strong>
            Analytics updated
          </strong>

          <p>
            Your latest account metrics
            are available.
          </p>

          <span>Just now</span>
        </div>
      </div>

      <div className="notificationItem">
        <div className="notificationDot" />

        <div>
          <strong>
            Weekly performance
          </strong>

          <p>
            Your weekly performance
            summary is ready.
          </p>

          <span>Today</span>
        </div>
      </div>

      <div className="notificationFooter">
        You're all caught up.
      </div>
    </div>
  );
}

function Layout() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const location = useLocation();

  const titles = {
    "/": "Overview",
    "/analytics": "Analytics",
    "/content": "Content",
    "/audience": "Audience",
    "/reports": "Reports",
    "/profile": "Profile",
    "/settings": "Settings",
  };

  const title =
    titles[location.pathname] ||
    "Overview";

  return (
    <div className="appShell">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {mobileOpen && (
        <div
          className="sidebarOverlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <main className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <button
              className="menuBtn"
              onClick={() =>
                setMobileOpen(true)
              }
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="eyebrow">
                WORKSPACE
              </div>

              <h2>{title}</h2>
            </div>
          </div>

          <div className="topbarRight">
            <button
              className="iconBtn notificationButton"
              onClick={() =>
                setNotificationsOpen(
                  !notificationsOpen
                )
              }
              aria-label="Notifications"
            >
              <Bell size={18} />

              <span className="notificationIndicator" />
            </button>

            {notificationsOpen && (
              <NotificationMenu
                onClose={() =>
                  setNotificationsOpen(false)
                }
              />
            )}

            <div className="topAvatar">
              NS
            </div>
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US"
  ).format(Number(value));
}

function formatCompact(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(
      number / 1000000
    ).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(
      number / 1000
    ).toFixed(1)}K`;
  }

  return formatNumber(number);
}

function formatPercent(value) {
  return `${Number(
    value || 0
  ).toFixed(1)}%`;
}

function Card({
  children,
  className = "",
}) {
  return (
    <section
      className={`card ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="sectionHeader">
      <div>
        <h3>{title}</h3>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}) {
  return (
    <div className="kpiCard">
      <div className="kpiTop">
        <span>{title}</span>

        <div className="kpiIcon">
          <Icon size={17} />
        </div>
      </div>

      <strong>{value}</strong>

      <div
        className={`kpiChange ${
          positive
            ? "positive"
            : "negative"
        }`}
      >
        {positive ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}

        {change}
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview() {
  const [overview, setOverview] =
    useState(null);

  const [growth, setGrowth] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [period, setPeriod] =
    useState(30);

  const [periodOpen, setPeriodOpen] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get("/dashboard/overview"),
      api.get("/dashboard/growth"),
    ])
      .then(
        ([
          overviewRes,
          growthRes,
        ]) => {
          if (!mounted) return;

          setOverview(
            overviewRes.data
          );

          setGrowth(
            Array.isArray(
              growthRes.data
            )
              ? growthRes.data
              : growthRes.data?.data ||
                  []
          );
        }
      )
      .catch((error) => {
        console.error(
          "Dashboard error:",
          error
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fallbackGrowth = [
    {
      date: "Jun 1",
      followers: 18200,
    },
    {
      date: "Jun 15",
      followers: 19100,
    },
    {
      date: "Jul 1",
      followers: 20400,
    },
    {
      date: "Jul 15",
      followers: 21800,
    },
    {
      date: "Aug 1",
      followers: 22900,
    },
    {
      date: "Aug 15",
      followers: 24000,
    },
    {
      date: "Sep 1",
      followers: 24821,
    },
  ];

  const growthData =
    growth.length
      ? growth
      : fallbackGrowth;

  const visibleGrowth =
    growthData.length > period
      ? growthData.slice(-period)
      : growthData;

  const periodLabel =
    period === 7
      ? "Last 7 days"
      : period === 30
        ? "Last 30 days"
        : "Last 90 days";

  if (loading) {
    return (
      <div className="pageLoading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            ACCOUNT OVERVIEW
          </div>

          <h1>
            Here's your Instagram pulse.
          </h1>

          <p>
            A clear view of growth,
            engagement and content
            performance for{" "}
            <strong>@nova_studio</strong>.
          </p>
        </div>

        <div className="dropdownWrapper">
          <button
            className="secondaryBtn"
            onClick={() =>
              setPeriodOpen(!periodOpen)
            }
          >
            <CalendarDays size={16} />

            {periodLabel}

            <ChevronDown
              size={15}
            />
          </button>

          {periodOpen && (
            <div className="periodMenu">
              {[7, 30, 90].map(
                (days) => (
                  <button
                    key={days}
                    className={
                      period === days
                        ? "selected"
                        : ""
                    }
                    onClick={() => {
                      setPeriod(days);
                      setPeriodOpen(
                        false
                      );
                    }}
                  >
                    {days === 7
                      ? "Last 7 days"
                      : days === 30
                        ? "Last 30 days"
                        : "Last 90 days"}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="kpiGrid">
        <KpiCard
          title="Followers"
          value={formatCompact(
            overview?.followers ||
              24821
          )}
          change="+8.7%"
          icon={Users}
        />

        <KpiCard
          title="Engagement rate"
          value={
            overview?.engagement_rate
              ? formatPercent(
                  overview.engagement_rate
                )
              : "5.8%"
          }
          change="+0.9%"
          icon={Heart}
        />

        <KpiCard
          title="Reach"
          value={formatCompact(
            overview?.reach ||
              186400
          )}
          change="+12.4%"
          icon={Eye}
        />

        <KpiCard
          title="Posts"
          value={formatNumber(
            overview?.posts || 100
          )}
          change="+14 this month"
          icon={FileText}
        />
      </div>

      <div className="chartGrid singleChart">
        <Card>
          <SectionHeader
            title="Follower growth"
            description={`Audience size over the ${periodLabel.toLowerCase()}`}
          />

          <div className="chartBox">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={visibleGrowth}
              >
                <defs>
                  <linearGradient
                    id="growthFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.08}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                  }}
                  tickFormatter={
                    formatCompact
                  }
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="followers"
                  strokeWidth={2}
                  fill="url(#growthFill)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="contentGrid">
        <Card>
          <SectionHeader
            title="Recent content"
            description="Your latest posts"
            action={
              <Link
                to="/content"
                className="textLink"
              >
                View all
                <ArrowUpRight
                  size={14}
                />
              </Link>
            }
          />

          <div className="postList">
            {[
              {
                title:
                  "Building better habits, one day at a time.",
                type: "Reel",
                likes: "1.8K",
                comments: "142",
                engagement:
                  "8.4%",
              },
              {
                title:
                  "5 things I wish I knew before starting.",
                type: "Carousel",
                likes: "1.2K",
                comments: "87",
                engagement:
                  "6.9%",
              },
              {
                title:
                  "Sunday reset routine.",
                type: "Photo",
                likes: "948",
                comments: "61",
                engagement:
                  "5.8%",
              },
            ].map(
              (post, index) => (
                <div
                  className="postRow"
                  key={index}
                >
                  <div className="postThumb">
                    {index + 1}
                  </div>

                  <div className="postInfo">
                    <strong>
                      {post.title}
                    </strong>

                    <span>
                      {post.type}
                    </span>
                  </div>

                  <div className="postStat">
                    <Heart size={14} />
                    {post.likes}
                  </div>

                  <div className="postStat">
                    <MessageCircle
                      size={14}
                    />
                    {post.comments}
                  </div>

                  <div className="postEngagement">
                    {post.engagement}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Quick insights"
            description="Patterns worth noticing"
          />

          <div className="insightList">
            <div className="insightItem">
              <div className="insightIcon">
                <TrendingUp
                  size={17}
                />
              </div>

              <div>
                <strong>
                  Reels are driving reach
                </strong>

                <p>
                  Your short-form videos
                  generated more reach
                  than other formats.
                </p>
              </div>
            </div>

            <div className="insightItem">
              <div className="insightIcon">
                <Activity size={17} />
              </div>

              <div>
                <strong>
                  Friday is your strongest day
                </strong>

                <p>
                  Engagement is consistently
                  higher toward the end
                  of the week.
                </p>
              </div>
            </div>

            <div className="insightItem">
              <div className="insightIcon">
                <Users size={17} />
              </div>

              <div>
                <strong>
                  Audience is expanding
                </strong>

                <p>
                  Follower growth has
                  remained positive across
                  the selected period.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  const data = [
    {
      month: "Apr",
      followers: 18800,
      reach: 112000,
      engagement: 4.2,
    },
    {
      month: "May",
      followers: 19900,
      reach: 126000,
      engagement: 4.6,
    },
    {
      month: "Jun",
      followers: 21100,
      reach: 141000,
      engagement: 4.9,
    },
    {
      month: "Jul",
      followers: 22400,
      reach: 157000,
      engagement: 5.2,
    },
    {
      month: "Aug",
      followers: 23700,
      reach: 171000,
      engagement: 5.5,
    },
    {
      month: "Sep",
      followers: 24821,
      reach: 186400,
      engagement: 5.8,
    },
  ];

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            PERFORMANCE
          </div>

          <h1>Analytics</h1>

          <p>
            Track your account's growth
            and performance over time.
          </p>
        </div>

      </div>

      <Card>
        <SectionHeader
          title="Performance overview"
          description="Followers and reach over time"
        />

        <div className="largeChart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.08}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={
                  formatCompact
                }
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="reach"
                strokeWidth={2}
                fillOpacity={0.12}
              />

              <Area
                type="monotone"
                dataKey="followers"
                strokeWidth={2}
                fillOpacity={0.04}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Engagement rate"
          description="Monthly average engagement"
        />

        <div className="largeChart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.08}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `${v}%`
                }
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="engagement"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   CONTENT
========================================================= */

function Content() {
  const posts = [
    {
      title:
        "Building better habits, one day at a time.",
      type: "Reel",
      date: "Sep 28, 2026",
      reach: "32.4K",
      likes: "2,184",
      comments: "142",
      saves: "318",
      engagement: "8.4%",
    },
    {
      title:
        "5 things I wish I knew before starting.",
      type: "Carousel",
      date: "Sep 25, 2026",
      reach: "27.8K",
      likes: "1,842",
      comments: "119",
      saves: "274",
      engagement: "6.9%",
    },
    {
      title:
        "Sunday reset routine.",
      type: "Photo",
      date: "Sep 22, 2026",
      reach: "18.2K",
      likes: "948",
      comments: "61",
      saves: "127",
      engagement: "5.8%",
    },
    {
      title:
        "A simple morning routine.",
      type: "Reel",
      date: "Sep 19, 2026",
      reach: "24.6K",
      likes: "1,406",
      comments: "93",
      saves: "212",
      engagement: "7.1%",
    },
    {
      title:
        "What I learned this month.",
      type: "Carousel",
      date: "Sep 16, 2026",
      reach: "21.4K",
      likes: "1,137",
      comments: "78",
      saves: "184",
      engagement: "6.2%",
    },
  ];

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            CONTENT LIBRARY
          </div>

          <h1>
            Content performance
          </h1>

          <p>
            Understand which posts
            generate the strongest
            response.
          </p>
        </div>

      </div>

      <Card className="tableCard">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Content</th>
                <th>Type</th>
                <th>Date</th>
                <th>Reach</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Saves</th>
                <th>Engagement</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {posts.map(
                (post, index) => (
                  <tr key={index}>
                    <td>
                      <div className="tableContent">
                        <div className="tableThumb">
                          {index + 1}
                        </div>

                        <strong>
                          {post.title}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="typeBadge">
                        {post.type}
                      </span>
                    </td>

                    <td>
                      {post.date}
                    </td>

                    <td>
                      {post.reach}
                    </td>

                    <td>
                      {post.likes}
                    </td>

                    <td>
                      {post.comments}
                    </td>

                    <td>
                      {post.saves}
                    </td>

                    <td>
                      <strong>
                        {post.engagement}
                      </strong>
                    </td>

                    <td>
                      <button className="iconBtn">
                        <MoreHorizontal
                          size={17}
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   AUDIENCE
========================================================= */

function Audience() {
  const ageData = [
    {
      name: "18–24",
      value: 23,
    },
    {
      name: "25–34",
      value: 41,
    },
    {
      name: "35–44",
      value: 22,
    },
    {
      name: "45–54",
      value: 10,
    },
    {
      name: "55+",
      value: 4,
    },
  ];

  const genderData = [
    {
      name: "Women",
      value: 61,
    },
    {
      name: "Men",
      value: 37,
    },
    {
      name: "Other",
      value: 2,
    },
  ];

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            AUDIENCE
          </div>

          <h1>
            Know your audience.
          </h1>

          <p>
            Understand who follows you,
            where they are and when
            they are most active.
          </p>
        </div>

      </div>

      <div className="kpiGrid">
        <KpiCard
          title="Followers"
          value="24.8K"
          change="+8.7%"
          icon={Users}
        />

        <KpiCard
          title="Women"
          value="61%"
          change="+2.1%"
          icon={Users}
        />

        <KpiCard
          title="Top country"
          value="India"
          change="42% of audience"
          icon={Globe2}
        />

        <KpiCard
          title="Most active"
          value="7–9 PM"
          change="Local time"
          icon={Activity}
        />
      </div>

      <div className="twoColumn">
        <Card>
          <SectionHeader
            title="Age distribution"
            description="Share of followers by age"
          />

          <div className="chartBox">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={ageData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.08}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `${v}%`
                  }
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Gender"
            description="Audience composition"
          />

          <div className="donutWrap">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RechartsPieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {genderData.map(
                    (_, index) => (
                      <Cell
                        key={index}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>

            <div className="donutCenter">
              <strong>61%</strong>
              <span>Women</span>
            </div>
          </div>

          <div className="legendList">
            {genderData.map(
              (item) => (
                <div
                  key={item.name}
                >
                  <span>
                    {item.name}
                  </span>

                  <strong>
                    {item.value}%
                  </strong>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader
          title="Top locations"
          description="Where your audience is based"
        />

        <div className="locationGrid">
          {[
            ["India", "42%"],
            [
              "United States",
              "18%",
            ],
            [
              "United Kingdom",
              "8%",
            ],
            ["Australia", "6%"],
            ["Canada", "5%"],
            ["Singapore", "4%"],
          ].map(
            ([country, value]) => (
              <div
                className="locationItem"
                key={country}
              >
                <div className="locationIcon">
                  <Globe2 size={16} />
                </div>

                <span>
                  {country}
                </span>

                <strong>
                  {value}
                </strong>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports() {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const downloadCsv = async () => {
    setDownloading(true);
    setMessage("");

    try {
      const response = await api.get("/reports/export.csv", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "instainsights-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage("CSV report downloaded successfully.");
    } catch (error) {
      console.error("Report download error:", error);
      setMessage(
        "Unable to download the CSV report. Please make sure the backend is running."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            REPORTS
          </div>

          <h1>Download your report.</h1>

          <p>
            Export the current InstaInsights demo dataset as a
            CSV file for analysis, sharing, or submission.
          </p>
        </div>
      </div>

      <Card className="emptyState">
        <div className="emptyIcon">
          <Download size={26} />
        </div>

        <h2>CSV report</h2>

        <p>
          Download a structured CSV report containing the
          available Instagram analytics data.
        </p>

        <button
          className="primary small"
          onClick={downloadCsv}
          disabled={downloading}
        >
          <Download size={16} />
          {downloading
            ? "Preparing report..."
            : "Download CSV"}
        </button>

        {message && (
          <p style={{ marginTop: 14 }}>
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const { user } = useAuth();

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            ACCOUNT
          </div>

          <h1>Profile</h1>

          <p>
            Manage your InstaInsights
            account information.
          </p>
        </div>
      </div>

      <Card>
        <div className="profileHeader">
          <div className="profileAvatar">
            NS
          </div>

          <div>
            <h2>
              {user?.name ||
                "Nova Studio"}
            </h2>

            <p>
              {user?.email ||
                "demo@instainsights.local"}
            </p>
          </div>
        </div>

        <div className="formGrid">
          <label>
            Name

            <input
              value={
                user?.name ||
                "Nova Studio"
              }
              readOnly
            />
          </label>

          <label>
            Email

            <input
              value={
                user?.email ||
                "demo@instainsights.local"
              }
              readOnly
            />
          </label>

          <label>
            Instagram username

            <input
              value="@nova_studio"
              readOnly
            />
          </label>

          <label>
            Account type

            <input
              value="Instagram Analytics"
              readOnly
            />
          </label>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings() {
  const [notifications, setNotifications] =
    useState(true);

  const [weeklyReports, setWeeklyReports] =
    useState(true);

  return (
    <div className="dashboardPage">
      <div className="pageIntro">
        <div>
          <div className="eyebrow">
            ACCOUNT
          </div>

          <h1>Settings</h1>

          <p>
            Configure your dashboard
            preferences.
          </p>
        </div>
      </div>

      <Card>
        <SectionHeader
          title="Preferences"
          description="Choose how InstaInsights behaves."
        />

        <div className="settingsList">
          <div className="settingRow">
            <div>
              <strong>
                Notifications
              </strong>

              <p>
                Receive important workspace
                notifications.
              </p>
            </div>

            <button
              className={`switch ${
                notifications
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                setNotifications(
                  !notifications
                )
              }
            >
              <span />
            </button>
          </div>

          <div className="settingRow">
            <div>
              <strong>
                Weekly reports
              </strong>

              <p>
                Receive a weekly analytics
                summary.
              </p>
            </div>

            <button
              className={`switch ${
                weeklyReports
                  ? "on"
                  : ""
              }`}
              onClick={() =>
                setWeeklyReports(
                  !weeklyReports
                )
              }
            >
              <span />
            </button>
          </div>

          <div className="settingRow">
            <div>
              <strong>
                Data connection
              </strong>

              <p>
                Analytics are currently
                powered by the connected
                application dataset.
              </p>
            </div>

            <span className="statusPill">
              Connected
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<Guard />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={<Overview />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/content"
              element={<Content />}
            />

            <Route
              path="/audience"
              element={<Audience />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </AuthProvider>
  );
}

/* =========================================================
   START
========================================================= */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
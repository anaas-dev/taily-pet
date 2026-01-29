import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Eye, Clock, Users, Bell, AlertCircle, Settings, BarChart3, UserCog, Calendar, ChevronRight, Home, Ban, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface SitterApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  experience: string | null;
  hourly_rate: number | null;
  services: string[] | null;
  accepted_pet_types: string[] | null;
  accepted_pet_sizes: string[] | null;
  town: string;
  address: string | null;
  status: string;
  created_at: string;
}

interface AdminNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  sitter_id: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  role: string;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending_approval: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-gray-100 text-gray-800",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const [applications, setApplications] = useState<SitterApplication[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<SitterApplication | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  // Fetch all data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sitter applications
        const { data: apps } = await supabase
          .from("sitter_profiles")
          .select("*")
          .order("created_at", { ascending: false });
        setApplications(apps || []);

        // Fetch notifications
        const { data: notifs } = await supabase
          .from("admin_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        setNotifications(notifs || []);

        // Fetch users with roles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: roles } = await supabase
          .from("user_roles")
          .select("*");

        const usersWithRoles = (profiles || []).map((profile) => {
          const userRole = roles?.find((r) => r.user_id === profile.user_id);
          return {
            ...profile,
            role: userRole?.role || "user",
          };
        });
        setUsers(usersWithRoles);

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("id, date, status, created_at")
          .order("created_at", { ascending: false })
          .limit(100);
        setBookings(bookingsData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const sendNotificationEmail = async (email: string, firstName: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.functions.invoke("send-sitter-notification", {
        body: { email, firstName, status },
      });
      if (error) {
        console.error("Failed to send notification email:", error);
      }
    } catch (err) {
      console.error("Error invoking notification function:", err);
    }
  };

  const handleApprove = async (app: SitterApplication) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("sitter_profiles")
        .update({ status: "active" })
        .eq("id", app.id);

      if (error) throw error;

      await supabase.from("user_roles").upsert({
        user_id: app.user_id,
        role: "sitter",
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "active" } : a))
      );

      // Send approval email
      await sendNotificationEmail(app.email, app.first_name, "approved");

      toast.success(`${app.first_name} ${app.last_name} has been approved!`);
      setShowDetailDialog(false);
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (app: SitterApplication) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("sitter_profiles")
        .update({ status: "rejected" })
        .eq("id", app.id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "rejected" } : a))
      );

      // Send rejection email
      await sendNotificationEmail(app.email, app.first_name, "rejected");

      toast.success(`${app.first_name} ${app.last_name}'s application has been rejected`);
      setShowDetailDialog(false);
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async (app: SitterApplication) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("sitter_profiles")
        .update({ status: "suspended" })
        .eq("id", app.id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "suspended" } : a))
      );

      toast.success(`${app.first_name} ${app.last_name} has been suspended`);
      setShowDetailDialog(false);
    } catch (error) {
      console.error("Error suspending sitter:", error);
      toast.error("Failed to suspend sitter");
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivate = async (app: SitterApplication) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("sitter_profiles")
        .update({ status: "active" })
        .eq("id", app.id);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "active" } : a))
      );

      toast.success(`${app.first_name} ${app.last_name} has been reactivated`);
      setShowDetailDialog(false);
    } catch (error) {
      console.error("Error reactivating sitter:", error);
      toast.error("Failed to reactivate sitter");
    } finally {
      setProcessing(false);
    }
  };


  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      // First delete existing role, then insert new one
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole as "admin" | "user" | "sitter" });

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );

      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to update user role");
    }
  };

  const markNotificationRead = async (notifId: string) => {
    try {
      await supabase
        .from("admin_notifications")
        .update({ read: true })
        .eq("id", notifId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "pending_approval");
  const activeApps = applications.filter((a) => a.status === "active");
  const rejectedApps = applications.filter((a) => a.status === "rejected");
  const suspendedApps = applications.filter((a) => a.status === "suspended");
  const unreadNotifs = notifications.filter((n) => !n.read);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "sitters", label: "Sitter Approvals", icon: UserCog },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Admin Dashboard</span>
          </nav>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav className="sticky top-24 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.id === "sitters" && pendingApps.length > 0 && (
                      <Badge className="ml-auto bg-yellow-500 text-white">
                        {pendingApps.length}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

              {/* Mobile Tabs */}
              <div className="lg:hidden mb-6">
                <Select value={activeSection} onValueChange={setActiveSection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sidebarItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{users.length}</p>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-full">
                            <UserCog className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{activeApps.length}</p>
                            <p className="text-sm text-muted-foreground">Active Sitters</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <Clock className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{pendingApps.length}</p>
                            <p className="text-sm text-muted-foreground">Pending Approvals</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-100 rounded-full">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{bookings.length}</p>
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          Recent Notifications
                          {unreadNotifs.length > 0 && (
                            <Badge variant="secondary">{unreadNotifs.length} new</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {notifications.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No notifications</p>
                        ) : (
                          <div className="space-y-3">
                            {notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif.id}
                                className={`p-3 rounded-lg border cursor-pointer ${
                                  notif.read ? "bg-background" : "bg-primary/5 border-primary/20"
                                }`}
                                onClick={() => !notif.read && markNotificationRead(notif.id)}
                              >
                                <p className={notif.read ? "text-muted-foreground text-sm" : "text-sm font-medium"}>
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(notif.created_at), "MMM d, h:mm a")}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Pending Approvals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pendingApps.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No pending approvals</p>
                        ) : (
                          <div className="space-y-3">
                            {pendingApps.slice(0, 5).map((app) => (
                              <div
                                key={app.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-xs">
                                      {app.first_name[0]}{app.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{app.first_name} {app.last_name}</p>
                                    <p className="text-xs text-muted-foreground">{app.town}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowDetailDialog(true);
                                  }}
                                >
                                  Review
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Users Section */}
              {activeSection === "users" && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No users found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((userProfile) => (
                              <TableRow key={userProfile.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="text-xs">
                                        {(userProfile.first_name?.[0] || "U")}{(userProfile.last_name?.[0] || "")}
                                      </AvatarFallback>
                                    </Avatar>
                                    {userProfile.first_name || "Unknown"} {userProfile.last_name || ""}
                                  </div>
                                </TableCell>
                                <TableCell>{userProfile.email || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant={userProfile.role === "admin" ? "default" : "secondary"}>
                                    {userProfile.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {format(new Date(userProfile.created_at), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={userProfile.role}
                                    onValueChange={(value) => handleChangeRole(userProfile.user_id, value)}
                                  >
                                    <SelectTrigger className="w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="sitter">Sitter</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sitters Approval Section */}
              {activeSection === "sitters" && (
                <div className="space-y-6">
                  <Tabs defaultValue="pending">
                    <TabsList>
                      <TabsTrigger value="pending" className="relative">
                        Pending
                        {pendingApps.length > 0 && (
                          <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                            {pendingApps.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="active">Active ({activeApps.length})</TabsTrigger>
                      <TabsTrigger value="suspended">Suspended ({suspendedApps.length})</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                      <Card>
                        <CardHeader>
                          <CardTitle>Pending Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {pendingApps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No pending applications</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {pendingApps.map((app) => (
                                <ApplicationCard
                                  key={app.id}
                                  app={app}
                                  onView={() => {
                                    setSelectedApp(app);
                                    setShowDetailDialog(true);
                                  }}
                                  onApprove={() => handleApprove(app)}
                                  onReject={() => handleReject(app)}
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="active">
                      <Card>
                        <CardHeader>
                          <CardTitle>Active Sitters</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {activeApps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No active sitters</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activeApps.map((app) => (
                                <ApplicationCard
                                  key={app.id}
                                  app={app}
                                  onView={() => {
                                    setSelectedApp(app);
                                    setShowDetailDialog(true);
                                  }}
                                  onSuspend={() => handleSuspend(app)}
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="suspended">
                      <Card>
                        <CardHeader>
                          <CardTitle>Suspended Sitters</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {suspendedApps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No suspended sitters</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {suspendedApps.map((app) => (
                                <ApplicationCard
                                  key={app.id}
                                  app={app}
                                  onView={() => {
                                    setSelectedApp(app);
                                    setShowDetailDialog(true);
                                  }}
                                  onReactivate={() => handleReactivate(app)}
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="rejected">
                      <Card>
                        <CardHeader>
                          <CardTitle>Rejected Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {rejectedApps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>No rejected applications</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {rejectedApps.map((app) => (
                                <ApplicationCard
                                  key={app.id}
                                  app={app}
                                  onView={() => {
                                    setSelectedApp(app);
                                    setShowDetailDialog(true);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Reports Section */}
              {activeSection === "reports" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reports & Analytics</CardTitle>
                    <CardDescription>View platform statistics and generate reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Filters */}
                      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-[200px]">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input id="start-date" type="date" className="mt-1" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input id="end-date" type="date" className="mt-1" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="bookings">Bookings</SelectItem>
                              <SelectItem value="users">Users</SelectItem>
                              <SelectItem value="sitters">Sitters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button>Generate Report</Button>
                        </div>
                      </div>

                      {/* Placeholder Stats */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">{bookings.length}</p>
                              <p className="text-sm text-muted-foreground">Total Bookings</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600">{activeApps.length}</p>
                              <p className="text-sm text-muted-foreground">Active Sitters</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                              <p className="text-sm text-muted-foreground">Registered Users</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Detailed Analytics Coming Soon</p>
                        <p className="text-sm">Charts and detailed reports will be available here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>Configure platform-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* General Settings */}
                      <div className="space-y-4">
                        <h3 className="font-medium">General</h3>
                        <div className="space-y-4 pl-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Platform Status</p>
                              <p className="text-sm text-muted-foreground">Enable or disable the platform</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Maintenance Mode</p>
                              <p className="text-sm text-muted-foreground">Show maintenance message to users</p>
                            </div>
                            <Switch />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Allow New Registrations</p>
                              <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Settings */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Contact Information</h3>
                        <div className="space-y-4 pl-4">
                          <div className="grid gap-4 max-w-md">
                            <div>
                              <Label htmlFor="contact-email">Support Email</Label>
                              <Input 
                                id="contact-email" 
                                type="email" 
                                placeholder="support@taily.com"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-phone">Support Phone</Label>
                              <Input 
                                id="contact-phone" 
                                type="tel" 
                                placeholder="+1 (555) 000-0000"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button onClick={() => toast.info("Settings saved (placeholder)")}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review the sitter application below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-lg">
                      {selectedApp.first_name[0]}{selectedApp.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedApp.first_name} {selectedApp.last_name}
                    </h3>
                    <p className="text-muted-foreground">{selectedApp.email}</p>
                    <Badge className={statusColors[selectedApp.status]}>
                      {selectedApp.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedApp.phone || "Not provided"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      {selectedApp.town}
                    </div>
                    {selectedApp.address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {selectedApp.address}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApp.bio || "No bio provided"}
                  </p>
                </div>

                {/* Experience */}
                {selectedApp.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">{selectedApp.experience}</p>
                  </div>
                )}

                <Separator />

                {/* Services */}
                <div>
                  <h4 className="font-medium mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.services?.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">None specified</span>}
                  </div>
                </div>

                {/* Pet Types */}
                <div>
                  <h4 className="font-medium mb-2">Accepted Pet Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.accepted_pet_types?.map((type) => (
                      <Badge key={type} variant="outline">
                        {type}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">None specified</span>}
                  </div>
                </div>

                {/* Pet Sizes */}
                <div>
                  <h4 className="font-medium mb-2">Accepted Pet Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.accepted_pet_sizes?.map((size) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">None specified</span>}
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <h4 className="font-medium mb-2">Hourly Rate</h4>
                  <p className="text-lg font-semibold text-primary">
                    €{selectedApp.hourly_rate || "Not specified"}
                  </p>
                </div>

                <Separator />

                {/* Applied Date */}
                <div className="text-sm text-muted-foreground">
                  Applied on {format(new Date(selectedApp.created_at), "MMMM d, yyyy")}
                </div>
              </div>

              {selectedApp.status === "pending_approval" && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedApp)}
                    disabled={processing}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedApp)} disabled={processing}>
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}

              {selectedApp.status === "active" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleSuspend(selectedApp)}
                    disabled={processing}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Sitter
                  </Button>
                </DialogFooter>
              )}

              {selectedApp.status === "suspended" && (
                <DialogFooter>
                  <Button
                    onClick={() => handleReactivate(selectedApp)}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reactivate Sitter
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

// Application Card Component
const ApplicationCard = ({
  app,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}: {
  app: SitterApplication;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onSuspend?: () => void;
  onReactivate?: () => void;
}) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>
          {app.first_name[0]}{app.last_name[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">
          {app.first_name} {app.last_name}
        </p>
        <p className="text-sm text-muted-foreground">{app.town} • {app.email}</p>
        <div className="flex gap-2 mt-1">
          {app.services?.slice(0, 2).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {(app.services?.length || 0) > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{(app.services?.length || 0) - 2} more
            </Badge>
          )}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge className={statusColors[app.status]}>
        {app.status.replace("_", " ")}
      </Badge>
      <Button variant="ghost" size="icon" onClick={onView}>
        <Eye className="w-4 h-4" />
      </Button>
      {app.status === "pending_approval" && (
        <>
          <Button variant="ghost" size="icon" onClick={onReject} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onApprove} className="text-green-600 hover:text-green-700">
            <Check className="w-4 h-4" />
          </Button>
        </>
      )}
      {app.status === "active" && onSuspend && (
        <Button variant="ghost" size="icon" onClick={onSuspend} className="text-orange-600 hover:text-orange-700" title="Suspend sitter">
          <Ban className="w-4 h-4" />
        </Button>
      )}
      {app.status === "suspended" && onReactivate && (
        <Button variant="ghost" size="icon" onClick={onReactivate} className="text-green-600 hover:text-green-700" title="Reactivate sitter">
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

export default AdminDashboard;

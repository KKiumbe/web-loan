import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { AccountCircle, Menu as MenuIcon, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useThemeStore } from "../store/authStore";
import axios from "axios";
import { getTheme } from "../store/theme";

const Navbar = () => {
  const { darkMode, toggleTheme } = useThemeStore();
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sms, setSMS] = useState("N/A"); // Initialize with "N/A"
  const [floatBalance, setFloatBalance] = useState("N/A"); // Initialize with "N/A"
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const BASEURL = import.meta.env.VITE_BASE_URL;
  const theme = getTheme(darkMode ? "dark" : "light");

  const isAdmin = useMemo(() => {
    return currentUser?.role?.includes("ADMIN") || false;
  }, [currentUser]);

  const hasFetchedBalance = useRef(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileToggle = () => {
    if (!profileOpen && currentUser) {
      setUserDetails({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    }
    setEditMode(false);
    setProfileOpen(!profileOpen);
  };

  const fetchSMSBalance = useCallback(async () => {
    try {
      const response = await axios.get(`${BASEURL}/get-sms-balance`, { withCredentials: true });
      setSMS(response.data.credit ?? "N/A");
    } catch (error) {
      console.error("Error fetching SMS balance:", error);
      setSMS("N/A");
    }
  }, [BASEURL]);

  const fetchFloatBalance = useCallback(async () => {
    try {
      console.log("🔁 Calling fetchFloatBalance...");
      const response = await axios.get(`${BASEURL}/latest-mpesa-balance`, { withCredentials: true });
      setFloatBalance(response.data.data?.utilityAccountBalance ?? "N/A");
    } catch (error) {
      console.error("Error fetching float balance:", error);
      setFloatBalance("N/A");
    }
  }, [BASEURL]);

  useEffect(() => {
    fetchSMSBalance();

    if (isAdmin && !hasFetchedBalance.current) {
      fetchFloatBalance();
      hasFetchedBalance.current = true;
    }
  }, [isAdmin, fetchSMSBalance, fetchFloatBalance]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      setUserDetails((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
    }
  };

  const handleInputChange = (field) => (e) => {
    setUserDetails((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdateUser = async () => {
    const { firstName, email, phoneNumber, currentPassword, password, confirmPassword } = userDetails;

    if (!firstName || !email) {
      setSnackbar({ open: true, message: "First name and email are required", severity: "error" });
      return;
    }
    if ((currentPassword || password || confirmPassword) && (!currentPassword || !password)) {
      setSnackbar({
        open: true,
        message: "Current and new passwords are required to change password",
        severity: "error",
      });
      return;
    }
    if (password && password !== confirmPassword) {
      setSnackbar({ open: true, message: "New passwords do not match", severity: "error" });
      return;
    }
    if (password && password.length < 6) {
      setSnackbar({
        open: true,
        message: "New password must be at least 6 characters",
        severity: "error",
      });
      return;
    }

    const payload = {};
    if (firstName) payload.firstName = firstName;
    if (userDetails.lastName) payload.lastName = userDetails.lastName;
    if (email) payload.email = email;
    if (phoneNumber) payload.phoneNumber = phoneNumber;
    if (currentPassword && password) {
      payload.currentPassword = currentPassword;
      payload.password = password;
    }

    try {
      const response = await axios.put(`${BASEURL}/update-user`, payload, { withCredentials: true });
      if (response) {
        navigate("/login");
      }
      setSnackbar({ open: true, message: "Profile updated successfully", severity: "success" });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Error updating profile: " + (error.response?.data?.message || error.message),
        severity: "error",
      });
    }
  };

  const profileDrawer = (
    <Box sx={{ width: 300 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Profile</Typography>
        <IconButton onClick={handleEditToggle} sx={{ color: darkMode ? theme.palette.greenAccent.main : "#000" }}>
          <Edit />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {currentUser ? (
        <List>
          {editMode ? (
            <>
              {["firstName", "lastName", "email", "phoneNumber", "currentPassword", "password", "confirmPassword"].map(
                (field) => (
                  <ListItem key={field}>
                    <TextField
                      label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      value={userDetails[field]}
                      onChange={handleInputChange(field)}
                      fullWidth
                      size="small"
                      type={field.toLowerCase().includes("password") ? "password" : "text"}
                      sx={{ input: { color: darkMode ? "#fff" : "#000" } }}
                    />
                  </ListItem>
                )
              )}
              <ListItem>
                <Button variant="contained" color="primary" onClick={handleUpdateUser} fullWidth sx={{ mb: 1 }}>
                  Save Changes
                </Button>
              </ListItem>
              <ListItem>
                <Button variant="outlined" color="secondary" onClick={handleEditToggle} fullWidth>
                  Cancel
                </Button>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem>
                <ListItemText primary="Tenant" secondary={currentUser.tenant?.name || "N/A"} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={`${currentUser.firstName || "N/A"} ${currentUser.lastName || ""}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={currentUser.email || "N/A"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Phone" secondary={currentUser.phoneNumber || "N/A"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Gender" secondary={currentUser.gender || "N/A"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="County" secondary={currentUser.county || "N/A"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Town" secondary={currentUser.town || "N/A"} />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </List>
      ) : (
        <Typography>No user data available</Typography>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ width: "100%", zIndex: 1100 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: { xs: 1, md: 2 } }} paddingLeft={10}>
              TAQA
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>SMS Balance: {sms}</Typography>
            {isAdmin && <Typography>Float Balance: KES {floatBalance}</Typography>}
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? "🌙" : "☀️"}
            </IconButton>
            <IconButton color="inherit" onClick={handleProfileToggle}>
              <AccountCircle />
            </IconButton>
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: "250px" } }}
      >
        <List>
          <ListItem button onClick={toggleTheme}>
            <ListItemText primary={darkMode ? "Dark Mode" : "Light Mode"} />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Drawer
        anchor="right"
        open={profileOpen}
        onClose={handleProfileToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: "300px",
            bgcolor: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#000",
          },
        }}
      >
        {profileDrawer}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ height: "64px" }} />
    </>
  );
};

export default Navbar;
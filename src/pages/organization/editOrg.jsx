import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TitleComponent from "../../components/title";
import { useAuthStore } from "../../store/authStore";

const EditOrganization = () => {
  const BASEURL = import.meta.env.VITE_BASE_URL;
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [tenant, setTenant] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    county: "",
    town: "",
    address: "",
    building: "",
    street: "",
    website: "",
    approvalSteps: "",
    loanLimitMultiplier: "",
    interestRate: "",
    interestRateType: "",
    dailyInterestRate: "",
    baseInterestRate: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  // Fetch initial tenant and organization data
  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const response = await axios.get(`${BASEURL}/tenants/${currentUser.tenantId}`, {
          withCredentials: true,
        });
        // Merge tenant and organization data
        const tenantData = response.data.tenant;
        setTenant({
          name: tenantData.name || "",
          email: tenantData.email || "",
          phoneNumber: tenantData.phoneNumber || "",
          alternativePhoneNumber: tenantData.alternativePhoneNumber || "",
          county: tenantData.county || "",
          town: tenantData.town || "",
          address: tenantData.address || "",
          building: tenantData.building || "",
          street: tenantData.street || "",
          website: tenantData.website || "",
         
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to load organization details for editing.",
          severity: "error",
        });
      }
    };

    if (currentUser?.tenantId) {
      fetchTenantDetails();
    } else {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleFieldChange = (field, value) => {
    setTenant((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
    } else {
      setSnackbar({
        open: true,
        message: "Please select a valid image file.",
        severity: "error",
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!tenant.name.trim()) {
      newErrors.name = "Organization name is required";
    }
    if (tenant.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email)) {
      newErrors.email = "Invalid email format";
    }
    if (tenant.phoneNumber && !/^\+?\d{10,15}$/.test(tenant.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format (10-15 digits)";
    }
    if (tenant.alternativePhoneNumber && !/^\+?\d{10,15}$/.test(tenant.alternativePhoneNumber)) {
      newErrors.alternativePhoneNumber = "Invalid alternative phone number format (10-15 digits)";
    }
    if (tenant.website && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(tenant.website)) {
      newErrors.website = "Invalid website URL";
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare payload for tenant and organization update
      const payload = {
        name: tenant.name.trim(),
        email: tenant.email || undefined,
        phoneNumber: tenant.phoneNumber || undefined,
        alternativePhoneNumber: tenant.alternativePhoneNumber || undefined,
        county: tenant.county || undefined,
        town: tenant.town || undefined,
        address: tenant.address || undefined,
        building: tenant.building || undefined,
        street: tenant.street || undefined,
        website: tenant.website || undefined,
      
      };

      // Update tenant and organization details
      await axios.put(`${BASEURL}/tenants/${currentUser.tenantId}`, payload, {
        withCredentials: true,
      });

      // Update logo if a new file is selected
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        await axios.put(`${BASEURL}/logo-upload/${currentUser.tenantId}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSnackbar({
        open: true,
        message: "Organization updated successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/org-details"), 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to update organization. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        ml: { xs: 0, md: 2, lg: 4 },
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: "100%",
          boxShadow: theme.shadows[3],
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
            >
              <TitleComponent title="Edit Organization Profile" />
            </Typography>
          </Box>
          <Divider sx={{ mb: 4, bgcolor: theme.palette.grey[300] }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                value={tenant.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={tenant.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={tenant.phoneNumber || ""}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternative Phone Number"
                value={tenant.alternativePhoneNumber || ""}
                onChange={(e) => handleFieldChange("alternativePhoneNumber", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.alternativePhoneNumber}
                helperText={errors.alternativePhoneNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="County"
                value={tenant.county || ""}
                onChange={(e) => handleFieldChange("county", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.county}
                helperText={errors.county}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Town"
                value={tenant.town || ""}
                onChange={(e) => handleFieldChange("town", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.town}
                helperText={errors.town}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={tenant.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Building"
                value={tenant.building || ""}
                onChange={(e) => handleFieldChange("building", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.building}
                helperText={errors.building}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                value={tenant.street || ""}
                onChange={(e) => handleFieldChange("street", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.street}
                helperText={errors.street}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={tenant.website || ""}
                onChange={(e) => handleFieldChange("website", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.website}
                helperText={errors.website}
              />
            </Grid>
          
        
         
      
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, color: theme.palette.text.secondary, fontWeight: "medium" }}
              >
                Update Logo
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: `1px dashed ${theme.palette.grey[400]}`,
                  borderRadius: "8px",
                  p: 2,
                  bgcolor: theme.palette.grey[100],
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ flexGrow: 1 }}
                />
                {logoFile && (
                  <Typography variant="body2" sx={{ ml: 2, color: theme.palette.text.secondary }}>
                    {logoFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                textTransform: "none",
                px: 3,
                py: 1,
                fontSize: "1rem",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/org-details")}
              disabled={loading}
              sx={{
                color: theme.palette.grey[700],
                borderColor: theme.palette.grey[400],
                textTransform: "none",
                px: 3,
                py: 1,
                fontSize: "1rem",
                "&:hover": { borderColor: theme.palette.grey[500] },
              }}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            bgcolor: snackbar.severity === "error" ? theme.palette.error.light : theme.palette.success.light,
            color: theme.palette.text.primary,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditOrganization;
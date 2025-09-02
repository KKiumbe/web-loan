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

  const [formData, setFormData] = useState({
    name: "",
    approvalSteps: "",
    loanLimitMultiplier: "",
    interestRate: "",
    interestRateType: "",
    dailyInterestRate: "",
    baseInterestRate: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  // Fetch organization data
  useEffect(() => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: "Please log in to continue.",
        severity: "error",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Restrict to ADMIN or ORG_ADMIN
    if (!currentUser.role.includes("ADMIN") && !currentUser.role.includes("ORG_ADMIN")) {
      setSnackbar({
        open: true,
        message: "Unauthorized: Only admins can edit organization details.",
        severity: "error",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    const fetchOrganizationDetails = async () => {
      try {
        // Assume organizationId is from currentUser or route params
        const orgId = currentUser.organizationId || 1; // Replace with actual orgId
        const response = await axios.get(`${BASEURL}/organizations/${orgId}`, {
          withCredentials: true,
        });
        const org = response.data;
        setFormData({
          name: org.name || "",
          approvalSteps: org.approvalSteps?.toString() || "",
          loanLimitMultiplier: (org.loanLimitMultiplier * 100)?.toString() || "", // Convert to percentage
          interestRate: (org.interestRate * 100)?.toString() || "", // Convert to percentage
          interestRateType: org.interestRateType || "",
          dailyInterestRate: (org.dailyInterestRate * 100)?.toString() || "", // Convert to percentage
          baseInterestRate: (org.baseInterestRate * 100)?.toString() || "", // Convert to percentage
          status: org.status || "",
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to load organization details.",
          severity: "error",
        });
      }
    };

    if (currentUser.tenantId) {
      fetchOrganizationDetails();
    }
  }, [currentUser, navigate]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    }
    if (formData.approvalSteps && (isNaN(formData.approvalSteps) || formData.approvalSteps < 0)) {
      newErrors.approvalSteps = "Approval steps must be a non-negative integer";
    }
    if (formData.loanLimitMultiplier && (isNaN(formData.loanLimitMultiplier) || formData.loanLimitMultiplier <= 0)) {
      newErrors.loanLimitMultiplier = "Loan limit multiplier must be a positive number";
    }
    if (formData.interestRate && (isNaN(formData.interestRate) || formData.interestRate < 0)) {
      newErrors.interestRate = "Interest rate must be a non-negative number";
    }
    if (formData.interestRateType && !["DAILY", "MONTHLY"].includes(formData.interestRateType)) {
      newErrors.interestRateType = "Interest rate type must be DAILY or MONTHLY";
    }
    if (formData.interestRateType === "DAILY") {
      if (!formData.dailyInterestRate || isNaN(formData.dailyInterestRate) || formData.dailyInterestRate <= 0) {
        newErrors.dailyInterestRate = "Daily interest rate is required and must be positive for DAILY type";
      }
      if (!formData.baseInterestRate || isNaN(formData.baseInterestRate) || formData.baseInterestRate <= 0) {
        newErrors.baseInterestRate = "Base interest rate is required and must be positive for DAILY type";
      }
    }
    if (formData.status && !["ACTIVE", "SUSPENDED", "PENDING"].includes(formData.status)) {
      newErrors.status = "Status must be ACTIVE, SUSPENDED, or PENDING";
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
      const orgId = currentUser.organizationId || 1; // Replace with actual orgId
      const payload = {
        name: formData.name.trim(),
        approvalSteps: formData.approvalSteps ? Number(formData.approvalSteps) : undefined,
        loanLimitMultiplier: formData.loanLimitMultiplier ? Number(formData.loanLimitMultiplier) / 100 : undefined,
        interestRate: formData.interestRate ? Number(formData.interestRate) / 100 : undefined,
        interestRateType: formData.interestRateType || undefined,
        dailyInterestRate: formData.dailyInterestRate ? Number(formData.dailyInterestRate) / 100 : undefined,
        baseInterestRate: formData.baseInterestRate ? Number(formData.baseInterestRate) / 100 : undefined,
        status: formData.status || undefined,
      };

      await axios.put(`${BASEURL}/organizations/${orgId}`, payload, {
        withCredentials: true,
      });

      setSnackbar({
        open: true,
        message: "Organization updated successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/org-details"), 1000);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update organization.";
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
      setErrors({ server: msg });
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
            <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>
              <TitleComponent title="Edit Organization Profile" />
            </Typography>
          </Box>
          <Divider sx={{ mb: 4, bgcolor: theme.palette.grey[300] }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                variant="outlined"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Approval Steps"
                value={formData.approvalSteps}
                onChange={(e) => handleFieldChange("approvalSteps", e.target.value)}
                variant="outlined"
                type="number"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.approvalSteps}
                helperText={errors.approvalSteps}
                inputProps={{ min: "0" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loan Limit Multiplier (%)"
                value={formData.loanLimitMultiplier}
                onChange={(e) => handleFieldChange("loanLimitMultiplier", e.target.value)}
                variant="outlined"
                type="number"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.loanLimitMultiplier}
                helperText={errors.loanLimitMultiplier}
                inputProps={{ min: "0", step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                value={formData.interestRate}
                onChange={(e) => handleFieldChange("interestRate", e.target.value)}
                variant="outlined"
                type="number"
                sx={{ bgcolor: theme.palette.background.paper }}
                error={!!errors.interestRate}
                helperText={errors.interestRate}
                inputProps={{ min: "0", step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.interestRateType}>
                <InputLabel>Interest Rate Type</InputLabel>
                <Select
                  value={formData.interestRateType}
                  onChange={(e) => handleFieldChange("interestRateType", e.target.value)}
                  label="Interest Rate Type"
                  variant="outlined"
                  sx={{ bgcolor: theme.palette.background.paper }}
                >
                  <MenuItem value="">
                    <em>Select Type</em>
                  </MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
                {errors.interestRateType && (
                  <Typography variant="caption" color="error">
                    {errors.interestRateType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {formData.interestRateType === "DAILY" && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Daily Interest Rate (%)"
                    value={formData.dailyInterestRate}
                    onChange={(e) => handleFieldChange("dailyInterestRate", e.target.value)}
                    variant="outlined"
                    type="number"
                    sx={{ bgcolor: theme.palette.background.paper }}
                    error={!!errors.dailyInterestRate}
                    helperText={errors.dailyInterestRate}
                    inputProps={{ min: "0", step: "0.01" }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Base Interest Rate (%)"
                    value={formData.baseInterestRate}
                    onChange={(e) => handleFieldChange("baseInterestRate", e.target.value)}
                    variant="outlined"
                    type="number"
                    sx={{ bgcolor: theme.palette.background.paper }}
                    error={!!errors.baseInterestRate}
                    helperText={errors.baseInterestRate}
                    inputProps={{ min: "0", step: "0.01" }}
                    required
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  label="Status"
                  variant="outlined"
                  sx={{ bgcolor: theme.palette.background.paper }}
                >
                  <MenuItem value="">
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error">
                    {errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {errors.server && (
            <Typography sx={{ color: theme.palette.error.main, fontSize: "0.9rem", mt: 2, textAlign: "center" }}>
              {errors.server}
            </Typography>
          )}

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
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TitleComponent from "../components/title";
import { useAuthStore } from "../store/authStore";
import { getTheme } from "../store/theme";

const Organization = () => {
  const BASEURL = import.meta.env.VITE_BASE_URL;
  const theme = getTheme();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const { data } = await axios.get(
          `${BASEURL}/tenants/${currentUser.tenantId}`, // or `/tenants/${currentUser.tenantId}`, depending on your route
          { withCredentials: true }
        );
        setTenant(data.tenant);
      } catch (err) {
        console.error(err);
        setError("Unable to retrieve organization details at this time.");
        setSnackbar({
          open: true,
          message: "Failed to load organization details. Please try again later.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.tenantId) {
      fetchTenantDetails();
    } else {
      setError("No tenant ID found for the current user.");
      setLoading(false);
    }
  }, [currentUser]);

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleEditClick = () => {
    navigate("/organization/edit");
  };

  const renderField = (label, value) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
        {value ?? "Not provided"}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        width: "100%",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
       
      }}
    >
      {loading ? (
        <Box sx={{ mt: 10, textAlign: "center" }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 10, textAlign: "center" }}>
          <Typography variant="h6" >
            {error}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              color: theme.primary.main,
              borderColor: theme.primary.main,
            }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <Card sx={{ maxWidth: 900, width: "100%", boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h4" >
                <TitleComponent title="Organization Profile" />
              </Typography>
              <Button
                variant="contained"
                onClick={handleEditClick}
              
              >
                Edit Profile
              </Button>
            </Box>
            <Divider />

            <Grid container spacing={4}>
              {/* Logo */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={`${tenant.name} Logo`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: 150,
                        objectFit: "contain",
                        borderRadius: 8,
                        border: `1px solid ${theme.grey[300]}`,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 150,
                        height: 150,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                       
                        borderRadius: 1,
                        
                      }}
                    >
                      <Typography >No Logo</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Details */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {renderField("Name", tenant.name)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Status", tenant.status)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Subscription Plan", tenant.subscriptionPlan)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Monthly Charge", tenant.monthlyCharge != null ? `$${tenant.monthlyCharge}` : null)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Organizations", tenant.organizationCount)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Allowed Users", tenant.allowedUsers)}
                  </Grid>
                  <Grid item xs={12}>
                    {renderField("Email", tenant.email)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Phone Number", tenant.phoneNumber)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Alternative Phone", tenant.alternativePhoneNumber)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("County", tenant.county)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Town", tenant.town)}
                  </Grid>
                  <Grid item xs={12}>
                    {renderField("Address", tenant.address)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Building", tenant.building)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {renderField("Street", tenant.street)}
                  </Grid>
                  <Grid item xs={12}>
                    {renderField("Website", tenant.website)}
                  </Grid>
                  <Grid item xs={12}>
                    {renderField(
                      "Created At",
                      tenant.createdAt ? new Date(tenant.createdAt).toLocaleString() : null
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    {renderField(
                      "Updated At",
                      tenant.updatedAt ? new Date(tenant.updatedAt).toLocaleString() : null
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
         
           
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Organization;

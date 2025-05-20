import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  padding: theme.spacing(1, 3),
}));

const AddUser = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const BASEURL = import.meta.env.VITE_BASE_URL;
  //const { tenantId } = useAuthStore((state) => state.currentUser);

  const [userData, setUserData] = useState({
    phoneNumber: "",
    idNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${BASEURL}/adduser`,
        { ...userData },
        { withCredentials: true }
      );
      alert("User created successfully!");
      navigate("/users");
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.response?.data?.message || "Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        ml: { xs: 0, md: 55 },
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <StyledCard sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Register User
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ID Number"
                  name="idNumber"
                  value={userData.idNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <StyledButton
              type="submit"
              variant="contained"
              sx={{ mt: 3, bgcolor: theme.palette.primary.main }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Register"}
            </StyledButton>
          </form>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default AddUser;

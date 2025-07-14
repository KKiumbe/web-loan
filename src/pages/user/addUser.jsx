import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  MenuItem,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch employees without user accounts
  useEffect(() => {
const fetchEmployees = async () => {
  try {
    const res = await axios.get(`${BASEURL}/customers/employee`, {
      withCredentials: true,
    });

    // ✅ Fix here
    setEmployees(res.data.data.data || []);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    setError("Failed to load employees");
  } finally {
    setFetching(false);
  }
};


    fetchEmployees();
  }, [BASEURL]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      await axios.post(
  `${BASEURL}/adduser`,
  {
    employeeId: Number(formData.employeeId), // enforce number type
    password: formData.password,
  },
  { withCredentials: true }
);

    


      alert("User created successfully!");
      navigate("/users");
    } catch (err) {
      console.error("User creation failed:", err);
      setError(err.response?.data?.message || "Failed to create user");
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
           Register Employee as a User
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {fetching ? (
                  <CircularProgress />
                ) : (
                  <TextField
                    fullWidth
                    select
                    label="Select Employee"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  >

                    {Array.isArray(employees) && employees.length > 0 ? (
  employees.map((emp) => (
    <MenuItem key={emp.id} value={emp.id}>
      {emp.firstName} {emp.lastName}
    </MenuItem>
  ))
) : (
  <MenuItem disabled>No available employees</MenuItem>
)}

                   


                  </TextField>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
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

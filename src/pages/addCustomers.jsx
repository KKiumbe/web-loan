import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../components/title';
import { useAuthStore } from '../store/authStore';
import { getTheme } from '../store/theme';

export default function CreateEmployeeScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    idNumber: '',
    grossSalary: '',
    organizationId: '',
  });
  const [organizations, setOrganizations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const currentUser = useAuthStore((state) => state.currentUser);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();

  useEffect(() => {
    // Check if currentUser exists and has EMPLOYEE role
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'Please log in to continue.',
        severity: 'error',
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
 

    fetchOrganizations();
  }, [currentUser, navigate]);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/organizations`, { withCredentials: true });
      const orgs = res.data || [];
      console.log('Organizations:', orgs);
      setOrganizations(orgs);
      if (orgs.length === 1) {
        setFormData((prev) => ({ ...prev, organizationId: orgs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setSnackbar({ open: true, message: 'Failed to load organizations', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber || !/^\+?\d{10,12}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Valid phone number is required (10-12 digits)';
    if (!formData.idNumber || !/^\d{7,9}$/.test(formData.idNumber))
      newErrors.idNumber = 'Valid ID number is required (7-9 digits)';
    if (!formData.grossSalary || parseFloat(formData.grossSalary) <= 0)
      newErrors.grossSalary = 'Gross salary must be a positive number';
    if (!formData.organizationId) newErrors.organizationId = 'Organization is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/create-employee`,
        {
          ...formData,
          grossSalary: parseFloat(formData.grossSalary), // Ensure grossSalary is a number
        },
        { withCredentials: true }
      );
      setSnackbar({
        open: true,
        message: res.data.message || 'Employee created successfully',
        severity: 'success',
      });
      setTimeout(() => navigate('/employees'), 2000);
    } catch (err) {
      console.error('Error creating employee:', err);
      const msg = err.response?.data?.error || 'Failed to create employee';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      setErrors({ server: msg }); // Display server error in form
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.default, minHeight: '100vh', width: '100vw', p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: theme.palette.text.primary }}>
        <TitleComponent title="Add Employee" />
      </Typography>
      <Paper
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          bgcolor: theme.palette.background.paper,
          width: '100%',
          maxWidth: 800,
          mx: 'auto',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                error={!!errors.idNumber}
                helperText={errors.idNumber}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gross Salary (KES)"
                name="grossSalary"
                type="number"
                value={formData.grossSalary}
                onChange={handleChange}
                error={!!errors.grossSalary}
                helperText={errors.grossSalary}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.organizationId}>
                <InputLabel>Organization</InputLabel>
                <Select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  label="Organization"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Select Organization</em>
                  </MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name} (Employees: {org.employeeCount || 0}, Loans: {org.loanCount || 0})
                    </MenuItem>
                  ))}
                </Select>
                {errors.organizationId && (
                  <Typography variant="caption" color="error">
                    {errors.organizationId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
          {errors.server && (
            <Typography sx={{ color: theme.palette.error.main, fontSize: '0.9rem', mt: 2, textAlign: 'center' }}>
              {errors.server}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/employees')}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                ':hover': { borderColor: theme.palette.primary.dark },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: theme?.palette?.greenAccent?.main,
                ':hover': { bgcolor: theme?.palette?.greenAccent?.dark },
              }}
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            borderRadius: 2,
            bgcolor: theme.palette[snackbar.severity].main,
            color: theme.palette[snackbar.severity].contrastText,
            fontSize: '0.9rem',
            alignItems: 'center',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
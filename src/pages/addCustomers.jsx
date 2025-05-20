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
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const currentUser = useAuthStore((state) => state.currentUser);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();

  useEffect(() => {
    if (!currentUser) return;
    fetchOrganizations();
  }, [currentUser]);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/organizations`, { withCredentials: true });
      const orgs = res.data || [];
      console.log(`orgs`, orgs);
      setOrganizations(orgs);
      if (orgs.length === 1) {
        setFormData((prev) => ({ ...prev, organizationId: orgs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setSnackbar({ open: true, message: 'Failed to load organizations' });
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
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    if (!formData.grossSalary || formData.grossSalary <= 0)
      newErrors.grossSalary = 'Gross salary must be positive';
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
      const res = await axios.post(`${BASE_URL}/create-employee`, formData, {
        withCredentials: true,
      });
      setSnackbar({ open: true, message: res.data.message || 'Employee created' });
      setTimeout(() => navigate('/employees'), 2000);
    } catch (err) {
      console.error('Error creating employee:', err);
      setSnackbar({ open: true, message: 'Failed to create employee' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Add Employee" />
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                error={!!errors.idNumber}
                helperText={errors.idNumber}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Gross Salary"
                name="grossSalary"
                type="number"
                value={formData.grossSalary}
                onChange={handleChange}
                error={!!errors.grossSalary}
                helperText={errors.grossSalary}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.organizationId}>
                <InputLabel>Organization</InputLabel>
                <Select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  label="Organization"
                >
                  <MenuItem value="">
                    <em>Select Organization</em>
                  </MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name} (Employees: {org.employeeCount}, Loans: {org.loanCount})
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
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/employees')} fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ backgroundColor: theme?.palette?.greenAccent?.main, color: '#fff' }}
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
        message={snackbar.message}
      />
    </Box>
  );
}

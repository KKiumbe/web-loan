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
import TitleComponent from '../../components/title';
import { useAuthStore } from '../../store/authStore';
import { getTheme } from '../../store/theme';

export default function CreateOrgAdminScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
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
    // Fetch available organizations
    axios
      .get(`${BASE_URL}/organizations`, { withCredentials: true })
      .then((res) => setOrganizations(res.data || []))
      .catch((err) => {
        console.error('Failed to load organizations:', err);
        setSnackbar({ open: true, message: 'Failed to load organizations' });
      });
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.organizationId) newErrors.organizationId = 'Organization is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
      organizationId: Number(formData.organizationId),
    };

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/create-org-admin`,
        payload,
        { withCredentials: true }
      );
      setSnackbar({ open: true, message: res.data.message || 'Org Admin created' });
      setTimeout(() => navigate(`/org-admins`), 2000);
    } catch (err) {
      console.error('Error creating Org Admin:', err);
      const apiError = err.response?.data?.error;
      setSnackbar({ open: true, message: apiError || 'Failed to create Org Admin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Add Organization Admin" />
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
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
                      {org.name}
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
            <Button variant="outlined" onClick={() => navigate(-1)} fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin'}
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

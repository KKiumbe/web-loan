import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../components/title';
import { getTheme } from '../store/theme';
import { useAuthStore } from '../store/authStore';

export default function CreateOrganizationScreen() {
  const [formData, setFormData] = useState({
    name: '',
    approvalSteps: '',
    loanLimitMultiplier: '',
    interestRate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://taqa.co.ke/api';
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    if (!currentUser) return;
  }, [currentUser]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }
    if (formData.approvalSteps !== '') {
      const steps = Number(formData.approvalSteps);
      if (!Number.isInteger(steps) || steps < 0) {
        newErrors.approvalSteps = 'Approval steps must be a non-negative integer';
      }
    }
    if (formData.loanLimitMultiplier !== '') {
      const multiplier = Number(formData.loanLimitMultiplier);
      if (isNaN(multiplier) || multiplier <= 0) {
        newErrors.loanLimitMultiplier = 'Loan limit multiplier must be a positive number';
      }
    }
    if (formData.interestRate !== '') {
      const rate = Number(formData.interestRate);
      if (isNaN(rate) || rate < 0) {
        newErrors.interestRate = 'Interest rate must be a non-negative number';
      }
    }
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

    const payload = { name: formData.name.trim() };
    if (formData.approvalSteps !== '') payload.approvalSteps = Number(formData.approvalSteps);
    if (formData.loanLimitMultiplier !== '') payload.loanLimitMultiplier = Number(formData.loanLimitMultiplier);
    if (formData.interestRate !== '') payload.interestRate = Number(formData.interestRate);

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/create-org`,
        payload,
        { withCredentials: true }
      );
      setSnackbar({ open: true, message: res.data.message || 'Organization created' });
      setTimeout(() => navigate('/organizations'), 2000);
    } catch (err) {
      console.error('Error creating organization:', err);
      const apiError = err.response?.data?.error;
      setSnackbar({ open: true, message: apiError || 'Failed to create organization' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper, minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Add Organization" />
      </Typography>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Approval Steps"
                name="approvalSteps"
                type="number"
                value={formData.approvalSteps}
                onChange={handleChange}
                error={!!errors.approvalSteps}
                helperText={errors.approvalSteps || 'Enter 0 for auto-approval'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Loan Limit Multiplier"
                name="loanLimitMultiplier"
                type="number"
                value={formData.loanLimitMultiplier}
                onChange={handleChange}
                error={!!errors.loanLimitMultiplier}
                helperText={errors.loanLimitMultiplier}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                error={!!errors.interestRate}
                helperText={errors.interestRate}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/organizations')} fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ backgroundColor: theme?.palette?.greenAccent?.main, color: '#fff' }}
            >
              {loading ? 'Creating...' : 'Create Organization'}
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
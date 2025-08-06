import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';

export default function CreateOrganizationScreen() {
  const [formData, setFormData] = useState({
    name: '',
    approvalSteps: '',
    loanLimitMultiplier: '',
    interestRate: '',
    interestRateType: '',
    dailyInterestRate: '',
    baseInterestRate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      // Clear irrelevant interest rate when changing interestRateType
      if (name === 'interestRateType') {
        if (value === 'DAILY') {
          newFormData.dailyInterestRate = '';
        } else if (value === 'MONTHLY') {
          newFormData.interestRate = '';
        }
      }
      return newFormData;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

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
    if (formData.interestRateType !== '') {
      if (!['DAILY', 'MONTHLY'].includes(formData.interestRateType)) {
        newErrors.interestRateType = 'Interest rate type must be "DAILY" or "WEEKLY"';
      } else {
        if (formData.interestRateType === 'DAILY') {
          if (formData.dailyInterestRate === '') {
            newErrors.dailyInterestRate = 'Daily interest rate is required when type is DAILY';
          } else {
            const dailyRate = Number(formData.dailyInterestRate);
            if (isNaN(dailyRate) || dailyRate < 0) {
              newErrors.dailyInterestRate = 'Daily interest rate must be a non-negative number';
            }
          }
          if (formData.interestRate !== '') {
            newErrors.interestRate = 'Interest rate should not be set when type is DAILY';
          }
        } else if (formData.interestRateType === 'MONTHLY') {
          if (formData.interestRate === '') {
            newErrors.interestRate = 'Interest rate is required when type is WEEKLY';
          } else {
            const rate = Number(formData.interestRate);
            if (isNaN(rate) || rate < 0) {
              newErrors.interestRate = 'Interest rate must be a non-negative number';
            }
          }
          if (formData.dailyInterestRate !== '') {
            newErrors.dailyInterestRate = 'Daily interest rate should not be set when type is WEEKLY';
          }
        }
      }
    } else {
      if (formData.interestRate !== '') {
        newErrors.interestRate = 'Interest rate type must be selected when setting interest rate';
      }
      if (formData.dailyInterestRate !== '') {
        newErrors.dailyInterestRate = 'Interest rate type must be selected when setting daily interest rate';
      }
    }
    if (formData.baseInterestRate !== '') {
      const baseRate = Number(formData.baseInterestRate);
      if (isNaN(baseRate) || baseRate < 0) {
        newErrors.baseInterestRate = 'Base interest rate must be a non-negative number';
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
      setSnackbar({ open: true, message: 'Please correct the errors in the form' });
      return;
    }

    const payload = { name: formData.name.trim() };
    if (formData.approvalSteps !== '') payload.approvalSteps = Number(formData.approvalSteps);
    if (formData.loanLimitMultiplier !== '') payload.loanLimitMultiplier = Number(formData.loanLimitMultiplier);
    if (formData.interestRate !== '') payload.interestRate = Number(formData.interestRate);
    if (formData.interestRateType !== '') {
      payload.interestRateType = formData.interestRateType === 'DAILY' ? 'MONTHLY' : formData.interestRateType;
    }
    if (formData.dailyInterestRate !== '') payload.dailyInterestRate = Number(formData.dailyInterestRate);
    if (formData.baseInterestRate !== '') payload.baseInterestRate = Number(formData.baseInterestRate);

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/create-org`, payload, {
        withCredentials: true,
      });
      setSnackbar({ open: true, message: res.data.message || 'Organization created successfully' });
      setTimeout(() => navigate('/organizations'), 2000);
    } catch (err) {
      console.error('Error creating organization:', err);
      const apiError = err.response?.data?.error || 'Failed to create organization';
      setSnackbar({ open: true, message: apiError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{  minHeight: '100vh', p: 4  }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Add Organization" />
      </Typography>
      <Paper sx={{ p: 5, maxWidth: 950,  mx: '5%', }}>
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
                required
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
                helperText={errors.approvalSteps || 'Enter 0 for auto-approval, 1-3 for manual approval'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Loan Limit Multiplier (%)"
                name="loanLimitMultiplier"
                type="number"
                value={formData.loanLimitMultiplier}
                onChange={handleChange}
                error={!!errors.loanLimitMultiplier}
                helperText={errors.loanLimitMultiplier || 'Percentage of salary, 100% for no limit'}
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
                disabled={formData.interestRateType === 'DAILY'}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.interestRateType}>
                <InputLabel>Interest Rate Type</InputLabel>
                <Select
                  name="interestRateType"
                  value={formData.interestRateType}
                  onChange={handleChange}
                  label="Interest Rate Type"
                >
                  <MenuItem value="">None</MenuItem>
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Daily Interest Rate (%)"
                name="dailyInterestRate"
                type="number"
                value={formData.dailyInterestRate}
                onChange={handleChange}
                error={!!errors.dailyInterestRate}
                helperText={errors.dailyInterestRate}
                disabled={formData.interestRateType === 'MONTHLY'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Base Interest Rate (%)"
                name="baseInterestRate"
                type="number"
                value={formData.baseInterestRate}
                onChange={handleChange}
                error={!!errors.baseInterestRate}
                helperText={errors.baseInterestRate}
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
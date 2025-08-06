import { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TitleComponent from '../../components/title';
import { getTheme } from '../../store/theme';
import { useAuthStore } from '../../store/authStore';

export default function EditOrg() {
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  // Convert decimal to percentage for display

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    axios
      .get(`${BASE_URL}/organizations/${id}`, { withCredentials: true })
      .then((res) => {
        const org = res.data;
        console.log(`response data ${JSON.stringify(org)}`);
        setFormData({
          name: org.name || '',
          approvalSteps: org.approvalSteps?.toString() || '',
          loanLimitMultiplier: org.loanLimitMultiplier || '',
          interestRate: org.interestRateType === 'MONTHLY' ? org.interestRate || '' : '',
          interestRateType: org.interestRateType || '',
          dailyInterestRate: org.interestRateType === 'DAILY' ? org.dailyInterestRate || '' : '',
          baseInterestRate: org.baseInterestRate || '',
        });
      })
      .catch((err) => {
        console.error('Failed to load organization:', err);
        setSnackbar({ open: true, message: 'Failed to load organization data', severity: 'error' });
      });
  }, [id, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      // Clear irrelevant interest rate when changing interestRateType
      if (name === 'interestRateType') {
        if (value === 'MONTHLY') {
          newFormData.dailyInterestRate = '';
        } else if (value === 'DAILY') {
          newFormData.interestRate = '';
        } else {
          newFormData.interestRate = '';
          newFormData.dailyInterestRate = '';
        }
      }
      return newFormData;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.approvalSteps !== '') {
      const approval = Number(formData.approvalSteps);
      if (!Number.isInteger(approval) || approval < 0 || approval > 3) {
        newErrors.approvalSteps = 'Must be a number between 0 and 3';
      }
    }

    if (formData.loanLimitMultiplier !== '') {
      const loanLimit = Number(formData.loanLimitMultiplier);
      if (isNaN(loanLimit) || loanLimit < 1 || loanLimit > 10000) {
        newErrors.loanLimitMultiplier = 'Must be between 1 and 10000 (e.g., 150 for 150%)';
      }
    }

    if (formData.interestRateType !== '') {
      if (!['MONTHLY', 'DAILY'].includes(formData.interestRateType)) {
        newErrors.interestRateType = 'Must be MONTHLY or DAILY';
      } else {
        if (formData.interestRateType === 'MONTHLY') {
          if (formData.interestRate === '') {
            newErrors.interestRate = 'Monthly interest rate is required when type is MONTHLY';
          } else {
            const interest = Number(formData.interestRate);
            if (isNaN(interest) || interest < 0 || interest > 100) {
              newErrors.interestRate = 'Must be between 0 and 100 (e.g., 5 for 5%)';
            }
          }
          if (formData.dailyInterestRate !== '') {
            newErrors.dailyInterestRate = 'Daily interest rate should not be set when type is MONTHLY';
          }
        } else if (formData.interestRateType === 'DAILY') {
          if (formData.dailyInterestRate === '') {
            newErrors.dailyInterestRate = 'Daily interest rate is required when type is DAILY';
          } else {
            const dailyInterest = Number(formData.dailyInterestRate);
            if (isNaN(dailyInterest) || dailyInterest < 0 || dailyInterest > 100) {
              newErrors.dailyInterestRate = 'Must be between 0 and 100 (e.g., 1 for 1%)';
            }
          }
          if (formData.interestRate !== '') {
            newErrors.interestRate = 'Monthly interest rate should not be set when type is DAILY';
          }
        }
      }
    } else {
      if (formData.interestRate !== '') {
        newErrors.interestRate = 'Interest rate type must be selected when setting monthly interest rate';
      }
      if (formData.dailyInterestRate !== '') {
        newErrors.dailyInterestRate = 'Interest rate type must be selected when setting daily interest rate';
      }
    }

    if (formData.baseInterestRate !== '') {
      const baseInterest = Number(formData.baseInterestRate);
      if (isNaN(baseInterest) || baseInterest < 0 || baseInterest > 100) {
        newErrors.baseInterestRate = 'Must be between 0 and 100 (e.g., 5 for 5%)';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setSnackbar({ open: true, message: 'Please correct the errors in the form', severity: 'error' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      approvalSteps: formData.approvalSteps !== '' ? Number(formData.approvalSteps) : undefined,
      loanLimitMultiplier: formData.loanLimitMultiplier !== '' ? formData.loanLimitMultiplier : undefined,
      interestRate: formData.interestRateType === 'MONTHLY' && formData.interestRate !== '' ? formData.interestRate : undefined,
      interestRateType: formData.interestRateType || undefined,
      dailyInterestRate: formData.interestRateType === 'DAILY' && formData.dailyInterestRate !== '' ? formData.dailyInterestRate : undefined,
      baseInterestRate: formData.baseInterestRate !== '' ? formData.baseInterestRate : undefined,
    };

    setLoading(true);
    try {
      const res = await axios.put(`${BASE_URL}/organizations/${id}`, payload, {
        withCredentials: true,
      });
      setSnackbar({ open: true, message: res.data.message || 'Organization updated successfully', severity: 'success' });
      setTimeout(() => navigate('/organizations'), 2000);
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.error || 'Update failed';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{  minHeight: '100vh', p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        <TitleComponent title="Edit Organization" />
      </Typography>
      <Paper sx={{ p: 5, maxWidth: 950, mx: '5%' }}>
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
                helperText={errors.loanLimitMultiplier || 'Enter a value between 1 and 10000 (e.g., 150 for 150%)'}
                inputProps={{ step: '1' }}
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
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                </Select>
                {errors.interestRateType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {errors.interestRateType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Monthly Interest Rate (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleChange}
                error={!!errors.interestRate}
                helperText={errors.interestRate || 'Enter a rate between 0 and 100 (e.g., 5 for 5%)'}
                disabled={formData.interestRateType !== 'MONTHLY'}
                inputProps={{ step: '1' }}
              />
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
                helperText={errors.dailyInterestRate || 'Enter a rate between 0 and 100 (e.g., 1 for 1%)'}
                disabled={formData.interestRateType !== 'DAILY'}
                inputProps={{ step: '1' }}
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
                helperText={errors.baseInterestRate || 'Enter a rate between 0 and 100 (e.g., 5 for 5%)'}
                inputProps={{ step: '1' }}
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
              disabled={loading}
              fullWidth
              sx={{ backgroundColor: theme?.palette?.greenAccent?.main, color: '#fff' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'error' ? theme.palette.error.light : theme.palette.success.light,
            color: theme.palette.text.primary,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}